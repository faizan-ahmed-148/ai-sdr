import { Request, Response } from "express";
import { successResponse, errorResponse, statusCodes, Logger } from "../utils";
import { createSchema } from "../validations/knowledgeBase.schema";
import Prisma from "../services/DbService";
import pdf from "pdf-parse";
import path from "path";
import fs from "fs"

export default class KnowledgebaseController {
  static async index(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string)?.trim();
    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId: req.user?.id,
      ...(search && {
        OR: [{ title: { contains: search, mode: "insensitive" } }],
      }),
    };

    const [knowledgebase, total] = await Promise.all([
      Prisma.knowledgebase.findMany({
        select: { id: true, title: true, description: true, file: true, createdAt: true },
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      Prisma.knowledgebase.count({ where: whereClause }),
    ]);

    return successResponse({
      res,
      message: "Knowledge base fetched successfully",
      data: {
        data: knowledgebase,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      statusCode: statusCodes.OK,
    });
  }

  static async show(req: Request, res: Response) {
    const knowledgebaseId = parseInt(req.params.id, 10);
    const knowledgebase = await Prisma.knowledgebase.findUnique({
      where: { id: knowledgebaseId, userId: req.user?.id },
    });

    if (!knowledgebase) {
      return errorResponse({
        res,
        message: "Knowledge base not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    return successResponse({
      res,
      message: "Knowledge base fetched successfully",
      data: knowledgebase,
      statusCode: statusCodes.OK,
    });
  }

  static async create(req: Request, res: Response) {
    const { value, error } = createSchema.validate(req.body);

    if (error) {
      return errorResponse({
        res,
        message: error.message,
        statusCode: statusCodes.BAD_REQUEST,
      });
    }

    if (!req.file) {
      return errorResponse({
        res,
        message: "File upload is required",
        statusCode: statusCodes.BAD_REQUEST,
      });
    }

    try {
      // 1. Read the uploaded PDF from disk
      const uploadDir = path.resolve(process.cwd(), "uploads", "knowledgebase");
      const filePath = path.join(uploadDir, req.file.filename);
      const buffer = fs.readFileSync(filePath);

      // // 2. Extract text
      const { text: content } = await pdf(buffer);

      // // 3. Persist record (including the extracted content)
      const knowledgebase = await Prisma.knowledgebase.create({
        data: {
          userId: req.user!.id,
          title: value.title,
          description: value.description || null,
          file: req.file.filename,
          content,
        },
      });

      return successResponse({
        res,
        message: "Knowledge base created successfully",
        data: knowledgebase,
        statusCode: statusCodes.CREATED,
      });

    } catch (err) {
      console.error("PDF parse/create error:", err);
      return errorResponse({
        res,
        message: "Failed to create knowledge base",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async update(req: Request, res: Response) { }

  static async destroy(req: Request, res: Response) {

    const knowledgebaseId = parseInt(req.params.id);

    const knowledgebase = await Prisma.knowledgebase.findUnique({
      where: { id: knowledgebaseId, userId: req.user?.id },
    });

    if (!knowledgebase) {
      return errorResponse({
        res,
        message: "Knowledge base not found",
        statusCode: statusCodes.NOT_FOUND,
      });
    }

    await Prisma.knowledgebase.delete({
      where: { id: knowledgebaseId },
    });

    const uploadDir = path.resolve(process.cwd(), "uploads", "knowledgebase");
    const filePath  = path.join(uploadDir, knowledgebase.file);

    fs.unlink(filePath, ()=>{
      Logger.error(`${filePath} not found`)
    })

    return successResponse({
      res,
      message: "Knowledge base deleted successfully",
      statusCode: statusCodes.OK,
    });
  }
}
