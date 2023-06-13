import { QueryTypes } from 'sequelize';
import AccessTokenError from '../errors/access_token.error.js';
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
import client from 'https';
import getTimeframeStartDate from '../utils/timeframe.js';
import config from '../config/general.config.js';

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
    // Add 2 minutes to the current time to account for any delay.
    const currentDatetime = new Date(Date.now() + 120 * 1000);
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
   * Updates the users streaming history and returns the requested number of
   * most recently streamed tracks.
   * If a Spotify Access Token error occurs, set a flag so the user can be
   * alerted they need to reauthenticate.
   * @param userId Id of the user.
   * @param limit Number of tracks to return.
   */
  const getTrackHistory = async (userId: string, limit: number) => {
    const results: { spotifyError?: boolean; tracks: IUserTrackHistory[] } = {
      tracks: []
    };
    try {
      await updateTrackHistory(userId);
    } catch (error) {
      if (error instanceof AccessTokenError) {
        results['spotifyError'] = true;
      } else {
        throw error;
      }
    }
    results['tracks'] = (
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
    return results;
  };

  /**
   * Updates the users streaming history using the Spotify API.
   * @param userId Id of the user.
   */
  const updateTrackHistory = async (userId: string) => {
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
      if (lastPlay.rows[0].playedAt > new Date(Date.now() - 30 * 1000)) return;
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
    await trackService.processRecentlyPlayedTracks(trackList, accessToken);
    await userTrackHistoryDb.bulkCreateUserTracks(trackHistoryList);
  };

  /**
   * Calculates the users top tracks based on their Spotify streaming history.
   * A top track is calculated by totaling the number of times the track has been streamed.
   * @param userId Id of the user.
   * @param limit Number of albums to return.
   * @param page Page number of the requested results.
   * @param timeframe The timeframe of streams to include in the query.
   */
  const getTopTracks = async (
    userId: string,
    limit: number,
    page: number,
    timeframe: Timeframe
  ): Promise<TopItems> => {
    const datetime = getTimeframeStartDate(timeframe);
    const offset = (page - 1) * limit;
    const topTracks: TopItems = await sequelize.query(
      `
      SELECT 
        tracks.id, 
        tracks.name as trackName, 
        tracks.slug as trackSlug,
        albums.artwork, 
        albums.slug as albumSlug,
        artists.name as artistName,
        artists.slug as artistSlug,   
        COUNT(tracks.id) AS count
      FROM 
        user_track_histories
      LEFT JOIN 
        tracks ON user_track_histories.track_id = tracks.id
      LEFT JOIN 
        albums ON tracks.album_id = albums.id
      LEFT JOIN 
        artists ON albums.artist_id = artists.id
      WHERE user_id = :user_id AND user_track_histories.played_at > :datetime
      GROUP BY tracks.id
      ORDER BY count DESC
      LIMIT :limit
      OFFSET :offset;`,
      {
        replacements: {
          user_id: userId,
          datetime: datetime,
          limit: limit,
          offset: offset
        },
        type: QueryTypes.SELECT
      }
    );
    return topTracks;
  };

  /**
   * Calculates the users top albums, in the specified timeframe, based on their
   * Spotify streaming history. A top album is calculated by totaling the number
   * of times the tracks from an album have been streamed.
   * @param userId Id of the user.
   * @param limit Number of albums to return.
   * @param page Page number of the requested results.
   * @param timeframe The timeframe of streams to include in the query.
   */
  const getTopAlbums = async (
    userId: string,
    limit: number,
    page: number,
    timeframe: Timeframe
  ): Promise<TopItems> => {
    const datetime = getTimeframeStartDate(timeframe);
    const offset = (page - 1) * limit;
    const topAlbums: TopItems = await sequelize.query(
      `
      SELECT 
        albums.id, 
        albums.name as albumName, 
        albums.artwork, 
        albums.slug as albumSlug,
        artists.name as artistName,
        artists.slug as artistSlug,   
        COUNT(albums.id) AS count
      FROM 
        user_track_histories
      LEFT JOIN 
        tracks ON user_track_histories.track_id = tracks.id
      LEFT JOIN 
        albums ON tracks.album_id = albums.id
      LEFT JOIN 
        artists ON albums.artist_id = artists.id
      WHERE user_id = :user_id AND user_track_histories.played_at > :datetime
      GROUP BY albums.id
      ORDER BY count DESC
      LIMIT :limit
      OFFSET :offset;`,
      {
        replacements: {
          user_id: userId,
          datetime: datetime,
          limit: limit,
          offset: offset
        },
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
   * @param page Page number of the requested results.
   * @param timeframe The timeframe of streams to include in the query.
   */
  const getTopArtists = async (
    userId: string,
    limit: number,
    page: number,
    timeframe: Timeframe
  ): Promise<TopItems> => {
    const datetime = getTimeframeStartDate(timeframe);
    const offset = (page - 1) * limit;
    const topArtists: TopItems = await sequelize.query(
      `
      SELECT 
        artists.id,
        artists.name as artistName,
        artists.image as artwork,
        artists.slug as artistSlug,        
        COUNT(artists.id) AS count
      FROM 
        user_track_histories
      LEFT JOIN 
        tracks ON user_track_histories.track_id = tracks.id
      LEFT JOIN 
        albums ON tracks.album_id = albums.id
      LEFT JOIN 
        artists ON albums.artist_id = artists.id
      WHERE user_id = :user_id AND user_track_histories.played_at > :datetime
      GROUP BY artists.id
      ORDER BY count DESC
      LIMIT :limit
      OFFSET :offset;`,
      {
        replacements: {
          user_id: userId,
          datetime: datetime,
          limit: limit,
          offset: offset
        },
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
   * Gets the users total number of streams for the user. This includes multiple streams
   * of the same track
   * @param userId Id of the user.
   * @returns Total number of streams for the user.
   */
  const getStreamCount = async (userId: string): Promise<number> => {
    const streamCount = await userTrackHistoryDb.getUserTracks({
      where: { userId: userId }
    });
    return streamCount.count;
  };

  /**
   * Calculates the total number of unique tracks the user has streamed in the requested
   * timeframe.
   * @param userId Id of the user.
   * @param timeframe The timeframe of streams to include in the query.
   * @returns Number of unique tracks streamed by the user
   */
  const getTrackStreamCount = async (
    userId: string,
    timeframe: Timeframe
  ): Promise<number> => {
    const datetime = getTimeframeStartDate(timeframe);
    const count = await sequelize.query(
      `
      SELECT COUNT(*) as count FROM 
      (
        SELECT track_id 
        FROM user_track_histories
        WHERE user_id = :user_id AND user_track_histories.played_at > :datetime
        GROUP BY track_id
      ) 
      AS user_track_list`,
      {
        replacements: {
          user_id: userId,
          datetime: datetime
        },
        type: QueryTypes.SELECT
      }
    );
    return (count[0] as { count: number }).count;
  };

  /**
   * Calculates the total number of unique albums the user has streamed in the requested
   * timeframe.
   * @param userId Id of the user.
   * @param timeframe The timeframe of streams to include in the query.
   * @returns Number of unique albums streamed by the user
   */
  const getAlbumStreamCount = async (
    userId: string,
    timeframe: Timeframe
  ): Promise<number> => {
    const datetime = getTimeframeStartDate(timeframe);
    const count = await sequelize.query(
      `
      SELECT COUNT(*) as count FROM 
      (
        SELECT albums.id
        FROM user_track_histories
        LEFT JOIN tracks ON user_track_histories.track_id = tracks.id
        LEFT JOIN albums ON tracks.album_id = albums.id
        WHERE user_id = :user_id AND user_track_histories.played_at > :datetime
        GROUP BY albums.id
      ) 
      AS user_album_list`,
      {
        replacements: {
          user_id: userId,
          datetime: datetime
        },
        type: QueryTypes.SELECT
      }
    );
    return (count[0] as { count: number }).count;
  };

  /**
   * Calculates the total number of unique artists the user has streamed in the requested
   * timeframe.
   * @param userId Id of the user.
   * @param timeframe The timeframe of streams to include in the query.
   * @returns Number of unique artists streamed by the user
   */
  const getArtistStreamCount = async (
    userId: string,
    timeframe: Timeframe
  ): Promise<number> => {
    const datetime = getTimeframeStartDate(timeframe);
    const count = await sequelize.query(
      `
      SELECT COUNT(*) as count FROM 
      (
        SELECT artists.id
        FROM user_track_histories
        LEFT JOIN tracks ON user_track_histories.track_id = tracks.id
        LEFT JOIN albums ON tracks.album_id = albums.id
        LEFT JOIN artists ON albums.artist_id = artists.id
        WHERE user_id = :user_id AND user_track_histories.played_at > :datetime
        GROUP BY artists.id
      ) 
      AS user_artist_list`,
      {
        replacements: {
          user_id: userId,
          datetime: datetime
        },
        type: QueryTypes.SELECT
      }
    );
    return (count[0] as { count: number }).count;
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
      bannerPicture?: string;
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
        if (key === 'picture' && process.env.NODE_ENV === 'production') {
          // Auth0 do not allow relative urls for the profile picture, so only update
          // profile picture stored in Auth0 database in production.
          // Append the domain to the start of the path.
          const url = `${config.domain}${value}`;
          await auth0API.updateUser(userId, key, url);
        }
        // Update attributes stored in local database. Note: some attributes are
        // stored in both the local and Auth0 database.
        if (
          key === 'username' ||
          key === 'picture' ||
          key === 'bannerPicture' ||
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
   * @param imageType Type of image to update.
   * @returns Path to the new profile picture.
   */
  const updateUserImage = async (
    userId: string,
    picture: UploadedFile,
    imageType: 'profile' | 'banner'
  ) => {
    const user = await userDb.getUserById(userId);
    // Save path to old image - used to remove it later.
    const oldImage =
      imageType === 'profile' ? user.picture : user.bannerPicture;
    // Save new image and update user.
    const randomValue = Math.floor(Math.random() * 10000);
    const fileExtension = picture.mimetype === 'image/jpeg' ? 'jpg' : 'png';
    const pictureName = `${userId.replace(
      '|',
      ''
    )}${randomValue}.${fileExtension}`;
    const picturePath = `/images/${imageType}/${pictureName}`;
    fs.writeFile(`./public${picturePath}`, picture.data, (err: any) => {
      if (err) {
        throw new Error(`Error updating ${imageType} image`);
      }
    });
    const updates =
      imageType === 'profile'
        ? { picture: picturePath }
        : { bannerPicture: picturePath };
    const res = await updateUserSettings(userId, updates);
    if (
      res.picture?.status === 'failure' ||
      res.bannerPicture?.status === 'failure'
    ) {
      throw new Error('Error updating profile picture');
    }
    // Remove old image if it is not the default.
    if (oldImage && oldImage.slice(-11) !== 'default.jpg') {
      fs.unlink(`./public${oldImage}`, () => {});
    }
    return picturePath;
  };

  /**
   * Deletes a users Spotify connection. This will delete the tokens needed
   * to access the Spotify API for the user. This will not delete soundTrack
   * connection in the users Spotify account as this is not possible.
   * @param userId Id of the user.
   */
  const deleteSpotifyConnection = async (userId: string) => {
    await userDb.updateUser(userId, {
      spotifyAccessToken: null,
      spotifyRefreshToken: null,
      spotifyTokenExpires: null
    });
  };

  /**
   * Delete a users account. This will delete the user from the:
   *  - Auth0 database
   *  - Local database:
   *     - User table
   *     - User track history table
   * @param userId Id of the user
   */
  const deleteAccount = async (userId: string) => {
    // Check user exists before first deleting from Auth0.
    await userDb.getUserById(userId);
    await auth0API.deleteUser(userId);
    try {
      await userDb.deleteUser(userId);
    } catch (error) {
      // User deleted from Auth0 but not local database.
      // Log error
      throw error;
    }
  };

  /**
   * Add a user account to the local database. This is performed after a user has
   * signed up and is added to the Auth0 database.
   * @param userId Id of the user
   * @param username Username of the user
   * @param email Email of the user
   */
  const addAccount = async (
    userId: string,
    username: string,
    email: string
  ) => {
    // Fetch the picture that Auth0 is using as the initial profile image.
    // The name of the image is the first 2 characters of the email address.
    // If fetching the image fails, use a default that can be changes later
    // by the user.
    const imageName = email.substring(0, 2);
    let picturePath = `/images/profile/${userId.replace('|', '')}.png`;
    client.get(
      `https://i0.wp.com/cdn.auth0.com/avatars/${imageName}.png?ssl=1`,
      (res) => {
        if (res.statusCode === 200) {
          res
            .pipe(fs.createWriteStream(`./public${picturePath}`))
            .on('error', () => {
              picturePath = `/images/profile/default.png`;
            });
        } else {
          picturePath = `/images/profile/default.png`;
        }
      }
    );
    await userDb.createUser({
      id: userId,
      username: username,
      picture: picturePath,
      bannerPicture: '/images/banner/default.jpg'
    });
  };

  return {
    authenticateSpotifyUser,
    getTrackHistory,
    updateTrackHistory,
    getTopTracks,
    getTopAlbums,
    getTopArtists,
    getCurrentlyPlayingTrack,
    getStreamCount,
    getTrackStreamCount,
    getAlbumStreamCount,
    getArtistStreamCount,
    updateUserSettings,
    updateUserImage,
    deleteSpotifyConnection,
    deleteAccount,
    addAccount
  };
})();

export default userService;
