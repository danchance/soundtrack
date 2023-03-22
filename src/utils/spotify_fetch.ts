import config from '../config/general.config.js';
import { Response } from 'node-fetch';
import { get, post } from '../utils/fetch_wrapper.js';
import { BodyInit, RequestInit } from 'node-fetch';
import { AccessTokenError, RateLimitError } from '../data_access/errors.js';

type StandardError = {
  error: {
    status: number;
    message: string;
  };
};

type AuthenticationError = {
  error: string;
  error_description: string;
};

/**
 * Spotify wrapper for all GET requests to https://api.spotify.com/v1.
 * Handles the regular Spotify Web API error format (StandardError).
 * @param endpoint Spotify request endpoint
 * @param accessToken Access token provided by Spotify.
 * @returns Spotify JSON object for the requested resource.
 */
export const spotifyGet = async <T>(endpoint: string, accessToken: string) => {
  const url = `${config.spotify.apiUrl}/${endpoint}`;
  try {
    return await get<T>(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  } catch (error) {
    if (error instanceof Response) {
      const err = (await error.json()) as StandardError;
      switch (error.status) {
        case 401:
          throw new AccessTokenError(err.error.message);
        case 429:
          const retryAfter = parseInt(error.headers.get('Retry-After')!);
          throw new RateLimitError(retryAfter, err.error.message);
        default:
          throw new Error(`Status ${err.error.status}: ${err.error.message}`);
      }
    }
    throw error;
  }
};

/**
 * Spotify wrapper for POST requests to https://accounts.spotify.com/v1.
 * Used to get the initial access token and future access tokens via the refresh token.
 * Handles the authentication Spotify Web API error format (AuthenticationError).
 * @param body Body of POST request.
 * @param init fetch settings object
 * @returns Spotify JSON object for the requested resource.
 */
export const spotifyPost = async <T>(
  endpoint: string,
  body: BodyInit,
  init?: RequestInit
) => {
  const url = `${config.spotify.accountsUrl}/${endpoint}`;
  try {
    return await post<T>(url, body, init);
  } catch (error) {
    if (error instanceof Response) {
      const err = (await error.json()) as AuthenticationError;
      throw new Error(err.error_description);
    }
    throw error;
  }
};
