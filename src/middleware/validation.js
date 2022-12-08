const joi = require('joi');
const httpStatus = require('http-status');

const logger = require('../utils/logger');
const pick = require('../utils/pick');
const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
    const validSchema = pick(schema, ['query', 'params', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const {
        value,
        error
    } = joi.compile(validSchema)
        .prefs({
            errors: {
                label: 'key'
            },
            abortEarly: false
        }).validate(object);

    if (error) {
        logger.error("JOI validation error===> %o", error);
        if (error.details[0].type == "any.required") {
            throw new ApiError(httpStatus.NOT_FOUND, error.message)
        } else {
            logger.error("It works here in error");
            throw new ApiError(httpStatus.BAD_REQUEST, error.message);
        }
    } else {
        logger.debug("Joi Validation Successful");
        Object.assign(req, value);
        next();
    }
}

module.exports = validate;