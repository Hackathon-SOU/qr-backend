const httpStatus = require("http-status");
const logger = require("../utils/logger");
const path = require("path");
const fs = require("fs");
const fileRead = (req, res, next) => {
    logger.debug("req body ===>", req.files)
    logger.debug(Buffer.from(req.files, 'binary'))
}

module.exports = fileRead;