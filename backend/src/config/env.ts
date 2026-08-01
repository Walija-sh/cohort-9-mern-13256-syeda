import logger from "../utils/logger";

const NODE_ENV = process.env.NODE_ENV?.trim() || "development";

const PORT = Number(process.env.PORT) || 5000;

const MONGODB_URI = process.env.MONGODB_URI?.trim();

const JWT_SECRET = process.env.JWT_SECRET?.trim();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN?.trim();

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

if (Number.isNaN(PORT) || PORT <= 0) {
    logger.fatal("PORT must be a valid number.");
    process.exit(1);
}

if (!MONGODB_URI) {
    logger.fatal("MONGODB_URI is missing.");
    process.exit(1);
}


if (!JWT_SECRET) {
    logger.fatal("JWT_SECRET is missing.");
    process.exit(1);
}

if (JWT_SECRET.length < 32) {
    logger.fatal("JWT_SECRET must be at least 32 characters long.");
    process.exit(1);
}

const WEAKSECRETS = [
    "secret",
    "password",
    "123456",
    "test",
    "development",
    "jwt_secret",
];

if (WEAKSECRETS.includes(JWT_SECRET.toLowerCase())) {
    logger.fatal("JWT_SECRET is too weak.");
    process.exit(1);
}


if (!JWT_EXPIRES_IN) {
    logger.fatal("JWT_EXPIRES_IN is missing.");
    process.exit(1);
}

const durationRegex = /^(\d+)(ms|s|m|h|d|w|y)$/;

if (!durationRegex.test(JWT_EXPIRES_IN)) {
    logger.fatal(
        "JWT_EXPIRES_IN must include a time unit (e.g. 15m, 1h, 7d)."
    );
    process.exit(1);
}


if (
    Number.isNaN(BCRYPT_SALT_ROUNDS) ||
    BCRYPT_SALT_ROUNDS < 4 ||
    BCRYPT_SALT_ROUNDS > 15
) {
    logger.fatal(
        "BCRYPT_SALT_ROUNDS must be between 4 and 15."
    );
    process.exit(1);
}

export {
    NODE_ENV,
    PORT,
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    BCRYPT_SALT_ROUNDS,
};