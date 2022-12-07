const joi = require('joi');


const logger = require('../utils/logger');
const pick = require('../utils/pick');

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
            res.status(404).send({
                message: error.message
            });
        } else {
            res.status(400).send({
                message: error.message
            });
        }
    } else {
        logger.debug("Joi Validation Successful");
        Object.assign(req, value);
        next();
    }
}

module.exports = validate;