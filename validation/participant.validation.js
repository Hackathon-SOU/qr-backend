const joi = require('joi');

const getUserDetailsSchema = {
    body: joi.object().keys({
        regId: joi.number().integer().min(10 ** 10).max(10 ** 11 - 1).required(),
    })
}
const getAllUserDetailsSchema = {
    body: joi.object().keys({
        eventId: joi.string().length(24).alphanum().trim(true).required(),
    })
}
const markPresenceSchema = {
    body: joi.object().keys({
        regId: joi.number().integer().min(10 ** 10).max(10 ** 11 - 1).required(),
        present: joi.boolean().required(),
    })
}

module.exports = {
    getUserDetailsSchema,
    getAllUserDetailsSchema,
    markPresenceSchema
}