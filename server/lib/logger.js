import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  transports: [
    new winston.transports.Console(),
    // Optionally write to a log file:
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
  ],
});

export default logger;
