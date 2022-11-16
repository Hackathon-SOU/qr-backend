const joi = require('joi');

const adminRegisterSchema = {
    body: joi.object().keys({
        membershipId: joi.number().integer().min(10 ** 7).max(10 ** 8 - 1).required(),
        email: joi.string().email().trim(true).required(),
        password: joi.string().alphanum().min(3).trim(true).required(),
        role: joi.string().required(),
        name: joi.string().alphanum().trim().min(2).required(),
    })
};

const userRegisterSchema = {
    body: joi.object().keys({
        regId: joi.number().integer().min(10 ** 10).max(10 ** 11 - 1).required(),
        email: joi.string().email().trim(true).required(),
        seatNo: joi.number().integer(),
        present: joi.boolean().required(),
        points: joi.number().integer().default(150).min(0),
        eventId: joi.string().length(24).alphanum().trim(true).required(),
        name: joi.string().trim(true).min(2).required(),
    })
};

const canteenRegisterSchema = {
    body: joi.object().keys({
        email: joi.string().email().trim(true).required(),
        canteenName: joi.string().min(2).required(),
        phoneNo: joi.number().integer().min(10 ** 9).max(10 ** 10 - 1).required(),
        password: joi.string().alphanum().min(3).trim(true).required(),
        ownerName: joi.string().min(2).required(),
        points: joi.number().integer().default(0).min(0),
    })
};


const eventRegisterSchema = {
    body: joi.object().keys({
        eventType: joi.string().required(),
        eventName: joi.string().min(2).required(),
        eventDate: joi.number().integer().min(10 ** 9).max(10 ** 10 - 1).required(),
    })
};


const adminLoginSchema = {
    body: joi.object().keys({
        membershipId: joi.number().integer().min(10 ** 7 - 1).max(10 ** 8 - 1).required(),
        password: joi.string().alphanum().min(3).trim(true).required(),
    })
};

const canteenLoginSchema = {
    body: joi.object().keys({
        email: joi.string().email().trim(true).required(),
        password: joi.string().alphanum().min(3).trim(true).required(),
    })
};

const userLoginSchema = {
    body: joi.object().keys({
        regId: joi.number().integer().min(10 ** 10 - 1).max(10 ** 11 - 1).required(),
        email: joi.string().email().trim(true).required(),
    })
};

module.exports = {
    adminRegisterSchema,
    userRegisterSchema,
    canteenRegisterSchema,
    eventRegisterSchema,
    adminLoginSchema,
    userLoginSchema,
    canteenLoginSchema,
};