const joi = require('joi');

const getMenuSchema = {
    body: joi.object().keys({
        canteenId: joi.string().length(24).required(),
    })
}

const foodRegisterSchema = {
    body: joi.object().keys({
        name: joi.string().required(),
        price: joi.number().integer().min(5).required(),
    })
}

const transactionSchema = {
    body: joi.object().keys({
        foodItemArray: joi.array().items(joi.object({
            foodItemId: joi.string().length(24).trim(true).required(),
            quantity: joi.number().integer().min(1).required()
        })).required(),
        canteenId: joi.string().length(24).required(),
    })
}
module.exports = {
    getMenuSchema,
    transactionSchema,
    foodRegisterSchema
}