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
 * When Spotify returns a 429 status code, use the Retry-After header to determine
 * how long to wait before retrying the request.
 * If the current time is before the retryAfter time, wait until the retryAfter time
 * has passed before sending the request.
 */
let retryAfter: Date | null = null;
/**
 * Maximum number of request attempts to make before giving up.
 */
const MAX_ATTEMPTS: number = 5;
/**
 * Track the number of requests made to Spotify API during the current session.
 */
let totalRequest: number = 0;

/**
 * Spotify wrapper for all GET requests to https://api.spotify.com/v1.
 * Handles the regular Spotify Web API error format (StandardError).
 * @param endpoint Spotify request endpoint
 * @param accessToken Access token provided by Spotify.
 * @throws AccessTokenError, RateLimitError.
 * @returns Spotify JSON object for the requested resource.
 */
export const spotifyGet = async <T>(endpoint: string, accessToken: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Total request: ', totalRequest);
  }
  const url = `${config.spotify.apiUrl}/${endpoint}`;
  let requestAttemps = 0;
  while (requestAttemps < MAX_ATTEMPTS) {
    try {
      // Wait if Spotify have rate limited us
      if (retryAfter && retryAfter.getTime() - Date.now() > 0) {
        await new Promise((resolve) => {
          setTimeout(resolve, retryAfter!.getTime() - Date.now());
        });
      }
      totalRequest++;
      return await get<T>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    } catch (error) {
      if (error instanceof Response) {
        const err = (await error.json()) as StandardError;
        if (error.status === 401) {
          throw new AccessTokenError(err.error.message);
        } else if (error.status === 429) {
          // Spotify rate limit exceeded.
          const retrySeconds = parseInt(error.headers.get('Retry-After')!);
          retryAfter = new Date(Date.now() + retrySeconds * 1000 + 500);
          console.log(
            'Rate limit exceeded, retrying in',
            retrySeconds,
            'seconds'
          );
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
    // Loop back up to attempt the request again, this happens if we have been rate limited.
    requestAttemps++;
  }
  throw new RateLimitError('Spotify API rate limit exceeded.');
};

/**
 * Spotify wrapper for POST requests to https://accounts.spotify.com/v1.
 * Used to get the initial access token and future access tokens via the refresh token.
 * Handles the authentication Spotify Web API error format (AuthenticationError).
 * @param body Body of POST request.
 * @param init fetch settings object.
 * @throws AuthenticationError.
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
