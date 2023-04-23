import { QueryTypes } from 'sequelize';
import { AccessTokenError } from '../data_access/errors.js';
import spotifyApi, { SpotifyTrack } from '../data_access/spotify.data.js';
import userDb from '../data_access/user.data.js';
import userTrackHistoryDb from '../data_access/usertrackhistory.data.js';
import { IUserTrackHistory } from '../models/usertrackhistory.model.js';
import trackService from './track.service.js';
import { models, sequelize } from '../models/_index.js';
import auth0API from '../data_access/auth0.data.js';
import { StyleType, Timeframe } from '../models/user.model.js';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs';

/**
 * Type used to represent a users top tracks, albums or artists.
 */
type TopItems = Array<{
  id: string;
  artistName: string;
  artwork: string;
  count: number;
  trackName?: string;
  albumName?: string;
}>;

/**
 * Handles all user logic.
 */
const userService = (() => {
  /**
   * Requests the first access token using the code returned by the Spotify API when
   * a user first authenticates.
   * Update user record with the access and refresh tokens to use in all future requests.
   * @param userId Id of the user.
   * @param code Spotify authorization code from the initial authorization request.
   * @param redirectUri redirect_uri supplied when requesting the authorization code
   * on the front end.
   */
  const authenticateSpotifyUser = async (
    userId: string,
    code: string,
    redirectUri: string
  ): Promise<void> => {
    const user = await userDb.getUserById(userId);
    const res = await spotifyApi.requestAccessToken(code, redirectUri);
    user.spotifyAccessToken = res.access_token;
    user.spotifyTokenExpires = new Date(Date.now() + res.expires_in * 1000);
    user.spotifyRefreshToken = res.refresh_token;
    userDb.updateUser(userId, user);
  };

  /**
   * Returns the Spotify access token for the user.
   * Checks if the access token has expired and requests a new token if it has.
   * @param userId Id of the user.
   * @returns Spotify access token.
   */
  const getSpotifyAccessToken = async (userId: string): Promise<string> => {
    const user = await userDb.getUserById(userId);
    if (
      !user.spotifyAccessToken ||
      !user.spotifyRefreshToken ||
      !user.spotifyTokenExpires
    ) {
      throw new AccessTokenError('User must authenticate with Spotify');
    }
    // Subtract 2 minutes from the current time to account for any latency.
    const currentDatetime = new Date(Date.now() - 120 * 1000);
    if (user.spotifyTokenExpires > currentDatetime) {
      return user.spotifyAccessToken;
    }
    const res = await spotifyApi.requestRefreshedAccessToken(
      user.spotifyRefreshToken
    );
    user.spotifyAccessToken = res.access_token;
    user.spotifyTokenExpires = new Date(Date.now() + res.expires_in * 1000);
    // Spotify API can sometimes return a new refresh token.
    if (res.refresh_token) {
      user.spotifyRefreshToken = res.refresh_token;
    }
    userDb.updateUser(userId, user);
    return res.access_token;
  };

  /**
   * Updates the users streaming history using the Spotify API and returns
   * the requested number of tracks last streamed.
   * @param userId Id of the user.
   * @param limit Number of tracks to return.
   */
  const updateTrackHistory = async (
    userId: string,
    limit: number
  ): Promise<Array<IUserTrackHistory>> => {
    const accessToken = await getSpotifyAccessToken(userId);
    // Find the last track that the user listened to, and use this timestamp
    // as a cursor to request new streamed tracks from Spotify.
    // Note: this function is run by a scheduled process meaning we should only
    // ever need to request 1 page of results from Spotify to update the users
    // streaming history.
    const lastPlay = await userTrackHistoryDb.getUserTracks({
      limit: 1,
      where: {
        userId: userId
      },
      order: [['playedAt', 'DESC']]
    });
    let res;
    if (lastPlay.count !== 0) {
      // If the last track was played less than 30 seconds ago do not update stream history.
      if (lastPlay.rows[0].playedAt > new Date(Date.now() - 30 * 1000)) {
        return (
          await userTrackHistoryDb.getUserTracks({
            attributes: ['id', 'playedAt'],
            where: {
              userId: userId
            },
            order: [['playedAt', 'DESC']],
            limit: limit,
            include: [
              {
                model: models.track,
                include: [
                  { model: models.album, include: [{ model: models.artist }] }
                ]
              }
            ]
          })
        ).rows;
      }
      // Add 1 second on to ensure Spotify doesn't include this item in the response.
      const after = lastPlay.rows[0].playedAt.getTime() + 1000;
      res = await spotifyApi.getRecentlyPlayed(accessToken, 20, after);
    } else {
      res = await spotifyApi.getRecentlyPlayed(accessToken, 20);
    }
    // Add new tracks to database and update the users streaming history.
    const trackHistoryList: Array<IUserTrackHistory> = [];
    const trackList: Array<SpotifyTrack> = [];
    res.items.forEach((item) => {
      trackHistoryList.push({
        userId: userId,
        trackId: item.track.id,
        playedAt: new Date(item.played_at)
      });
      trackList.push(item.track);
    });
    await trackService.addTracks(trackList, accessToken);
    await userTrackHistoryDb.bulkCreateUserTracks(trackHistoryList);
    return (
      await userTrackHistoryDb.getUserTracks({
        attributes: ['id', 'playedAt'],
        where: {
          userId: userId
        },
        order: [['playedAt', 'DESC']],
        limit: limit,
        include: [
          {
            model: models.track,
            include: [
              { model: models.album, include: [{ model: models.artist }] }
            ]
          }
        ]
      })
    ).rows;
  };

  /**
   * Calculates the users top tracks based on their Spotify streaming history.
   * A top track is calculated by totaling the number of times the track has been streamed.
   * @param userId Id of the user.
   * @param limit Number of albums to return.
   */
  const getTopTracks = async (
    userId: string,
    limit: number
  ): Promise<TopItems> => {
    const topTracks: TopItems = await sequelize.query(
      `
        SELECT 
          tracks.id, 
          tracks.name as trackName, 
          albums.artwork, 
          artists.name as artistName,
          COUNT(tracks.id) AS count
        FROM 
          user_track_histories
        LEFT JOIN 
          tracks ON user_track_histories.track_id = tracks.id
        LEFT JOIN 
          albums ON tracks.album_id = albums.id
        LEFT JOIN 
          artists ON albums.artist_id = artists.id
        WHERE user_id = :user_id
        GROUP BY tracks.id
        ORDER BY count DESC
        LIMIT :limit;`,
      {
        replacements: { user_id: userId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    console.log(topTracks);
    return topTracks;
  };

  /**
   * Calculates the users top albums based on their Spotify streaming history.
   * A top album is calculated by totaling the number of times the tracks from an album
   * have been streamed.
   * @param userId Id of the user.
   * @param limit Number of albums to return.
   */
  const getTopAlbums = async (
    userId: string,
    limit: number
  ): Promise<TopItems> => {
    const topAlbums: TopItems = await sequelize.query(
      `
      SELECT 
        albums.id, 
        albums.name as albumName, 
        albums.artwork, 
        artists.name as artistName,
        COUNT(albums.id) AS count
      FROM 
        user_track_histories
      LEFT JOIN 
        tracks ON user_track_histories.track_id = tracks.id
      LEFT JOIN 
        albums ON tracks.album_id = albums.id
      LEFT JOIN 
        artists ON albums.artist_id = artists.id
      WHERE user_id = :user_id
      GROUP BY albums.id
      ORDER BY count DESC
      LIMIT :limit;`,
      {
        replacements: { user_id: userId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topAlbums;
  };

  /**
   * Calculates the users top artists based on their Spotify streaming history.
   * A top artist is calculated by totaling the number of times the tracks from an artist
   * have been streamed.
   * @param userId Id of the user.
   * @param limit Number of artists to return.
   */
  const getTopArtists = async (
    userId: string,
    limit: number
  ): Promise<TopItems> => {
    const topArtists: TopItems = await sequelize.query(
      `
      SELECT 
        artists.id,
        artists.name as artistName,
        artists.image as artwork,        
        COUNT(artists.id) AS count
      FROM 
        user_track_histories
      LEFT JOIN 
        tracks ON user_track_histories.track_id = tracks.id
      LEFT JOIN 
        albums ON tracks.album_id = albums.id
      LEFT JOIN 
        artists ON albums.artist_id = artists.id
      WHERE user_id = :user_id
      GROUP BY artists.id
      ORDER BY count DESC
      LIMIT :limit;`,
      {
        replacements: { user_id: userId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topArtists;
  };

  /**
   * Fetches the currently playing track for a user.
   * @param userId Id of the user.
   * @returns Currently playing track object or null if no track is playing.
   */
  const getCurrentlyPlayingTrack = async (userId: string) => {
    const accessToken = await getSpotifyAccessToken(userId);
    const res = await spotifyApi.getCurrentlyPlayingTrack(accessToken);
    if (res.currently_playing_type === 'track' && res.item) {
      return {
        name: res.item.name,
        progress: res.progress_ms,
        duration: res.item.duration_ms,
        artwork: res.item.album.images[0].url,
        playingNow: res.is_playing
      };
    }
    return null;
  };

  /**
   * Updates the users settings. There are 3 different scenarios, depending on
   * the setting:
   *  1) Setting is stored in the local database.
   *  2) Setting is stored in the Auth0 database.
   *  3) Setting is stored in both the local database and the Auth0 database.
   * @param userId Id of the user.
   * @param settings Settings object, containing the settings to update.
   */
  const updateUserSettings = async (
    userId: string,
    settings: {
      email?: string;
      password?: string;
      username?: string;
      picture?: string;
      privateProfile?: boolean;
      topTracksTimeframe?: Timeframe;
      topTracksStyle?: StyleType;
      topAlbumsTimeframe?: Timeframe;
      topAlbumsStyle?: StyleType;
      topArtistsTimeframe?: Timeframe;
      topArtistsStyle?: StyleType;
    }
  ) => {
    const status: { [k: string]: any } = {};
    // Update settings individually, so we can return the status of each update.
    // Also Auth0 only allows one update at a time for username, email and password.
    for (const [key, value] of Object.entries(settings)) {
      try {
        // Update attributes stored in Auth0 database.
        if (key === 'email' || key === 'password' || key === 'username') {
          await auth0API.updateUser(userId, key, value as string);
        }
        if (key === 'picture' && process.env.NODE_ENV !== 'development') {
          //TODO: Auth0 do not allow relative urls for profile pictures???
          await auth0API.updateUser(userId, key, value as string);
        }
        // Update attributes stored in local database. Note: some attributes are
        // stored in both the local and Auth0 database.
        if (
          key === 'username' ||
          key === 'picture' ||
          key === 'privateProfile' ||
          key === 'topTracksTimeframe' ||
          key === 'topTracksStyle' ||
          key === 'topAlbumsTimeframe' ||
          key === 'topAlbumsStyle' ||
          key === 'topArtistsTimeframe' ||
          key === 'topArtistsStyle'
        ) {
          await userDb.updateUser(userId, { [key]: value });
        }
        status[key] = { status: 'success' };
      } catch (error: any) {
        status[key] = { status: 'failure' };
        if (error.message) {
          status[key] = { ...status[key], message: error.message };
        } else {
          status[key] = { ...status[key], message: `Error updating ${key}` };
        }
      }
    }
    return status;
  };

  /**
   * Updates the users profile picture. Profile picture is saved and the reference
   * to the picture in the local and Auth0 databases are updated.
   * Images are saved in the format <userId><rand num>.jpg, userIds are in the format
   * <provider>|<userId> so we need to remove the pipe character first.
   * @param userId Id of the user.
   * @param picture New profile picture.
   */
  const updateProfilePicture = async (
    userId: string,
    picture: UploadedFile
  ) => {
    const user = await userDb.getUserById(userId);
    // Remove old image if it exists.
    if (user.picture) {
      fs.unlink(`./public${user.picture}`, (err: any) => {
        if (err) {
          throw new Error('Error updating profile picture1');
        }
      });
    }
    // Save new image.
    const randomValue = Math.floor(Math.random() * 10000);
    const pictureName = `${userId.replace('|', '')}${randomValue}.jpg`;
    const picturePath = `/images/profiles/${pictureName}`;
    fs.writeFile(`./public${picturePath}`, picture.data, (err: any) => {
      if (err) {
        throw new Error('Error updating profile picture');
      }
    });
    const res = await updateUserSettings(userId, { picture: picturePath });
    if (res.picture.status === 'failure') {
      throw new Error('Error updating profile picture');
    }
    return picturePath;
  };

  return {
    authenticateSpotifyUser,
    updateTrackHistory,
    getTopTracks,
    getTopAlbums,
    getTopArtists,
    getCurrentlyPlayingTrack,
    updateUserSettings,
    updateProfilePicture
  };
})();

export default userService;
