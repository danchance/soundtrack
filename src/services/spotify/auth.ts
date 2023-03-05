import config from '../../config/general.config.js';
import { Response } from 'node-fetch';
import { post } from '../../utils/fetch_wrapper.js';

type AccessTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
};

type ErrorResponse = {
  error: string;
  error_description: string;
};

/**
 * Request an access token from the Spotify API. Used when the user first authorizes
 * access to their Spotify account.
 * @param code Spotify authorization code returned after intial authorization request.
 * @param redirectUri redirect_uri supplied when requesting the authorization code.
 */
export const requestAccessToken = async (code: string, redirectUri: string) => {
  try {
    // Build headers - base64 encode the authorization header.
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${config.spotify.clientId}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`
    };
    // Build POST body
    const body = new URLSearchParams({
      redirect_uri: redirectUri,
      code: code,
      grant_type: 'authorization_code'
    });
    // Request access token
    const data = await post<AccessTokenResponse>(
      `${config.spotify.accountsUrl}/token`,
      body,
      { headers }
    );
    // Update the user record with the new access/refresh tokens.
    // TODO: ^
    console.log(data);
  } catch (error) {
    if (error instanceof Response) {
      const err = (await error.json()) as ErrorResponse;
      throw new Error(err.error_description);
    }
    if (error instanceof Error) {
      throw new Error(`Something went wrong: ${error.message}`);
    }
    throw new Error(`Something went wrong: ${error}`);
  }
};

/**
 * Request an access token using the refresh token previously provided by the Spotify
 * API.
 * @param refreshToken Refresh token provided by Spotify.
 */
export const requestRefreshedAccessToken = async (refreshToken: string) => {
  try {
    // Build headers - base64 encode the authorization header.
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${config.spotify.clientId}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`
    };
    // Build POST body
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });
    // Request access token
    const data = await post<AccessTokenResponse>(
      `${config.spotify.accountsUrl}/token`,
      body,
      { headers }
    );
    // Update the user record with the new access/refresh tokens.
    // TODO: ^
    console.log(data);
  } catch (error) {
    if (error instanceof Response) {
      const err = (await error.json()) as ErrorResponse;
      throw new Error(err.error_description);
    }
    if (error instanceof Error) {
      throw new Error(`Something went wrong: ${error.message}`);
    }
    throw new Error(`Something went wrong: ${error}`);
  }
};
