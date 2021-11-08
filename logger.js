// const winston = require("winston");
// require("winston-daily-rotate-file");

// const dashLog = new winston.transports.DailyRotateFile({
// 	filename: "./logs/dash-%DATE%.log",
// 	datePattern: "YYYY-MM-DD",
// 	zippedArchive: false,
// 	maxSize: "10m",
// });

// const dash = winston.createLogger({
// 	transports: [
// 		dashLog,
// 		new winston.transports.Console({
// 			colorize: true,
// 		}),
// 	],
// });

// module.exports = {
// 	dashLogger: dash,
// };
