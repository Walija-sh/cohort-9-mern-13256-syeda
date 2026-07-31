import logger from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

if (!JWT_SECRET) {
    logger.fatal("JWT_SECRET is missing.");
    process.exit(1);
}

if (!JWT_EXPIRES_IN) {
    logger.fatal("JWT_EXPIRES_IN is missing.");
    process.exit(1);
}

export { JWT_SECRET, JWT_EXPIRES_IN };