import Joi from "joi"

export const createSchema = Joi.object({
    campaignId: Joi.number().integer().required(),
    knowledgebaseId: Joi.number().integer().required(),
    prompt: Joi.string().required(),
    fromName: Joi.string().required(),
    fromEmail: Joi.string().email().required(),
    fromDesignation: Joi.string().required(),
    sentAt: Joi.date().required(),
})

export const updateSchema = Joi.object({
    campaignId: Joi.number().integer().required(),
    knowledgebaseId: Joi.number().integer().required(),
    prompt: Joi.string().required(),
    fromName: Joi.string().required(),
    fromEmail: Joi.string().email().required(),
    fromDesignation: Joi.string().required(),
    sentAt: Joi.date().required(),
})