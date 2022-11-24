const logger = require("../utils/logger");

const notFound = (req, res, next) => {
    const error = new Error(`Not FOUND - ${req.originalUrl}`);
    res.sendStatus(404);
    next(error);
}

const errorHandling = (error, req, res, next) => {
    logger.error("%o", error);
    res.sendStatus(500).send({
        message: "Something is wrong"
    });
}

module.exports = {
    notFound,
    errorHandling
};