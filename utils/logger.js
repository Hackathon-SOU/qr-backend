const winston = require('winston');

const {
    transports,
    format,
    createLogger
} = winston;
const {
    combine,
    printf
} = format;
// creating a log time
const currentDateString = new Date().toLocaleDateString();
const currentTimeString = new Date().toLocaleTimeString();
const logTime = `${currentDateString} || ${currentTimeString}`;

const customLog = printf(({
    level,
    message,
    metadata
}) => {
    return Object.keys(metadata).length == 0 ?
        ` ** LEVEL: [${ level}] LogTime: [${logTime}] Message: [${message}] \n` :
        ` ** LEVEL: [${ level}] LogTime: [${logTime}] Message: [${message}] \n ${JSON.stringify(metadata)} \n`;
});

// custom date for logging in different files for the date

const date = new Date();

const newdate = `${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`
// defining options to use in creating logger 

const options = {
    info: {
        level: 'info',
        dirname: 'logs/info',
        json: true,
        handleException: true,
        colorize: true,
        datePattern: 'YYY-MM-DD-HH',
        filename: `combined-${newdate}.log`
    },
    error: {
        level: 'error',
        dirname: 'logs/error',
        json: true,
        handleException: true,
        colorize: true,
        datePattern: 'YYY-MM-DD-HH--SS',
        filename: `error-${newdate}.log `
    },
    debug: {
        level: 'debug',
        dirname: 'logs/debug',
        json: true,
        handleException: true,
        datePattern: 'YYY-MM-DD-HH--SS',
    }
}

const logger = new createLogger({
    format: combine(
        format.json(),
        format.splat(),
        format.metadata({
            fillExcept: ["message", "level", "timestamp", "label"]
        }),
        customLog),
    transports: [
        new transports.File(options.info),
        new transports.File(options.error),
        new transports.Console(options.debug)
    ],
    exitOnError: false
});
module.exports = logger;