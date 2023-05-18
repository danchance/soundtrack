/**
 * Custom error class for errors that occurred validating request parameters.
 */
class BadRequestError extends Error {
  public errors: Array<{ [k: string]: any }>;
  /**
   * Creates a new instance of BadRequestError.
   * @param errors Array of errors from express-validator.
   * @param params Additional parameters to pass ot the Error constructor.
   */
  constructor(errors: Array<{ [k: string]: any }>, ...params: Array<any>) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BadRequestError);
    }

    this.name = 'BadRequestError';
    this.errors = errors;
  }
}

export default BadRequestError;
