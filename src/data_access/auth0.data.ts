import { Response } from 'node-fetch';
import config from '../config/general.config.js';
import { patch, post, _delete } from '../utils/fetch_wrapper.js';

/**
 * Define types for the Auth0 Management API responses.
 */
type AccessTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

/**
 * Handles all requests to the Auth0 Management API.
 */
const auth0API = (() => {
  /**
   * Access token required for all requests to the Auth0 Management API.
   */
  const accessToken = {
    value: '',
    expires: new Date(Date.now() - 1000 * 60)
  };

  /**
   * Request an access token from Auth0 for the Management API.
   */
  const requestAccessToken = async () => {
    if (accessToken.value && accessToken.expires > new Date()) {
      return;
    }
    const url = `${config.auth0.domain}oauth/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.auth0.M2MApplication.clientId,
      client_secret: `${process.env.SOUNDTRACKM2M_CLIENT_SECRET}`,
      audience: `${config.auth0.domain}api/v2/`
    });
    const headers = {
      'content-type': 'application/x-www-form-urlencoded'
    };
    const res = await post<AccessTokenResponse>(url, body, { headers });
    accessToken.value = res.access_token;
    accessToken.expires = new Date(Date.now() + res.expires_in * 1000);
  };

  /**
   * Update an attribute for a user in the Auth0 database.
   * Note: Auth0 prevents updating username, email and password in the same request,
   * as these are the only attributes that this application updates, this function
   * only updates one attribute at a time.
   * @param userId Id of the user.
   * @param attribute Auth0 attribute to update.
   * @param value New value for the attribute.
   */
  const updateUser = async (
    userId: string,
    attribute: 'username' | 'email' | 'password' | 'picture',
    value: string
  ) => {
    await requestAccessToken();
    try {
      await patch(
        `${config.auth0.domain}api/v2/users/${userId}`,
        JSON.stringify({ [attribute]: value }),
        {
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${accessToken.value}`
          }
        }
      );
    } catch (error) {
      if (error instanceof Response) {
        return Promise.reject(await error.json());
      }
      return Promise.reject({ message: 'Error updating user' });
    }
  };

  /**
   * Delete a user from the Auth0 database.
   * @param userId Id of the user.
   */
  const deleteUser = async (userId: string) => {
    try {
      await requestAccessToken();
      await _delete(`${config.auth0.domain}api/v2/users/${userId}`);
    } catch (error) {
      if (error instanceof Response) {
        return Promise.reject(await error.json());
      }
      throw error;
    }
  };

  return {
    updateUser,
    deleteUser
  };
})();

export default auth0API;
