const joi = require('joi');

const adminRegisterSchema = {
    body: joi.object().keys({
        membershipId: joi.number().integer().min(10 ** 7).max(10 ** 8 - 1).required().messages({
            'number.base': `membershipId should be a type of 'number'`,
            'number.empty': `membershipId cannot be an empty field`,
            'number.min': `membershipId length should be equal to 8.`,
            'number.max': `membershipId length should be equal to 8.`,
            'any.required': `membershipId is a required field`
        }),
        email: joi.string().email().trim(true).required().messages({
            'string.base': `Email should be a type of 'string'`,
            'string.email': `Email should be a valid email format`,
            'string.empty': `Email cannot be an empty field`,
            'any.required': `Email is a required field`
        }),
        password: joi.string().alphanum().min(3).trim(true).required().messages({
            'string.base': `Password should be a type of 'string'`,
            'string.empty': `Password cannot be an empty field`,
            'string.min': `Password cannot be less than 3 charachters`,
            'any.required': `Password is a required field`
        }),
        role: joi.string().required().valid('admin', 'volunteer', 'execom').messages({
            'string.base': `role should be a type of 'string'`,
            'string.empty': `role cannot be an empty field`,
            'any.required': `role is a required field`,
            'any.only': `role must be one of [admin, volunteer, execom]`
        }),
        name: joi.string().alphanum().trim().min(2).required().messages({
            'string.base': `name should be a type of 'string'`,
            'string.empty': `name cannot be an empty field`,
            'any.required': `name is a required field`
        }),
    })
};

const userRegisterSchema = {
    body: joi.object().keys({
        regId: joi.number().integer().min(10 ** 10).max(10 ** 11 - 1).required().messages({
            'number.base': `regId should be a type of 'number'`,
            'number.empty': `regId cannot be an empty field`,
            'number.min': `regId length should be equal to 11.`,
            'number.max': `regId length should be equal to 11.`,
            'any.required': `regId is a required field`
        }),
        email: joi.string().email().trim(true).required().messages({
            'string.base': `Email should be a type of 'string'`,
            'string.email': `Email should be a valid email format`,
            'string.empty': `Email cannot be an empty field`,
            'any.required': `Email is a required field`
        }),
        seatNo: joi.number().integer().messages({
            'number.base': `Seat No should be a type of 'number'`,
            'number.empty': `Seat No cannot be an empty field`,
            'any.required': `Seat No is a required field`
        }),
        present: joi.boolean().required().messages({
            'boolean.base': `Present should be a type of 'number'`,
            'boolean.empty': `Present cannot be an empty field`,
            'any.required': `Present is a required field`
        }),
        points: joi.number().integer().default(150).min(0).messages({
            'number.base': `points should be a type of 'number'`,
        }),
        eventId: joi.string().length(24).alphanum().trim(true).required().messages({
            'string.base': `eventId should be a type of 'string'`,
            'string.empty': `eventId cannot be an empty field`,
            'string.length': `eventId length should be 24.`,
            'any.required': `eventId is a required field`
        }),
        name: joi.string().trim(true).min(2).required().messages({
            'string.base': `Name should be a type of 'string'`,
            'string.empty': `Name cannot be an empty field`,
            'any.required': `Name is a required field`
        }),
    })
};

const canteenRegisterSchema = {
    body: joi.object().keys({
        email: joi.string().email().trim(true).required().messages({
            'string.base': `Email should be a type of 'string'`,
            'string.email': `Email should be a valid email format`,
            'string.empty': `Email cannot be an empty field`,
            'any.required': `Email is a required field`
        }),
        canteenName: joi.string().min(2).required().messages({
            'string.base': `Canteen Name should be a type of 'string'`,
            'string.empty': `Canteen Name cannot be an empty field`,
            'string.min': `Enter Canteen Name with more than 2 charachters`,
            'any.required': `Canteen Name is a required field`
        }),
        phoneNo: joi.number().integer().min(10 ** 9).max(10 ** 10 - 1).required().messages({
            'number.base': `Phone No should be a type of 'number'`,
            'number.empty': `Phone No cannot be an empty field`,
            'number.min': `Please enter Phone number of 10 digits`,
            'number.max': `Please enter Phone number of 10 digits`,
            'any.required': `Phone No Name is a required field`
        }),
        password: joi.string().alphanum().min(3).trim(true).required().messages({
            'string.base': `Password should be a type of 'string'`,
            'string.empty': `Password cannot be an empty field`,
            'string.min': `Password cannot be less than 3 charachters`,
            'any.required': `Password is a required field`
        }),
        ownerName: joi.string().min(2).required().messages({
            'string.base': `Owner Name should be a type of 'string'`,
            'string.empty': `Owner Name cannot be an empty field`,
            'string.min': `Enter Owner Name with more than 2 charachters`,
            'any.required': `Owner Name is a required field`
        }),
        points: joi.number().integer().default(0).min(0).messages({
            'number.base': `points should be a type of 'number'`,
            'number.empty': `points  cannot be an empty field`,
            'any.required': `points  is a required field`
        }),
    })
};


const eventRegisterSchema = {
    body: joi.object().keys({
        eventType: joi.string().required().valid('technical', 'non-technical').messages({
            'string.base': `Event Type should be a type of 'string'`,
            'string.empty': `Event Type cannot be an empty field`,
            'any.required': `Event Type is a required field`
        }),
        eventName: joi.string().min(2).required().messages({
            'string.base': `Event Name should be a type of 'string'`,
            'string.empty': `Event Name cannot be an empty field`,
            'string.min': `Event Name should be more than 2 charachters`,
            'any.required': `Event Name is a required field`
        }),
        eventDate: joi.number().integer().min(10 ** 9).max(10 ** 10 - 1).required().messages({
            'number.base': `Event Date should be a type of 'string'`,
            'number.empty': `Event Date cannot be an empty field`,
            'number.min': `Event Date should be equal to 10 digit`,
            'number.max': `Event Date should be equal to 10 digit`,
            'any.required': `Event Date is a required field`
        }),
    })
};


const adminLoginSchema = {
    body: joi.object().keys({
        membershipId: joi.number().integer().min(10 ** 7 - 1).max(10 ** 8 - 1).required().messages({
            'number.base': `membershipId should be a type of 'number'`,
            'number.empty': `membershipId cannot be an empty field`,
            'number.min': `membershipId length should be equal to 8.`,
            'number.max': `membershipId length should be equal to 8.`,
            'any.required': `membershipId is a required field`
        }),
        password: joi.string().alphanum().min(3).trim(true).required().messages({
            'string.base': `Password should be a type of 'string'`,
            'string.empty': `Password cannot be an empty field`,
            'string.min': `Password cannot be less than 3 charachters`,
            'any.required': `Password is a required field`
        }),
    })
};

const canteenLoginSchema = {
    body: joi.object().keys({
        email: joi.string().email().trim(true).required().messages({
            'string.base': `Email should be a type of 'string'`,
            'string.email': `Email should be a valid email format`,
            'string.empty': `Email cannot be an empty field`,
            'any.required': `Email is a required field`
        }),
        password: joi.string().alphanum().min(3).trim(true).required().messages({
            'string.base': `Password should be a type of 'string'`,
            'string.empty': `Password cannot be an empty field`,
            'string.min': `Password cannot be less than 3 charachters`,
            'any.required': `Password is a required field`
        }),
    })
};

const userLoginSchema = {
    body: joi.object().keys({
        regId: joi.number().integer().min(10 ** 10 - 1).max(10 ** 11 - 1).required().messages({
            'number.base': `regId should be a type of 'number'`,
            'number.empty': `regId cannot be an empty field`,
            'number.min': `regId length should be equal to 11.`,
            'number.max': `regId length should be equal to 11.`,
            'any.required': `regId is a required field`
        }),
        email: joi.string().email().trim(true).required().messages({
            'string.base': `Email should be a type of 'string'`,
            'string.empty': `Email cannot be an empty field`,
            'string.min': `Email cannot be less than 3 charachters`,
            'any.required': `Email is a required field`
        }),
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