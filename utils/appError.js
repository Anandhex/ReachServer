class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //Whether the error is created by the express applicationa
    this.errorMessage = message;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
