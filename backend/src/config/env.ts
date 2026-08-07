import logger from "../utils/logger";

function parseIntEnv(
    name: string,
    rawValue: string | undefined,
    defaultValue: number,
    min: number,
    max: number
): number {
    const trimmed = rawValue?.trim();

    if (trimmed === undefined || trimmed === "") {
        return defaultValue;
    }

    if (!/^-?\d+$/.test(trimmed)) {
        logger.fatal(`${name} must be a valid integer.`);
        process.exit(1);
    }

    const parsed = Number(trimmed);

    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
        logger.fatal(`${name} must be an integer between ${min} and ${max}.`);
        process.exit(1);
    }

    return parsed;
}

const NODE_ENV = process.env.NODE_ENV?.trim() || "development";

const PORT = parseIntEnv("PORT", process.env.PORT, 5000, 1, 65535);

const MONGODB_URI = process.env.MONGODB_URI?.trim();

const JWT_SECRET = process.env.JWT_SECRET?.trim();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN?.trim();

const FRONTEND_URL = process.env.FRONTEND_URL?.trim();

const BCRYPT_SALT_ROUNDS = parseIntEnv(
    "BCRYPT_SALT_ROUNDS",
    process.env.BCRYPT_SALT_ROUNDS,
    10,
    4,
    15
);

if (!MONGODB_URI) {
    logger.fatal("MONGODB_URI is missing.");
    process.exit(1);
}

if (!JWT_SECRET) {
    logger.fatal("JWT_SECRET is missing.");
    process.exit(1);
}

const WEAKSECRETS = [
    "secret",
    "password",
    "123456",
    "test",
    "development",
    "jwt_secret",
    "your-256-bit-secret",
    "your-secret-key",
    "your-secret-key-here",
    "changeme",
    "change_this_secret",
    "change-me-in-production",
    "supersecretkeysupersecretkeysupersecretkey",
    "thisisaverysecuresecretkeydonotshare123",
    "development_jwt_secret_key_change_me_now",
];

const normalizedSecret = JWT_SECRET.toLowerCase();

if (WEAKSECRETS.includes(normalizedSecret)) {
    logger.fatal("JWT_SECRET is a known/predictable default value and must be replaced with a deployment-generated secret.");
    process.exit(1);
}

if (JWT_SECRET.length < 32) {
    logger.fatal("JWT_SECRET must be at least 32 characters long.");
    process.exit(1);
}


if (!JWT_EXPIRES_IN) {
    logger.fatal("JWT_EXPIRES_IN is missing.");
    process.exit(1);
}
if (!FRONTEND_URL) {
    logger.fatal("FRONTEND_URL is missing.");
    process.exit(1);
}
try {
    new URL(FRONTEND_URL);
} catch {
    logger.fatal("FRONTEND_URL must be a valid URL.");
    process.exit(1);
}
const durationRegex = /^(\d+)(ms|s|m|h|d|w|y)$/;
const durationMatch = JWT_EXPIRES_IN.match(durationRegex);

if (!durationMatch || Number(durationMatch[1]) <= 0) {
    logger.fatal(
        "JWT_EXPIRES_IN must include a positive value and a time unit (e.g. 15m, 1h, 7d)."
    );
    process.exit(1);
}

interface AppConfig {
    NODE_ENV: string;
    PORT: number;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    FRONTEND_URL: string;
    BCRYPT_SALT_ROUNDS: number;
}

const config: Readonly<AppConfig> = Object.freeze({
    NODE_ENV,
    PORT,
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    FRONTEND_URL,
    BCRYPT_SALT_ROUNDS,
});

export default config;

export {
    NODE_ENV,
    PORT,
    MONGODB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    FRONTEND_URL,
    BCRYPT_SALT_ROUNDS,
};