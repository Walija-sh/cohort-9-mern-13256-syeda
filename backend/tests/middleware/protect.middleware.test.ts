/// <reference types="mocha" />

import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import { NextFunction } from "express";
import User from "../../src/models/User.model";
import AppError from "../../src/utils/appError.ts";
import protect from "../../src/middleware/protect.middleware.ts";

describe("protect", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should return an error when token is missing", async () => {
    const next = sinon.stub();

    const req = {
      cookies: {},
    };

    protect(
      req as any,
      {} as any,
      next as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(next.calledOnce).to.equal(true);

    const error = next.firstCall.args[0] as AppError;

    expect(error).to.be.instanceOf(AppError);
    expect(error.statusCode).to.equal(401);
    expect(error.message).to.equal(
      "Authentication required. Please log in."
    );
  });

  it("should return an error when token is invalid", async () => {
    const next = sinon.stub();

    const verifyStub = sinon.stub(jwt, "verify").throws(
      new Error("Invalid token")
    );

    const req = {
      cookies: {
        token: "invalid-token",
      },
    };

    protect(
      req as any,
      {} as any,
      next as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(verifyStub.calledOnce).to.equal(true);
    expect(next.calledOnce).to.equal(true);

    const error = next.firstCall.args[0] as AppError;

    expect(error.statusCode).to.equal(401);
    expect(error.message).to.equal("Invalid or expired token");
  });

  it("should return an error when user no longer exists", async () => {
    const next = sinon.stub();

    sinon.stub(jwt, "verify").returns({
      id: "123456789",
    } as any);

    const select = sinon.stub().resolves(null);

    sinon.stub(User, "findById").returns({
      select,
    } as any);

    const req = {
      cookies: {
        token: "valid-token",
      },
    };

    protect(
      req as any,
      {} as any,
      next as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(next.calledOnce).to.equal(true);

    const error = next.firstCall.args[0] as AppError;

    expect(error.statusCode).to.equal(401);
    expect(error.message).to.equal("User no longer exists");
  });

  it("should attach the user to the request and call next", async () => {
    const next = sinon.stub();

    const user = {
      _id: "123456789",
      name: "John Doe",
      email: "john@example.com",
    };

    sinon.stub(jwt, "verify").returns({
      id: "123456789",
    } as any);

    const select = sinon.stub().resolves(user);

    sinon.stub(User, "findById").returns({
      select,
    } as any);

    const req = {
      cookies: {
        token: "valid-token",
      },
    } as any;

    protect(
      req as any,
      {} as any,
      next as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(req.user).to.equal(user);
    expect(next.calledOnce).to.equal(true);
    expect(next.firstCall.args[0]).to.equal(undefined);
  });
});