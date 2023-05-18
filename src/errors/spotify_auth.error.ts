/**
 * Custom error class for errors relating to a bad code value when trying to authenticate
 * with Spotify for the first time.
 */
class SpotifyAuthError extends Error {
  /**
   * Creates a new instance of SpotifyAuthError.
   * @param params Additional parameters to pass ot the Error constructor.
   */
  constructor(...params: Array<any>) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SpotifyAuthError);
    }

    this.name = 'SpotifyAuthError';
  }
}

export default SpotifyAuthError;
