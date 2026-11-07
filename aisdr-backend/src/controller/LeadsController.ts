import Joi from "joi";
import Prisma from "../services/DbService";
import { Request, Response } from "express";
import { successResponse, errorResponse, statusCodes } from "../utils";
import { Prisma as PrismaNamespace } from "@prisma/client";
import { createManySchema, createSchema } from "../validations/leads.schema";
import { chunk } from "../utils/chunk";

export default class LeadsController {
  static async index(req: Request, res: Response) {

    const page   = parseInt(req.query.page as string, 10) || 1;
    const limit  = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string)?.trim();
    const skip   = (page - 1) * limit;

    const whereClause: any = {
      userId: req.user?.id,                 
      ...(search && {                        
        OR: [
          { firstName:   { contains: search, mode: "insensitive" } },
          { lastName:    { contains: search, mode: "insensitive" } },
          { email:       { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // Fire off both queries in parallel
    const [leads, totalLeads] = await Promise.all([
      Prisma.leads.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { campaignLeads: true },
      }),
      Prisma.leads.count({ where: whereClause }),
    ]);


    return successResponse({
      res,
      message: "Leads data fetched successfully",
      data: leads,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalLeads / limit),
        totalLeads,
        limit,
      },
    });

  }

  static async show(req: Request, res: Response) {
    const { leadId } = req.params;

    // Check if the lead exists
    const lead = await Prisma.leads.findFirst({
      where: { userId: req.user?.id, id: parseInt(leadId) },
    });

    if (!lead) {
      return errorResponse({
        res,
        message: "Lead not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    return successResponse({
      res,
      message: "Lead data fetched successfully",
      data: lead,
    });
  }

  static async create(req: Request, res: Response) {

    const { value, error } = createSchema.validate(req.body);
    if (error) return errorResponse({ res, message: error.details[0].message });

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      role,
      website,
      additionalFields,
      campaignId,
    } = value;

    // Check if the campaign exists if campaignId is provided
    if (campaignId) {
      const campaign = await Prisma.campaigns.findUnique({
        where: { id: campaignId, userId: req.user?.id },
      });

      if (!campaign) {
        return errorResponse({
          res,
          message: "Campaign not found",
          statusCode: statusCodes.NOT_FOUND,
        });
      }
    }

    // Check for duplicate lead email
    const duplicate = await Prisma.leads.findFirst({
      where: { userId: req.user?.id, email },
    });

    if (duplicate)
      return errorResponse({
        res,
        message: `Lead with email ${email} already exists`,
        statusCode: statusCodes.CONFLICT,
      });

    // Creating lead with a transaction for campaign association if provided
    try {
      const data = await Prisma.$transaction(async (transaction) => {
        const lead = await transaction.leads.create({
          data: {
            userId: req.user?.id,
            firstName,
            lastName,
            email,
            phone,
            role,
            company,
            website,
            additionalFields,
          },
        });

        if (campaignId) {
          await transaction.campaign_lead_pivot.create({
            data: {
              campaignId,
              userId: req.user?.id,
              leadId: lead.id,
            },
          });
        }

        return lead;
      });

      return successResponse({
        res,
        message: "Lead created successfully",
        statusCode: statusCodes.CREATED,
        data,
      });
    } catch (err) {
      console.log(err);

      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async createMany(req: Request, res: Response) {
    const { value, error } = createManySchema.validate(req.body);
    if (error) {
      return errorResponse({ res, message: error.details[0].message });
    }
  
    const { campaignId, leads } = value;
    const BATCH_SIZE = 500;
    const userId = req.user!.id;
  
    // 1) If campaignId was provided, make sure it exists & belongs to this user
    if (campaignId) {
      const campaign = await Prisma.campaigns.findUnique({
        where: { id: campaignId, userId },
      });
      if (!campaign) {
        return errorResponse({
          res,
          message: "Campaign not found",
          statusCode: statusCodes.NOT_FOUND,
        });
      }
    }
  
    try {
      // 2) Wrap all batches in one transaction
      await Prisma.$transaction(async (tx) => {
  
        for (const batch of chunk(leads, BATCH_SIZE)) {
          // 2a) Attach userId to every lead
          const withUser = batch.map((l: any) => ({
            ...l,
            userId,
          }));
  
          // 2b) Bulk-insert leads (skip duplicates)
          await tx.leads.createMany({
            data: withUser,
            skipDuplicates: true,
          });
  
          // 2c) Re‐query *all* leads in this batch to get their IDs
          const emails = withUser.map((d) => d.email);
          const batchLeads = await tx.leads.findMany({
            where: {
              userId,
              email: { in: emails },
            },
            select: { id: true },
          });
  
          // 2d) If campaignId provided, bulk‐insert into pivot
          if (campaignId) {
            const pivotData = batchLeads.map((lead) => ({
              campaignId,
              userId,
              leadId: lead.id,
            }));
  
            await tx.campaign_lead_pivot.createMany({
              data: pivotData,
              skipDuplicates: true,
            });
  
          }
        }
  
      });
  
      // 3) Return a little summary of how many got in
      return successResponse({
        res,
        message: "Leads imported successfully",
        statusCode: statusCodes.CREATED,
      });
    } catch (e) {
      console.error(e);
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async update(req: Request, res: Response) {
    const schema = Joi.object({
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
      company: Joi.string().allow("").allow(null).optional(),
      website: Joi.string().allow("").allow(null).optional(),
      additionalFields: Joi.object().unknown(true).allow(null).optional(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) return errorResponse({ res, message: error.details[0].message });

    const { leadId } = req.params;

    // Check if lead exists
    const lead = await Prisma.leads.findFirst({
      where: { id: parseInt(leadId), userId: req.user?.id },
    });

    if (!lead) {
      return errorResponse({
        res,
        message: "Lead not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    // Update lead
    await Prisma.leads.update({
      where: { id: parseInt(leadId), userId: req.user?.id },
      data: value,
    });

    return successResponse({
      res,
      message: "Lead updated successfully",
    });
  }

  static async destroy(req: Request, res: Response) {
    const { leadId } = req.params;

    try {
      await Prisma.leads.delete({
        where: { id: parseInt(leadId), userId: req.user?.id },
      });

      return successResponse({
        res,
        message: "Lead deleted successfully",
      });
    } catch (err: any) {
      if (err.code === "P2025") {
        return errorResponse({
          res,
          message: "Lead not found or you do not have permission",
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

  static async assignCampaign(req: Request, res: Response) {
    const schema = Joi.object({
      selection: Joi.string().valid("all", "custom").required().messages({
        "any.only": "Selection must be either 'all' or 'custom'.",
        "string.empty": "Selection is required.",
        "any.required": "Selection is required.",
      }),

      campaign_ids: Joi.when("selection", {
        is: "custom",
        then: Joi.array().min(1).required().messages({
          "array.base": "campaign_ids must be an array.",
          "any.required":
            "campaign_ids is required when selection is 'custom'.",
        }),
      }),
    });

    const { leadId } = req.params;
    const { error, value } = schema.validate(req.body);

    if (error) return errorResponse({ res, message: error.details[0].message });

    // Check if the lead exists
    const lead = await Prisma.leads.findFirst({
      where: { userId: req.user?.id, id: parseInt(leadId) },
    });

    if (!lead) {
      return errorResponse({
        res,
        message: "Lead not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    try {
      switch (value.selection) {
        case "all":
          await Prisma.$queryRaw`
            INSERT INTO campaign_lead_pivot ("campaignId", "leadId", "userId")
            SELECT id, ${parseInt(leadId)}, ${req.user?.id} FROM campaigns
            ON CONFLICT ("campaignId", "leadId", "userId") DO NOTHING; 
          `;
          break;

        case "custom":
          await Prisma.$queryRaw`
            INSERT INTO campaign_lead_pivot ("campaignId", "leadId", "userId")
            SELECT id, ${parseInt(leadId)}, ${req.user?.id} FROM campaigns
            WHERE id IN (${PrismaNamespace.join(value.campaign_ids)})
            ON CONFLICT ("campaignId", "leadId", "userId") DO NOTHING; 
          `;
          break;
      }

      return successResponse({
        res,
        message: "Lead successfully assigned to campaign",
      });
    } catch (error: any) {
      console.log(error);

      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async unassignCampaign(req: Request, res: Response) {
    const schema = Joi.object({
      selection: Joi.string().valid("all", "custom").required().messages({
        "any.only": "Selection must be either 'all' or 'custom'.",
        "string.empty": "Selection is required.",
        "any.required": "Selection is required.",
      }),

      campaign_ids: Joi.when("selection", {
        is: "custom",
        then: Joi.array().min(1).required().messages({
          "array.base": "campaign_ids must be an array.",
          "any.required":
            "campaign_ids is required when selection is 'custom'.",
        }),
      }),
    });

    const { leadId } = req.params;
    const { error, value } = schema.validate(req.body);

    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
      });
    }

    // Check if the lead exists
    const lead = await Prisma.leads.findFirst({
      where: { userId: req.user?.id, id: parseInt(leadId) },
    });

    if (!lead) {
      return errorResponse({
        res,
        message: "Lead not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    try {
      switch (value.selection) {
        case "all":
          await Prisma.$queryRaw`
            DELETE FROM campaign_lead_pivot
            WHERE 
              "userId"         = ${req.user?.id} 
              AND "leadId"     = ${parseInt(leadId)}
          `;
          break;

        case "custom":
          await Prisma.$queryRaw`
            DELETE FROM campaign_lead_pivot
            WHERE 
              "userId"         = ${req.user?.id} 
              AND "leadId"     = ${parseInt(leadId)}
              AND "campaignId" IN (${PrismaNamespace.join(value.campaign_ids)})
          `;
          break;
      }

      return successResponse({
        res,
        message: "Campaigns unassigned successfully",
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

  static async leadCampaigns(req: Request, res: Response) {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).default(10),
      type: Joi.string().valid("assigned", "unassigned").default("assigned"),
    });

    const { error } = schema.validate(req.query);

    if (error)
      return errorResponse({
        res,
        message: `Invalid query: ${error.details[0].message}`,
        statusCode: statusCodes.BAD_REQUEST,
      });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const leadId = Number(req.params.leadId);
    const type = req.query.type || "assigned";
    const userId = req.user?.id;
    const skip = (page - 1) * limit;

    try {
      const lead = await Prisma.leads.findFirst({
        where: { userId: req.user?.id, id: leadId },
      });

      if (!lead) {
        return errorResponse({
          res,
          message: "Lead not found",
          statusCode: statusCodes.NOT_FOUND,
        });
      }
      // Determine the condition for 'assigned' or 'unassigned'
      const whereCondition =
        type === "assigned"
          ? PrismaNamespace.sql`p."campaignId" IS NOT NULL`
          : PrismaNamespace.sql`p."campaignId" IS NULL`;

      // Get the total number of leads for the pagination
      const totalCampaignQuery: any = await Prisma.$queryRaw`
        SELECT COUNT(*) AS total
        FROM campaigns c
        LEFT JOIN campaign_lead_pivot p
          ON p."campaignId" = c.id
          AND p."leadId" = ${leadId}
        WHERE ${whereCondition}
          AND c."userId" = ${userId}
      `;

      const totalLeads = Number(totalCampaignQuery[0]?.total || 0);
      const totalPages = Math.ceil(totalLeads / limit);

      // Fetch the leads for the current page
      const leads: any[] = await Prisma.$queryRaw`
        SELECT c.*
        FROM campaigns c
        LEFT JOIN campaign_lead_pivot p
          ON p."campaignId" = c.id
          AND p."leadId" = ${leadId}
        WHERE ${whereCondition}
          AND c."userId" = ${userId}
        ORDER BY c.id DESC
        LIMIT ${limit} OFFSET ${skip}
      `;

      // Return the response with the leads data and pagination
      return successResponse({
        res,
        message: "Campaign leads",
        data: leads,
        pagination: {
          currentPage: page,
          totalPages,
          totalLeads,
          limit,
        },
      });
    } catch (error) {
      console.log(error);

      // Return error response if something goes wrong
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
