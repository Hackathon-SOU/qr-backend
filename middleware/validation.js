const joi = require('joi');


const pick = require('../utils/pick');

const validate = (schema) => (req, res, next) => {
    const validSchema = pick(schema, ['query', 'params', 'body']);
    const object = pick(req, Object.keys(validSchema));
    // console.log(validSchema)
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
        console.log(error);
        res.status(401).send({
            message: error.message
        });
    } else {
        console.log("Joi Validation Successful");
        Object.assign(req, value);
        next();
    }
}

module.exports = validate;