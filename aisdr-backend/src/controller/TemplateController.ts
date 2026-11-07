import Joi from "joi";
import Prisma from "../services/DbService";
import { Request, Response } from "express";
import { successResponse, errorResponse, statusCodes } from "../utils";

export default class TemplateController {
  static async index(req: Request, res: Response) {
    const page  = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10; 
  
    const skip = (page - 1) * limit;
    const templates = await Prisma.templates.findMany({
      where: { userId: req.user?.id },
      skip: skip,
      take: limit,
    });

    const totalTemplates = await Prisma.templates.count({
      where: { userId: req.user?.id },
    });
    const totalPages = Math.ceil(totalTemplates / limit);

    return successResponse({
      res,
      message: "Templates data fetched successfully",
      data: templates,
        pagination: {
        currentPage: page,
        totalPages,
        totalTemplates,
        limit,
      },
    });
  }

  static async show(req: Request, res: Response) {
    const { templateId } = req.params;
    const template = await Prisma.templates.findFirst({
      where: { userId: req.user?.id, id: parseInt(templateId) },
    });

    if (!template) {
      return errorResponse({
        res,
        message: "Template not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    return successResponse({
      res,
      message: "Template data fetched successfully",
      data: template,
    });
  }

  static async create(req: Request, res: Response) {
    const schema = Joi.object({
      name: Joi.string().required(),
      from: Joi.string().required(),
      subject: Joi.string().required(),
      body: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
        statusCode: statusCodes.BAD_REQUEST,
      });
    }

    const { name, from, subject, body } = req.body;

    // Check if template with same name exists
    const duplicate = await Prisma.templates.findFirst({
      where: { userId: req.user?.id, name },
    });

    if (duplicate) {
      return errorResponse({
        res,
        message: `Template with name ${name} already exists`,
        statusCode: statusCodes.CONFLICT,
      });
    }

    try {
      await Prisma.templates.create({
        data: { userId: req.user?.id, name, from, subject, body },
      });

      return successResponse({
        res,
        message: "Template created successfully",
        statusCode: statusCodes.CREATED,
      });
    } catch (error) {
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async update(req: Request, res: Response) {
    const schema = Joi.object({
      name: Joi.string().required(),
      from: Joi.string().required(),
      subject: Joi.string().required(),
      body: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
        statusCode: statusCodes.BAD_REQUEST,
      });
    }

    const { templateId } = req.params;

    // Check if the template exists
    const existingTemplate = await Prisma.templates.findFirst({
      where: { id: parseInt(templateId), userId: req.user?.id },
    });

    if (!existingTemplate) {
      return errorResponse({
        res,
        message: "Template not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    // Check for duplicate template name
    const duplicate = await Prisma.templates.findFirst({
      where: {
        userId: req.user?.id,
        name: value.name,
        id: { not: parseInt(templateId) },
      },
    });

    if (duplicate) {
      return errorResponse({
        res,
        message: `Template with name "${value.name}" already exists`,
        statusCode: statusCodes.CONFLICT,
      });
    }

    try {
      await Prisma.templates.update({
        where: { id: parseInt(templateId), userId: req.user?.id },
        data: value,
      });

      return successResponse({
        res,
        message: "Template updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async destroy(req: Request, res: Response) {
    const { templateId } = req.params;

    try {
      await Prisma.templates.delete({
        where: { id: parseInt(templateId), userId: req.user?.id },
      });

      return successResponse({
        res,
        message: "Template deleted successfully",
      });
    } catch (err: any) {
      if (err.code === "P2025") {
        return errorResponse({
          res,
          message: "Template not found or you do not have permission to delete it",
          statusCode: statusCodes.NOT_FOUND,
        });
      }

      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
