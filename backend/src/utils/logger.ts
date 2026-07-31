import pino from "pino";

// creating a centralized logger for this application
const logger = pino({
    // controls which kinda logs appear
  level: process.env.LOG_LEVEL || "info",

  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

export default logger;