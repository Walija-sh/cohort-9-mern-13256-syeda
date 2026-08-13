/// <reference types="mocha" />

import { expect } from "chai";
import sinon from "sinon";
import { NextFunction } from "express";
import { getMe , logOut,registerUser,loginUser} from "../../src/controllers/auth.controller";
import User from "../../src/models/User.model.ts";

describe("getMe", () => {
  it("should return the current user", async () => {
    const user = {
      _id: "123456789",
      name: "John Doe",
      email: "john@example.com",
    };

    const req = {
      user,
    };

    const json = sinon.stub();
    const status = sinon.stub().returns({ json });

    const res = {
      status,
    };

    await getMe(req as any, res as any, sinon.stub() as unknown as NextFunction);

    expect(status.calledOnceWith(200)).to.equal(true);

    expect(json.calledOnceWith({
      success: true,
      message: "Current user fetched successfully.",
      data: {
        id: "123456789",
        name: "John Doe",
        email: "john@example.com",
      },
    })).to.equal(true);
  });
});

describe("logOut", () => {
  it("should clear the token cookie and return success response", async () => {
    const clearCookie = sinon.stub();
    const json = sinon.stub();
    const status = sinon.stub().returns({ json });

    const res = {
      clearCookie,
      status,
    };

    await logOut({} as any, res as any, sinon.stub() as unknown as NextFunction);

    expect(clearCookie.calledOnce).to.equal(true);
    expect(clearCookie.firstCall.args[0]).to.equal("token");

    expect(status.calledOnceWith(200)).to.equal(true);

    expect(json.calledOnceWith({
      success: true,
      message: "Current user Logged Out successfully.",
    })).to.equal(true);
  });
});

describe("registerUser", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should register a new user successfully", async () => {
    const user = {
      _id: "123456789",
      name: "John Doe",
      email: "john@example.com",
    };

    const findOneStub = sinon.stub(User, "findOne").resolves(null);
    const createStub = sinon.stub(User, "create").resolves(user as any);

    const cookie = sinon.stub();
    const json = sinon.stub();
    const status = sinon.stub().returns({ json });

    const req = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      },
    };

    const res = {
      cookie,
      status,
    };

    registerUser(req as any, res as any, sinon.stub() as unknown as NextFunction);

    await new Promise(resolve => setImmediate(resolve));

    expect(findOneStub.calledOnce).to.equal(true);
    expect(createStub.calledOnce).to.equal(true);
    expect(cookie.calledOnce).to.equal(true);
    expect(status.calledOnce).to.equal(true);
    expect(status.firstCall.args[0]).to.equal(201);
    expect(json.calledOnce).to.equal(true);
  });
});

describe("loginUser", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should login the user successfully", async () => {
    const user = {
      _id: "123456789",
      name: "John Doe",
      email: "john@example.com",
      comparePassword: sinon.stub().resolves(true),
    };

    const select = sinon.stub().resolves(user);
    const findOne = sinon.stub(User, "findOne").returns({
      select,
    } as any);

    const cookie = sinon.stub();
    const json = sinon.stub();
    const status = sinon.stub().returns({ json });

    const req = {
      body: {
        email: "john@example.com",
        password: "password123",
      },
    };

    const res = {
      cookie,
      status,
    };

    loginUser(req as any, res as any, sinon.stub() as unknown as NextFunction);

    await new Promise(resolve => setImmediate(resolve));

    expect(findOne.calledOnce).to.equal(true);
    expect(findOne.firstCall.args[0]).to.deep.equal({
    email: "john@example.com",
    });
    expect(select.calledOnceWith("+password")).to.equal(true);
    expect(user.comparePassword.calledOnceWith("password123")).to.equal(true);
    expect(cookie.calledOnce).to.equal(true);
    expect(status.calledOnceWith(200)).to.equal(true);
    expect(json.calledOnce).to.equal(true);
  });
});