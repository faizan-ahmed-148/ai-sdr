import Joi from "joi";

export const createSchema = Joi.object({
  title: Joi.string().required().messages({
    "string.base": "Title must be a string.",
    "any.required": "Title is required.",
  }),
  description: Joi.string().allow("", null).optional(),
})
  .unknown(true)
  .options({ allowUnknown: true })  // keep allowing extra fields
  .required()
  .messages({
    "any.required": "Request body is required",
    "object.base": "Request body must be a valid JSON object",
  });
