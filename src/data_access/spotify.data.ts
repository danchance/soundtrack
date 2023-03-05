import config from '../config/general.config.js';
import { spotifyGet, spotifyPost } from '../utils/spotify_fetch.js';

type AuthenticationResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

const spotifyApi = (() => {
  // Build request header for requesting access token.
  // Authorization header must be base64 encoded.
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${Buffer.from(
      `${config.spotify.clientId}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64')}`
  };

  /**
   * Request an access token from the Spotify API. Used when the user first authorizes
   * access to their Spotify account.
   * @param code Spotify authorization code returned after intial authorization request.
   * @param redirectUri redirect_uri supplied when requesting the authorization code.
   * @returns
   */
  const requestAccessToken = async (
    code: string,
    redirectUri: string
  ): Promise<AuthenticationResponse> => {
    const endpoint = 'token';
    // Build POST body.
    const body = new URLSearchParams({
      redirect_uri: redirectUri,
      code: code,
      grant_type: 'authorization_code'
    });
    return await spotifyPost<AuthenticationResponse>(endpoint, body, {
      headers
    });
  };

  /**
   * Request an access token using the refresh token previously provided by the Spotify
   * API.
   * @param refreshToken Refresh token provided by Spotify.
   */
  const requestRefreshedAccessToken = async (
    refreshToken: string
  ): Promise<AuthenticationResponse> => {
    const endpoint = 'token';
    // Build POST body.
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });
    return await spotifyPost<AuthenticationResponse>(endpoint, body, {
      headers
    });
  };

  /**
   * Request a single track by id.
   * @param accessToken Access token provided by Spotify.
   * @param trackId Id of the track.
   * @returns Spotify track object.
   */
  const getTrack = async (accessToken: string, trackId: string) => {
    const endpoint = `tracks/${trackId}`;
    return await spotifyGet(endpoint, accessToken);
  };

  /**
   * Request a single album by id.
   * @param accessToken Access token provided by Spotify.
   * @param albumId Id of the album.
   * @returns Spotify album object.
   */
  const getAlbum = async (accessToken: string, albumId: string) => {
    const endpoint = `albums/${albumId}`;
    return await spotifyGet(endpoint, accessToken);
  };

  /**
   * Request all tracks on an album.
   * @param accessToken Access token provided by Spotify.
   * @param albumId Id of the album.
   * @returns Spotify album object.
   */
  const getAlbumTracks = async (accessToken: string, albumId: string) => {
    const endpoint = `albums/${albumId}/tracks`;
    return await spotifyGet(endpoint, accessToken);
  };

  /**
   * Request a single artist by id.
   * @param accessToken Access token provided by Spotify.
   * @param artistId Id of the artist.
   * @returns Spotify artist object.
   */
  const getArtist = async (accessToken: string, artistId: string) => {
    const endpoint = `artists/${artistId}`;
    return await spotifyGet(endpoint, accessToken);
  };

  /**
   * Request all albums for an artist.
   * @param accessToken Access token provided by Spotify.
   * @param artistId Id of the artist.
   * @returns Spotify album objects.
   */
  const getArtistAlbums = async (accessToken: string, artistId: string) => {
    const endpoint = `artists/${artistId}/albums`;
    return await spotifyGet(endpoint, accessToken);
  };

  /**
   * Request an artists top tracks.
   * @param accessToken Access token provided by Spotify.
   * @param artistId Id of the artist.
   * @returns Spotify track objects.
   */
  const getArtistTopTracks = async (accessToken: string, artistId: string) => {
    const endpoint = `artists/${artistId}/top-tracks`;
    return await spotifyGet(endpoint, accessToken);
  };

  /**
   * Returns all tracks played by the user after timestamp specified.
   * @param accessToken Access token provided by Spotify.
   * @param after Unix timestamp in milliseconds.
   * @returns Spotify track objects.
   */
  const getRecentlyPlayed = async (
    accessToken: string,
    after: number,
    limit: number
  ) => {
    const endpoint = `me/player/recently-played?limit=${limit}`;
    return await spotifyGet(endpoint, accessToken);
  };

  /**
   * Get the track being currently played on the users Spotify account.
   * @param accessToken Access token provided by Spotify.
   * @returns Spotify track object
   */
  const getCurrentlyPlayingTrack = async (accessToken: string) => {
    const endpoint = `me/player/currently-playing`;
    return await spotifyGet(endpoint, accessToken);
  };

  return {
    requestAccessToken,
    requestRefreshedAccessToken,
    getTrack,
    getAlbum,
    getAlbumTracks,
    getArtist,
    getArtistAlbums,
    getArtistTopTracks,
    getRecentlyPlayed,
    getCurrentlyPlayingTrack
  };
})();

export default spotifyApi;
