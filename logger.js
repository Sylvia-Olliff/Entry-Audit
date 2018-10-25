'use strict';

const winston = require('winston');
const moment = require('moment-timezone');
const fs = require('fs');

winston.emitErrs = true;

let logger;

if (process.env.NODE_ENV) {
  logger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({
        name: `std-log`,
        level: 'info',
        filename: './logs/info.log',
        json: true,
        prettyPrint: true,
        humanReadableUnhandledException: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
        timestamp () {
          return moment(new Date()).tz('America/New_York').format();
        },
        stderrLevels: ['error']
      }),
      new (winston.transports.File)({
        name: 'error-log',
        level: 'error',
        filename: './logs/errors.log',
        json: true,
        prettyPrint: true,
        humanReadableUnhandledException: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
        timestamp () {
          return moment(new Date()).tz('America/New_York').format();
        },
        stderrLevels: ['error']
      })
    ]
  });
} else {
  logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        name: `std-log`,
        level: 'debug',
        json: true,
        prettyPrint: true,
        humanReadableUnhandledException: true,
        timestamp () {
          return moment(new Date()).tz('America/New_York').format();
        },
        stderrLevels: ['error']
      }),
      new (winston.transports.Console)({
        name: 'error-log',
        level: 'error',
        json: true,
        prettyPrint: true,
        humanReadableUnhandledException: true,
        timestamp () {
          return moment(new Date()).tz('America/New_York').format();
        },
        stderrLevels: ['error']
      })
    ]
  });
}

logger.stream = {
  write (msg, encoding) {
    logger.log('info', msg.replace(/(\n)/g, ''));
  }
};

fs.access('./logs', (err) => {
  if (err && err.errno === -2) {
    fs.mkdir('./logs', (error) => {
      if (!error) {
        logger.log('debug', `Logs directory did not exist and so was created`);
      } else {
        logger.log('error', error);
      }
    });
  } else if (!err) {
    logger.log('debug', `Logs Directory exists`);
  } else {
    logger.log('error', err);
  }
});

module.exports = logger;