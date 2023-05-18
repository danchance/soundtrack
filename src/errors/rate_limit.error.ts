/**
 * Custom error class for when the app has exceeded its rate limit to an external API.
 */
class RateLimitError extends Error {
  /**
   * Creates a new instance of RateLimitError.
   * @param params Additional parameters to pass ot the Error constructor.
   */
  constructor(...params: Array<any>) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }

    this.name = 'RateLimitError';
  }
}

export default RateLimitError;
