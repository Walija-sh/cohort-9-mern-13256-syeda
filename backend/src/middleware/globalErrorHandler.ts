import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { JsonWebTokenError } from "jsonwebtoken";

import AppError from "../utils/appError";
import logger from "../utils/logger";

// Handle invalid MongoDB ObjectId.
const handleCastError = (err: MongooseError.CastError): AppError => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

// Handle duplicate unique fields.
const handleDuplicateKeyError = (err: any): AppError => {
  const field = Object.keys(err.keyValue)[0];
  const value = Object.values(err.keyValue)[0];

  return new AppError(
    `${field} '${value}' already exists.`,
    409
  );
};
// Handle Mongoose validation errors.
const handleValidationError = (
  err: MongooseError.ValidationError
): AppError => {
  const errors = Object.values(err.errors).map(
    (error) => error.message
  );

  return new AppError(errors.join(" "), 400);
};
// Handle invalid JWT.
const handleJWTError = (): AppError => {
  return new AppError("Invalid or expired token.", 401);
};

// Global Error Handler
const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  logger.error(err);


  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (err.name === "CastError") {
    error = handleCastError(err);
  }

  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  if (err.name === "ValidationError") {
    error = handleValidationError(err);
  }

  if (err instanceof JsonWebTokenError) {
    error = handleJWTError();
  }

  // Operational errors
   
  if (error.isOperational) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default globalErrorHandler;