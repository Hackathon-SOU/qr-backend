const joi = require("joi");

const getUserDetailsSchema = {
  query: joi.object().keys({
    regId: joi
      .number()
      .integer()
      .min(10 ** 10)
      .max(10 ** 11 - 1)
      .required()
      .messages({
        "number.base": `regId should be a type of 'number'`,
        "number.empty": `regId cannot be an empty field`,
        "number.min": `regId length should be equal to 11.`,
        "number.max": `regId length should be equal to 11.`,
        "any.required": `regId is a required field`,
      }),
  }),
};
const getAllUserDetailsSchema = {
  query: joi.object().keys({
    eventId: joi.string().length(24).alphanum().trim(true).required().messages({
      "string.base": `eventId should be a type of 'string'`,
      "string.empty": `eventId cannot be an empty field`,
      "string.length": `eventId length should be 24.`,
      "any.required": `eventId is a required field`,
    }),
  }),
};
const updateMemberDetailSchema = {
  body: joi.object().keys({
    email: joi.string().email().trim(true).required().messages({
      "string.base": `Email should be a type of 'string'`,
      "string.email": `Email should be a valid email format`,
      "string.empty": `Email cannot be an empty field`,
      "any.required": `Email is a required field`,
    }),
    firstName: joi.string().alphanum().trim().min(2).required().messages({
      "string.base": `name should be a type of 'string'`,
      "string.empty": `name cannot be an empty field`,
      "any.required": `name is a required field`,
    }),
    lastName: joi.string().alphanum().trim().min(2).required().messages({
      "string.base": `name should be a type of 'string'`,
      "string.empty": `name cannot be an empty field`,
      "any.required": `name is a required field`,
    }),
  }),
};
const markPresenceSchema = {
  body: joi.object().keys({
    regId: joi
      .number()
      .integer()
      .min(10 ** 10)
      .max(10 ** 11 - 1)
      .required()
      .messages({
        "string.base": `regId should be a type of 'string'`,
        "string.empty": `regId cannot be an empty field`,
        "string.length": `regId length should be 24.`,
        "any.required": `regId is a required field`,
      }),
    present: joi.boolean().required().messages({
      "boolean.base": `present should be a type of 'string'`,
      "boolean.empty": `present cannot be an empty field`,
      "boolean.required": `present is a required field`,
    }),
  }),
};

module.exports = {
  getUserDetailsSchema,
  getAllUserDetailsSchema,
  markPresenceSchema,
  updateMemberDetailSchema,
};
