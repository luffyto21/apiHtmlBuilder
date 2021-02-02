const appRoot = require('app-root-path');
const winston = require('winston');
// Use JSON logging for log files
// Here winston.format.errors() just seem to work
// because there is no winston.format.simple()
const jsonLogFileFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp(),
  winston.format.prettyPrint(),
);

// Create file loggers
const logger = winston.createLogger({
  level: 'debug',
  format: jsonLogFileFormat,
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename:  `${appRoot}/logs/error.log`, level: 'error' }),
    new winston.transports.File({ filename:  `${appRoot}/logs/app.log`, level: 'info' })
  ],
  expressFormat: true,
});

module.exports.logger = logger;