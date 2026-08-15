/// <reference types="mocha" />

import { expect } from "chai";
import { NextFunction } from "express";
import sinon from "sinon";
import catchAsync from "../../src/utils/catchAsync";

describe("catchAsync", () => {
  it("should execute the wrapped function", async () => {
    const handler = sinon.stub().resolves();
    const wrappedHandler = catchAsync(handler);

    wrappedHandler({} as any, {} as any, sinon.stub() as unknown as NextFunction);

    await new Promise(resolve => setImmediate(resolve));

    expect(handler.calledOnce).to.equal(true);
  });

  it("should pass rejected errors to next", async () => {
    const error = new Error("Test error");
    const handler = sinon.stub().rejects(error);
    const next = sinon.stub();

    const wrappedHandler = catchAsync(handler);

    wrappedHandler(
      {} as any,
      {} as any,
      next as unknown as NextFunction
    );

    await new Promise(resolve => setImmediate(resolve));

    expect(next.calledOnceWith(error)).to.equal(true);
  });
});