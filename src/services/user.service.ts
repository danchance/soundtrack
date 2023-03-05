import spotifyApi from '../data_access/spotify.data';
import userDb from '../data_access/user.data';
import { IUser } from '../models/user.model';

const userService = (() => {
  /**
   * Returns the Spotify access token for the user.
   * Checks if the access token has expired and requests a new token if it has.
   * @param userId Id of the user the access token is for.
   * @returns Spotify access token.
   */
  const getSpotifyAccessToken = async (userId: string): Promise<string> => {
    const user: IUser = await userDb.getUserById(userId);
    const currentDatetime = new Date(Date.now());
    if (user.spotifyTokenExpires > currentDatetime) {
      return user.spotifyAccessToken;
    }
    // Request new access token and update the user record.
    const tokenRes = await spotifyApi.requestRefreshedAccessToken(
      user.spotifyRefreshToken
    );
    // TODO: update user with new access token and expiry date
    // Note: a new refresh token may be returned as well
    return tokenRes.access_token;
  };
})();

export default userService;
