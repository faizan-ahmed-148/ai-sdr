import Joi from "joi";

export const createSchema = Joi.object({
  firstName: Joi.string().required().messages({
    "string.base": "First name must be a string.",
    "any.required": "First name is required.",
  }),
  lastName: Joi.string().allow("").allow(null).optional(),
  email: Joi.string().required().email().messages({
    "string.base": "Email must be a string.",
    "any.required": "Email is required.",
  }),
  phone: Joi.string().required().messages({
    "string.base": "Phone must be a string.",
    "any.required": "Phone is required.",
  }),
  company: Joi.string().required(),
  role: Joi.string().required(),
  website: Joi.string().allow("").allow(null).optional(),
  additionalFields: Joi.object().unknown(true).allow(null).optional(),
  campaignId: Joi.number().integer().optional().messages({
    "number.base": '"campaignId" must be a number',
  }),
})
  .required()
  .messages({
    "any.required": "Request body is required",
    "object.base": "Request body must be a valid JSON object",
  });

export const createManySchema = Joi.object({
  campaignId: Joi.number().integer().optional().messages({
    "number.base": '"campaignId" must be a number',
  }),
  leads: Joi.array()
    .items({
      firstName: Joi.string().required().messages({
        "string.base": "First name must be a string.",
        "any.required": "First name is required.",
      }),
      email: Joi.string().required().email().messages({
        "string.base": "Email must be a string.",
        "any.required": "Email is required.",
      }),
      role: Joi.string().required(),
      company: Joi.string().required(),
      lastName: Joi.string().allow("").allow(null).optional(),
      phone: Joi.string().allow("").allow(null).optional(),
      website: Joi.string().allow("").allow(null).optional(),
      additionalFields: Joi.object().unknown(true).allow(null).optional(),
    })
    .required()
    .messages({
      "array.base": "Leads must be an array.",
      "any.required": "The 'leads' array is required.",
    }),
})
  .required()
  .messages({
    "any.required": "Request body is required",
    "object.base": "Request body must be a valid JSON object",
  });
