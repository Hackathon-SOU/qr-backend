const joi = require('joi');

const eventReportSchema = {
    query: joi.object().keys({
        eventId: joi.string().length(24).required().messages({
            'string.base': `eventId should be a type of 'string'`,
            'string.empty': `eventId cannot be an empty field`,
            'string.length': `eventId length should be 24.`,
            'any.required': `eventId is a required field`
        }),
    })
}
const eventDeleteSchema = {
    body: joi.object().keys({
        eventId: joi.string().length(24).required().messages({
            'string.base': `eventId should be a type of 'string'`,
            'string.empty': `eventId cannot be an empty field`,
            'string.length': `eventId length should be 24.`,
            'any.required': `eventId is a required field`
        }),
    })
}

module.exports = {
    eventReportSchema,
    eventDeleteSchema
}