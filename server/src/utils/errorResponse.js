export class ErrorResponse extends Error {
  constructor(message, statusCode, errors, success) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = success;
  }
}
