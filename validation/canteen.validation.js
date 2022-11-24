const joi = require('joi');

const getMenuSchema = {
    body: joi.object().keys({
        canteenId: joi.string().length(24).required().messages({
            'string.base': `canteenId should be a type of 'string'`,
            'string.empty': `canteenId cannot be an empty field`,
            'string.length': `canteenId length should be 24.`,
            'any.required': `canteenId is a required field`
        }),
    })
}

const foodRegisterSchema = {
    body: joi.object().keys({
        name: joi.string().required().messages({
            'string.base': `Name should be a type of 'string'`,
            'string.empty': `Name cannot be an empty field`,
            'any.required': `Name is a required field`
        }),
        price: joi.number().integer().min(5).required().messages({
            'number.base': `price should be a type of 'number'`,
            'number.empty': `price cannot be an empty field`,
            'number.min': `price minimum value should be 5.`,
            'any.required': `price is a required field`
        }),
    })
}

const transactionSchema = {
    body: joi.object().keys({
        foodItemArray: joi.array().items(joi.object({
            foodItemId: joi.string().length(24).trim(true).required().messages({
                'string.base': `foodItemId should be a type of 'string'`,
                'string.empty': `foodItemId cannot be an empty field`,
                'string.length': `foodItemId length should be 24.`,
                'any.required': `foodItemId is a required field`
            }),
            quantity: joi.number().integer().min(1).required().messages({
                'number.base': `quantity should be a type of 'number'`,
                'number.empty': `quantity cannot be an empty field`,
                'number.min': `quantity minimum length should be 1.`,
                'any.required': `quantity is a required field`
            })
        })).required().messages({
            'array.base': `foodItemArray should be a type of 'string'`,
            'array.empty': `foodItemArray cannot be an empty field`,
            'array.length': `foodItemArray length should be 24.`,
            'any.required': `foodItemArray is a required field`
        }),
        canteenId: joi.string().length(24).required().messages({
            'string.base': `canteenId should be a type of 'string'`,
            'string.empty': `canteenId cannot be an empty field`,
            'string.length': `canteenId length should be 24.`,
            'any.required': `canteenId is a required field`
        }),
    })
}
module.exports = {
    getMenuSchema,
    transactionSchema,
    foodRegisterSchema
}