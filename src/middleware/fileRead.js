const httpStatus = require("http-status");
const logger = require("../utils/logger");
const path = require("path");
const fs = require("fs");
const fileRead = (req, res, next) => {
    const fileName = `sheet-${req.query.eventId}.xlsx`;
    req.fileName = fileName;
    const filePath = path.join(path.resolve(), `tmp/${fileName}`);
    const stream = fs.createWriteStream(filePath);

    stream.on('open', () => req.pipe(stream));

    stream.on('close', () => {
        // Send a success response back to the client
        const msg = `Data uploaded to ${filePath}`;
        logger.debug('Processing  ...  100%');
        logger.debug(msg);
        next();
    });
}

module.exports = fileRead;