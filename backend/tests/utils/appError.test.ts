/// <reference types="mocha" />

import { expect } from "chai";
import AppError from "../../src/utils/appError.ts";

describe("AppError", () => {
  it("should create an error with the correct properties", () => {
    const error = new AppError("Something went wrong", 400);

    expect(error.message).to.equal("Something went wrong");
    expect(error.statusCode).to.equal(400);
    expect(error.status).to.equal("fail");
    expect(error.isOperational).to.equal(true);
  });

  it("should set status to error for server errors", () => {
    const error = new AppError("Something went wrong", 500);

    expect(error.status).to.equal("error");
  });
});