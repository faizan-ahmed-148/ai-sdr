import Joi from "joi";

export const campaignLeadsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
  type: Joi.string().valid("assigned", "unassigned").default("assigned"),
  search: Joi.string().optional().allow(""),
})
.required()
.messages({
  "any.required": "Request body is required",
  "object.base": "Request body must be a valid JSON object",
});
;
