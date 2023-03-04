import config from '../../config/general.config.js';
import fetch from 'node-fetch';

type ResObj = {
  error?: string;
  error_description?: string;
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
};

/**
 * Request an access token from the Spotify API. Used when the user first authorizes
 * access to their Spotify account.
 * @param code Spotify authorization code returned after intial authorization request.
 * @param redirectUri redirect_uri supplied when requesting the authorization code.
 * @returns
 */
export const requestAccessToken = async (code: string, redirectUri: string) => {
  try {
    // Build base64 encoded authorization header.
    const authHeader = Buffer.from(
      `${config.spotify.clientId}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');
    // Request access token
    const res = await fetch(`https://accounts.spotify.com/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`
      },
      body: new URLSearchParams({
        redirect_uri: redirectUri,
        code: code,
        grant_type: 'authorization_code'
      })
    });
    const resData: ResObj = (await res.json()) as ResObj;
    if (!res.ok) {
      throw new Error(resData.error_description);
    }
    // Update the user record with the new access/refresh tokens.
    // TODO: ^
    console.log(resData);
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Request an access token using the refresh token previously provided by the Spotify
 * API.
 */
export const requestRefreshedAccessToken = () => {};
