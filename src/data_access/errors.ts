/**
 * Custom error class for when no record is found that matches the search query.
 */
export class RecordNotFoundError extends Error {
  recordType: string;

  /**
   * Creates a new instance of RecordNotFoundError.
   * @param recordType Type of record that was not found.
   * @param params Additional parameters to pass ot the Error constructor.
   */
  constructor(recordType: string, ...params: Array<any>) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RecordNotFoundError);
    }

    this.name = 'RecordNotFoundError';
    // Custom debugging information
    this.recordType = recordType;
  }
}

/**
 * Custom error class for errors relating to an expired, bad or otherwise invalid access
 * token.
 */
export class AccessTokenError extends Error {
  /**
   * Creates a new instance of AccessTokenError.
   * @param params Additional parameters to pass ot the Error constructor.
   */
  constructor(...params: Array<any>) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RecordNotFoundError);
    }

    this.name = 'AccessTokenError';
  }
}

/**
 * Custom error class for when the app has exceeded its rate limit to an external API.
 */
export class RateLimitError extends Error {
  retryAfter: number;
  /**
   * Creates a new instance of RateLimitError.
   * @param params Additional parameters to pass ot the Error constructor.
   */
  constructor(retryAfter: number, ...params: Array<any>) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RecordNotFoundError);
    }

    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}
