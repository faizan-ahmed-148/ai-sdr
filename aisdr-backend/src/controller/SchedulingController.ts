import Joi from "joi";
import Prisma from "../services/DbService";
import { Request, Response } from "express";
import { successResponse, errorResponse, statusCodes } from "../utils";
import { schedule } from "node-cron";
import { createSchema, updateSchema } from "../validations/scheduling.schema";

export default class SchedulingController {
  static async index(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;
    const schedules = await Prisma.scheduled_emails.findMany({
      where: { userId: req.user?.id },
      skip: skip,
      take: limit,
    });

    const totalSchedules = await Prisma.scheduled_emails.count({
      where: { userId: req.user?.id },
    });
    const totalPages = Math.ceil(totalSchedules / limit);

    return successResponse({
      res,
      message: "Schedules data fetched successfully",
      data: schedules,
      pagination: {
        currentPage: page,
        totalPages,
        totalSchedules,
        limit,
      },
    });
  }

  static async show(req: Request, res: Response) {
    try {
      const schedule = await Prisma.scheduled_emails.findUnique({
        where: { id: parseInt(req.params.scheduleId) },
      });

      if (!schedule) {
        return errorResponse({
          res,
          message: "Schedule not found",
          statusCode: statusCodes.NOT_FOUND,
        });
      }

      return successResponse({
        res,
        message: "Schedule data fetched successfully",
        data: schedule,
      });
    } catch (error) {
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async create(req: Request, res: Response) {

    const { value, error } = createSchema.validate(req.body);
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
        statusCode: statusCodes.BAD_REQUEST,
      });
    }

    const { campaignId, knowledgebaseId, prompt, fromName, fromEmail, fromDesignation, sentAt } = value

    const campaign = await Prisma.campaigns.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return errorResponse({
        res,
        message: "Campaign not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    const knowledgebase = await Prisma.knowledgebase.findUnique({
      where: { id: knowledgebaseId, userId: req.user?.id },
    });

    if (!knowledgebase) {
      return errorResponse({
        res,
        message: "Knowledgebase not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    try {
      await Prisma.scheduled_emails.create({
        data: {
          userId: req.user?.id,
          campaignId,
          knowledgebaseId,
          prompt,
          fromName,
          fromEmail,
          fromDesignation,
          sentAt: new Date(sentAt),
        },
      });

      return successResponse({
        res,
        message: "Scheduling created successfully",
        statusCode: statusCodes.CREATED,
      });
    } catch (error) {
      console.log(error);

      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async update(req: Request, res: Response) {

    const { value, error } = updateSchema.validate(req.body);
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
        statusCode: statusCodes.BAD_REQUEST,
      });
    }

    const { campaignId, knowledgebaseId, prompt, fromName, fromEmail, fromDesignation, sentAt } = value

    const campaign = await Prisma.campaigns.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return errorResponse({
        res,
        message: "Campaign not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    const knowledgebase = await Prisma.knowledgebase.findUnique({
      where: { id: knowledgebaseId, userId: req.user?.id },
    });

    if (!knowledgebase) {
      return errorResponse({
        res,
        message: "Knowledgebase not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    try {
      const updatedSchedule = await Prisma.scheduled_emails.update({
        where: { id: parseInt(req.params.scheduleId) },
        data: {
          campaignId,
          knowledgebaseId,
          prompt,
          fromName,
          fromEmail,
          fromDesignation,
          sentAt: new Date(sentAt).toISOString(),
        },
      });

      if (!updatedSchedule) {
        return errorResponse({
          res,
          message: "Schedule not found",
          statusCode: statusCodes.NOT_FOUND,
        });
      }

      return successResponse({
        res,
        message: "Scheduling updated successfully",
        data: updatedSchedule,
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
    const schedule = await Prisma.scheduled_emails.findUnique({
      where: { id: parseInt(req.params.scheduleId) },
    });

    if (!schedule) {
      return errorResponse({
        res,
        message: "Schedule not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    if (!schedule) {
      return errorResponse({
        res,
        message: "Schedule not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    try {
      await Prisma.scheduled_emails.delete({
        where: { id: parseInt(req.params.scheduleId) },
      });

      return successResponse({
        res,
        message: "Scheduling deleted successfully",
        statusCode: statusCodes.OK,
      });
    } catch (error) {
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
