/// <reference types="mocha" />

import { expect } from "chai";
import sinon from "sinon";
import { Error as MongooseError } from "mongoose";
import { JsonWebTokenError } from "jsonwebtoken";
import AppError from "../../src/utils/appError.ts";
import globalErrorHandler from "../../src/middleware/globalErrorHandler.ts";
import { NextFunction } from "express";

describe("globalErrorHandler", () => {
  afterEach(() => {
    sinon.restore();
  });

  const createResponse = () => {
    const json = sinon.stub();

    const status = sinon.stub().returns({
      json,
    });

    return {
      status,
      json,
    };
  };

  it("should return AppError status and message", () => {
    const error = new AppError("Something went wrong", 400);
    const res = createResponse();

    globalErrorHandler(
      error,
      {} as any,
      res as any,
      sinon.stub() as unknown as NextFunction
    );

    expect(res.status.calledOnceWith(400)).to.equal(true);
    expect(
      res.json.calledOnceWith({
        success: false,
        message: "Something went wrong",
      })
    ).to.equal(true);
  });

  it("should handle Mongoose CastError", () => {
    const error = new MongooseError.CastError(
      "ObjectId",
      "invalid-id",
      "id"
    );

    const res = createResponse();

    globalErrorHandler(
      error,
      {} as any,
      res as any,
      sinon.stub() as unknown as NextFunction
    );

    expect(res.status.calledOnceWith(400)).to.equal(true);
    expect(
      res.json.calledOnceWith({
        success: false,
        message: "Invalid id: invalid-id",
      })
    ).to.equal(true);
  });

  it("should handle duplicate key errors", () => {
    const error = {
      code: 11000,
      keyValue: {
        email: "john@example.com",
      },
    };

    const res = createResponse();

    globalErrorHandler(
      error,
      {} as any,
      res as any,
      sinon.stub() as unknown as NextFunction
    );

    expect(res.status.calledOnceWith(409)).to.equal(true);
    expect(
      res.json.calledOnceWith({
        success: false,
        message: "email 'john@example.com' already exists.",
      })
    ).to.equal(true);
  });

  it("should handle Mongoose validation errors", () => {
    const error = new MongooseError.ValidationError();

    error.addError(
      "email",
      new MongooseError.ValidatorError({
        path: "email",
        message: "Please provide a valid email address",
        value: "invalid-email",
      })
    );

    const res = createResponse();

    globalErrorHandler(
      error,
      {} as any,
      res as any,
      sinon.stub() as unknown as NextFunction
    );

    expect(res.status.calledOnceWith(400)).to.equal(true);
    expect(
      res.json.calledOnceWith({
        success: false,
        message: "Please provide a valid email address",
      })
    ).to.equal(true);
  });

  it("should handle JWT errors", () => {
    const error = new JsonWebTokenError("invalid token");
    const res = createResponse();

    globalErrorHandler(
      error,
      {} as any,
      res as any,
      sinon.stub() as unknown as NextFunction
    );

    expect(res.status.calledOnceWith(401)).to.equal(true);
    expect(
      res.json.calledOnceWith({
        success: false,
        message: "Invalid or expired token.",
      })
    ).to.equal(true);
  });

  it("should return 500 for unknown errors", () => {
    const error = new Error("Unexpected error");
    const res = createResponse();

    globalErrorHandler(
      error,
      {} as any,
      res as any,
      sinon.stub() as unknown as NextFunction
    );

    expect(res.status.calledOnceWith(500)).to.equal(true);
    expect(
      res.json.calledOnceWith({
        success: false,
        message: "Internal Server Error",
      })
    ).to.equal(true);
  });
});