/**
 * Custom error class for errors relating to an expired, bad or otherwise invalid access
 * token.
 */
class AccessTokenError extends Error {
  /**
   * Creates a new instance of AccessTokenError.
   * @param params Additional parameters to pass ot the Error constructor.
   */
  constructor(...params: Array<any>) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AccessTokenError);
    }

    this.name = 'AccessTokenError';
  }
}

export default AccessTokenError;
