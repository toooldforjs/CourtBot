const winston = require("winston");
require("winston-daily-rotate-file");
const { createLogger, format } = require("winston");

const transportToFile = new winston.transports.DailyRotateFile({
	dirname: "logs",
	filename: "errors-%DATE%.log",
	datePattern: "YYYY-MM-DD",
	zippedArchive: false,
	maxSize: "5m",
	maxFiles: "7d",
});

const logger = createLogger({
	level: "error",
	format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
	transports: [transportToFile],
});

module.exports = logger;
