const httpStatus = require("http-status");

const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");

const errorConverter = (error, req, res, next) => {
    if (!(error instanceof ApiError)) {
        logger.error("errorConvertorIf===>%o", error);
        const statusCode = error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode];
        error = new ApiError(statusCode, message, false, error.stack)
    }
    logger.error("errorConvertor===>%s", error);
    next(error);
}

const errorHandler = (error, req, res, next) => {
    let {
        statusCode,
        message,
    } = error;
    if (!error.isOperational) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    }

    const response = {
        code: statusCode,
        message,
    }
    res.status(statusCode).send(response);
}

module.exports = {
    errorConverter,
    errorHandler
};