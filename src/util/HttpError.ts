/**
 * Custom Error class intended to capture a HTTP Status Code to return to the User
 */
export default class HttpError extends Error {
  readonly statusCode: number;

  /**
   * HTTP Error Constructor
   *
   * @param message Error message
   * @param statusCode HTTP Status Code
   */
  constructor(message: string, statusCode: number) {
    super(message);

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);

    this.statusCode = statusCode;
  }
}
