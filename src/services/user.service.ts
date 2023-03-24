import { Op, QueryTypes, Sequelize } from 'sequelize';
import {
  AccessTokenError,
  RecordNotFoundError
} from '../data_access/errors.js';
import spotifyApi, { Track } from '../data_access/spotify.data.js';
import userDb from '../data_access/user.data.js';
import userTrackHistoryDb from '../data_access/usertrackhistory.data.js';
import { IUserTrackHistory } from '../models/usertrackhistory.model.js';
import trackService from './track.service.js';
import { models, sequelize } from '../models/_index.js';

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
      user.spotifyAccessToken === undefined ||
      user.spotifyRefreshToken === undefined ||
      user.spotifyTokenExpires === undefined
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
  ): Promise<any> => {
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
    const trackList: Array<Track> = [];
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
   * Calculates the users top albums based on their Spotify streaming history.
   * A top album is calculated by totaling the number of times the tracks from an album
   * have been streamed.
   * @param userId Id of the user.
   * @param limit Number of albums to return.
   */
  const getUserTopAlbums = async (userId: string, limit: number) => {
    const topAlbums = await sequelize.query(
      `
      SELECT 
        tracks.album_id, 
        albums.name as album_name, 
        albums.artwork, 
        artists.name as artist_name,
        COUNT(tracks.album_id) AS stream_count
      FROM 
        user_track_histories
      LEFT JOIN 
        tracks ON user_track_histories.track_id = tracks.id
      LEFT JOIN 
        albums ON tracks.album_id = albums.id
      LEFT JOIN 
        artists ON albums.artist_id = artists.id
      WHERE user_id = :userId
      GROUP BY tracks.album_id
      ORDER BY stream_count DESC
      LIMIT :limit;`,
      {
        replacements: { userId: userId, limit: limit },
        type: QueryTypes.SELECT
      }
    );
    return topAlbums;
  };

  return {
    authenticateSpotifyUser,
    updateTrackHistory,
    getUserTopAlbums
  };
})();

export default userService;
