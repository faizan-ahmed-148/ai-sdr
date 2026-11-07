import Prisma from "../services/DbService";
import Joi from "joi";
import { Request, Response } from "express";
import { successResponse, errorResponse, statusCodes } from "../utils";
import { Prisma as PrismaNamespace } from "@prisma/client";
import { campaignLeadsSchema } from "../validations/campaign.schema";

export default class CampaignController {
  static async index(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim();

    const whereClause: any = {
      userId: req.user?.id,
      ...(search && {
        OR: [{ name: { contains: search, mode: "insensitive" } }],
      }),
    };

    const [campaigns, totalCampaigns] = await Promise.all([
      Prisma.campaigns.findMany({
        where: whereClause,
        skip: skip,
        take: limit,
      }),
      Prisma.campaigns.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCampaigns / limit);

    return successResponse({
      res,
      message: "campaings data",
      data: campaigns,
      pagination: {
        currentPage: page,
        totalPages,
        totalCampaigns,
        limit,
      },
    });
  }

  static async show(req: Request, res: Response) {
    const { campaignId } = req.params;
    const campaign = await Prisma.campaigns.findFirst({
      where: { userId: req.user?.id, id: parseInt(campaignId) },
    });

    if (!campaign) {
      return errorResponse({
        res,
        message: "campaign not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    return successResponse({
      res,
      message: "campaings data",
      data: campaign,
    });
  }

  static async create(req: Request, res: Response) {
    const schema = Joi.object({
      name: Joi.string().required().messages({
        "string.base": "Name must be a string.",
        "string.empty": "Name is required.",
        "any.required": "Name is required.",
      }),
      description: Joi.string().allow("").messages({
        "string.base": "Description must be a string.",
      }),
      templateId: Joi.number().allow(null).allow("").optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
      });
    }

    try {
      const { name, description } = req.body;

      const duplicate = await Prisma.campaigns.findFirst({
        where: { userId: req.user?.id, name },
      });

      if (duplicate) {
        return errorResponse({
          res,
          message: `campaign with name ${name} already exists`,
          statusCode: statusCodes.CONFLICT,
        });
      }

      await Prisma.campaigns.create({
        data: {
          name,
          description,
          userId: req.user?.id,
        },
      });

      return successResponse({
        res,
        message: "campaing created",
        statusCode: statusCodes.CREATED,
      });
    } catch (error: any) {
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async update(req: Request, res: Response) {
    const schema = Joi.object({
      name: Joi.string().required().messages({
        "string.base": "Name must be a string.",
        "string.empty": "Name cannot be empty.",
        "any.required": "Name is required.",
      }),
      description: Joi.string().allow("").messages({
        "string.base": "Description must be a string.",
      }),
      templateId: Joi.number().allow(null).allow("").optional(),
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

    const { campaignId } = req.params;

    try {
      const existing = await Prisma.campaigns.findFirst({
        where: { id: parseInt(campaignId) },
      });

      if (!existing) {
        return errorResponse({
          res,
          message: "Campaign not found",
          statusCode: statusCodes.NOT_FOUND,
        });
      }

      const duplicate = await Prisma.campaigns.findFirst({
        where: {
          userId: req.user?.id,
          name: value.name,
          id: { not: parseInt(campaignId) },
        },
      });

      if (duplicate) {
        return errorResponse({
          res,
          message: `Campaign with name "${value.name}" already exists`,
          statusCode: statusCodes.CONFLICT,
        });
      }

      const updated = await Prisma.campaigns.update({
        where: { id: parseInt(campaignId), userId: req.user?.id },
        data: value,
      });

      return successResponse({
        res,
        message: "Campaign updated successfully",
      });
    } catch (err: any) {
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async destroy(req: Request, res: Response) {
    const { campaignId } = req.params;

    try {
      await Prisma.campaigns.delete({
        where: { id: parseInt(campaignId), userId: req.user?.id },
      });

      return successResponse({
        res,
        message: "Campaign deleted successfully",
      });
    } catch (err: any) {
      if (err.code === "P2025") {
        return errorResponse({
          res,
          message:
            "Campaign not found or you do not have permission to delete it",
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

  static async campaignLeads(req: Request, res: Response) {

    const { error } = campaignLeadsSchema.validate(req.query);
    if (error) {
      return errorResponse({
        res,
        message: `Invalid query: ${error.details[0].message}`,
        statusCode: statusCodes.BAD_REQUEST,
      });
    }
  
    // 2. Parse pagination & filters
    const page       = Number(req.query.page)  || 1;
    const limit      = Number(req.query.limit) || 10;
    const type       = (req.query.type as string)   || "assigned";
    const search     = (req.query.search as string)?.trim();
    const campaignId = Number(req.params.campaignId);
    const userId     = req.user?.id!;
    const skip       = (page - 1) * limit;
  
    try {
      // 3. Ownership check
      const campaign = await Prisma.campaigns.findFirst({
        where: { id: campaignId, userId },
        select: { id: true },
      });
      if (!campaign) {
        return errorResponse({
          res,
          message: "Campaign not found",
          statusCode: statusCodes.NOT_FOUND,
        });
      }
  
      // 4. Build the where‐clause
      const where: any = {
        userId,
        // only include leads assigned (some) or unassigned (none) to this campaign
        ...(type === "assigned"
          ? { campaignLeads: { some: { campaignId } } }
          : { campaignLeads: { none: { campaignId } } }),
        // if `search` is provided, restrict to leads whose name/email contains it
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName:  { contains: search, mode: "insensitive" } },
            { email:     { contains: search, mode: "insensitive" } },
          ],
        }),
      };
  
      // 5. Fetch count + page of leads in parallel
      const [ totalLeads, leads ] = await Promise.all([
        Prisma.leads.count({ where }),
        Prisma.leads.findMany({
          where,
          skip,
          take:     limit,
          orderBy:  { createdAt: "desc" },
          include:  { campaignLeads: true },
        }),
      ]);
  
      // 6. Compute totalPages & respond
      const totalPages = Math.ceil(totalLeads / limit);
      return successResponse({
        res,
        message: "Campaign leads fetched successfully",
        data: leads,
        pagination: { currentPage: page, totalPages, totalLeads, limit },
      });
    } catch (err) {
      console.error(err);
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
  
  static async assignLeads(req: Request, res: Response) {
    const schema = Joi.object({
      selection: Joi.string().valid("all", "custom").required().messages({
        "any.only": "Selection must be either 'all' or 'custom'.",
        "string.empty": "Selection is required.",
        "any.required": "Selection is required.",
      }),

      lead_ids: Joi.when("selection", {
        is: "custom",
        then: Joi.array().min(1).required().messages({
          "array.base": "lead_ids must be an array.",
          "any.required": "lead_ids is required when selection is 'custom'.",
        }),
      }),
    });

    const { campaignId } = req.params;
    const { error, value } = schema.validate(req.body);

    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
      });
    }

    try {
      switch (value.selection) {
        case "all":
          await Prisma.$queryRaw`
            INSERT INTO campaign_lead_pivot ("campaignId", "leadId", "userId")
            SELECT ${parseInt(campaignId)}, id, ${req.user?.id} FROM leads
            ON CONFLICT ("campaignId", "leadId", "userId") DO NOTHING; 
          `;
          break;

        case "custom":
          await Prisma.$queryRaw`
            INSERT INTO campaign_lead_pivot ("campaignId", "leadId", "userId")
            SELECT ${parseInt(campaignId)}, id, ${req.user?.id} FROM leads
            WHERE id IN (${PrismaNamespace.join(value.lead_ids)})
            ON CONFLICT ("campaignId", "leadId", "userId") DO NOTHING; 
          `;
          break;
      }

      return successResponse({
        res,
        message: "Leads assigned successfully",
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

  static async unassignLeads(req: Request, res: Response) {
    const schema = Joi.object({
      selection: Joi.string().valid("all", "custom").required().messages({
        "any.only": "Selection must be either 'all' or 'custom'.",
        "string.empty": "Selection is required.",
        "any.required": "Selection is required.",
      }),

      lead_ids: Joi.when("selection", {
        is: "custom",
        then: Joi.array().min(1).required().messages({
          "array.base": "lead_ids must be an array.",
          "any.required": "lead_ids is required when selection is 'custom'.",
        }),
      }),
    });

    const { campaignId } = req.params;
    const { error, value } = schema.validate(req.body);

    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
      });
    }

    try {
      switch (value.selection) {
        case "all":
          await Prisma.$queryRaw`
            DELETE FROM campaign_lead_pivot
            WHERE 
              "userId"         = ${req.user?.id} 
              AND "campaignId" = ${parseInt(campaignId)}
          `;
          break;

        case "custom":
          await Prisma.$queryRaw`
            DELETE FROM campaign_lead_pivot
            WHERE 
              "userId"         = ${req.user?.id} 
              AND "campaignId" = ${parseInt(campaignId)}
              AND "leadId" IN (${PrismaNamespace.join(value.lead_ids)})
          `;
          break;
      }

      return successResponse({
        res,
        message: "Leads unassigned successfully",
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
}
