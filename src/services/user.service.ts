import { RecordNotFoundError } from '../data_access/errors.js';
import spotifyApi from '../data_access/spotify.data.js';
import userDb from '../data_access/user.data.js';
import userTrackHistoryDb from '../data_access/usertrackhistory.data.js';

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
      throw new Error('User must authenticate with Spotify');
    }
    const currentDatetime = new Date(Date.now());
    if (user.spotifyTokenExpires > currentDatetime) {
      return user.spotifyAccessToken;
    }
    // Request new access token and update the user record.
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
   * Requests the users streaming history from Spotify and updates the users
   * streamed track history.
   * @param userId Id of the user
   */
  const updateTrackHistory = async (userId: string): Promise<any> => {
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
    console.log(lastPlay);
    let res;
    if (lastPlay.count !== 0) {
      // Add 1 second on to ensure Spotify does not include this item in
      // the results.
      const after = lastPlay.rows[0].playedAt.getTime() + 1000;
      res = await spotifyApi.getRecentlyPlayed(accessToken, 20, after);
    } else {
      res = await spotifyApi.getRecentlyPlayed(accessToken, 20);
    }
    const list = res.items.map((item) => ({
      userId: userId,
      trackId: item.track.id,
      playedAt: new Date(item.played_at)
    }));
    userTrackHistoryDb.bulkCreateUserTracks(list);
    //TODO: return 10 last entries from database
    return res.items;
  };

  return {
    authenticateSpotifyUser,
    updateTrackHistory
  };
})();

export default userService;
