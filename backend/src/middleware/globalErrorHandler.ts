import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { JsonWebTokenError } from "jsonwebtoken";

import AppError from "../utils/appError";
import logger from "../utils/logger";

interface MongoDuplicateKeyError {
    code: number;
    keyValue: Record<string, unknown>;
}
const isDuplicateKeyError = (

    err: unknown

): err is MongoDuplicateKeyError => {

    return (

        typeof err === "object" &&

        err !== null &&

        "code" in err &&

        (err as MongoDuplicateKeyError).code === 11000 &&

        "keyValue" in err

    );

};
const isAppError = (
    err: unknown
): err is AppError => {
    return err instanceof AppError;
};
const handleCastError = (err: MongooseError.CastError): AppError => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};


const handleDuplicateKeyError = (err: unknown): AppError => {
    if (!isDuplicateKeyError(err)) {
        return new AppError(
            "Duplicate key error.",
            409
        );
    }
  const field = Object.keys(err.keyValue)[0];
  const value = Object.values(err.keyValue)[0];

  return new AppError(
    `${field} '${value}' already exists.`,
    409
  );
};

const handleValidationError = (
  err: MongooseError.ValidationError
): AppError => {
  const errors = Object.values(err.errors).map(
    (error) => error.message
  );

  return new AppError(errors.join(" "), 400);
};

const handleJWTError = (): AppError => {
  return new AppError("Invalid or expired token.", 401);
};


const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: AppError | unknown = err;

  logger.error(err);

if (isAppError(error)) {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error";
}

  if (err instanceof MongooseError.CastError) {
    error = handleCastError(err);
  }

  if (isDuplicateKeyError(err)) {
    error = handleDuplicateKeyError(err);
  }

  if (err instanceof MongooseError.ValidationError) {
    error = handleValidationError(err);
  }

  if (err instanceof JsonWebTokenError) {
    error = handleJWTError();
  }


  if (isAppError(error) && error.isOperational) {
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