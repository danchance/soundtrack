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
