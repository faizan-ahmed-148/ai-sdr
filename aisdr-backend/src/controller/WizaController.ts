import { Request, Response } from "express";
import { successResponse, errorResponse, statusCodes } from "../utils";
import { callbackSchema, createPropectListSchema } from "../validations/integrations/wiza.schema";
import { createHash } from "crypto";
import { isEmpty } from "../helpers";
import Wiza from "../services/integration/wiza";
import WizaException from "../exceptions/integrations/WizaException";
import Prisma from "../services/DbService";

export default class WizaController {
  private static readonly wiza = new Wiza();

  static async createPropectList(req: Request, res: Response) {
    const { error, value } = createPropectListSchema.validate(req.body);

    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
      });
    }

    try {
      const { list, filters } = value;
      const data = await WizaController.wiza.createProspectList(list, filters);

      await Prisma.wiza.create({
        data: {
          userId: req.user?.id,
          listId: data.id,
          name: data.name,
          reportType: data.report_type,
        },
      });

      return successResponse({
        res,
        data,
        message: "prospect list created",
      });
    } catch (error) {
      if (error instanceof WizaException) {
        return errorResponse({
          res,
          message: error.message,
          statusCode: error.code,
        });
      }

      console.log(error);

      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async getPropectList(req: Request, res: Response) {
    const data = await Prisma.wiza.findMany({
      where: {
        userId: req.user?.id,
      },
    });

    return successResponse({
      res,
      data,
      message: "prospect list data",
    });
  }
  
  // static async getPropectList(req: Request, res: Response) {

  //   try {

  //     const prospectId = parseInt(req.params.id)

  //     const exists = await  Prisma.wiza.findFirst({
  //       where:{
  //         listId: prospectId,
  //         userId: req.user?.id,
  //       }
  //     })

  //     if (!exists) {
  //       return errorResponse({
  //         res,
  //         message: "prospect list not found",
  //         statusCode: statusCodes.NOT_FOUND,
  //       });
  //     }

  //     const data = await WizaController.wiza.getProspectList(prospectId);

  //     return successResponse({
  //       res,
  //       data,
  //       message: "prospect list data",
  //     });

  //   } catch (error) {

  //     if (error instanceof WizaException) {
  //       return errorResponse({
  //         res,
  //         message: error.message,
  //         statusCode: error.code,
  //       });
  //     }

  //     return errorResponse({
  //       res,
  //       message: "Internal server error",
  //       statusCode: statusCodes.INTERNAL_SERVER_ERROR,
  //     });
  //   }
  // }

  static async getPropectListContacts(req: Request, res: Response) {
    try {
      const prospectId = parseInt(req.params.id);
      const segment = (req.query.segment as string) ?? "people";

      const exists = await Prisma.wiza.findFirst({
        where: {
          listId: prospectId,
          userId: req.user?.id,
        },
      });

      if (!exists) {
        return errorResponse({
          res,
          message: "prospect list not found",
          statusCode: statusCodes.NOT_FOUND,
        });
      }

      const data = await WizaController.wiza.getProspectListContacts(
        prospectId,
        segment
      );

      return successResponse({
        res,
        data,
        message: "prospect list contacts",
      });
    } catch (error) {
      if (error instanceof WizaException) {
        return errorResponse({
          res,
          message: error.message,
          statusCode: error.code,
        });
      }

      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async callback(req: Request, res: Response) {
    const authKey = req.headers["x-auth-key"];

    if (
      !authKey ||
      createHash("sha256").update(process.env.WIZA_API_KEY!).digest("hex") != authKey
    ) {
      res.sendStatus(statusCodes.UNAUTHORIZED)
      return 
    }

    const { value, error } = callbackSchema.validate(req.body)
    const { id, status }   = value.json_data

    if(error){
      res.sendStatus(statusCodes.BAD_REQUEST)
      return 
    }

    if(!isEmpty(id) && status === "finished"){

      await Prisma.wiza.updateMany({
        where: {
          listId: id
        },
        data:{
          status: "FINISHED"
        }
      })
    }

    res.sendStatus(200);
  }
}
