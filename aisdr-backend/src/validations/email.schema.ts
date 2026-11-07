import Joi from "joi";

export const sendMailSchema = Joi.object({
  to: Joi.string().email().required().messages({
    "string.base": 'The "to" email should be a string.',
    "string.empty": 'The "to" email is required.',
    "string.email": 'Please provide a valid "to" email address.',
    "any.required": 'The "to" email is required.',
  }),
  from: Joi.string().email().required().messages({
    "string.base": 'The "from" email should be a string.',
    "string.empty": 'The "from" email is required.',
    "string.email": 'Please provide a valid "from" email address.',
    "any.required": 'The "from" email is required.',
  }),
  subject: Joi.string().min(1).max(255).required().messages({
    "string.base": "Subject should be a string.",
    "string.empty": "Subject is required.",
    "string.min": "Subject must not be empty.",
    "string.max": "Subject must be less than or equal to 255 characters.",
    "any.required": "Subject is required.",
  }),
  body: Joi.string().min(1).required().messages({
    "string.base": "Body should be a string.",
    "string.empty": "Body is required.",
    "string.min": "Body must not be empty.",
    "any.required": "Body is required.",
  }),
})
  .required()
  .messages({
    "any.required": "Request body is required",
    "object.base": "Request body must be a valid JSON object",
  });
