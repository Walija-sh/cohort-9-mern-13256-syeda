/// <reference types="mocha" />

import { expect } from "chai";
import jwt from "jsonwebtoken";
import generateToken from "../../src/utils/generateToken";

describe("generateToken", () => {
  it("should generate a valid token with the user id", () => {
    const userId = "123456789";

    const token = generateToken(userId);
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    expect(token).to.be.a("string");
    expect(decoded.id).to.equal(userId);
  });
});