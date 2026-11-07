import { successResponse, errorResponse, statusCodes } from "../utils";
import { Request, Response } from "express";
import { sendMailSchema } from "../validations/email.schema";
import { emailQueue } from "../queue/emailQueue";

export default class EmailController {
  static async sendMail(req: Request, res: Response) {
    
    const { value, error } = sendMailSchema.validate(req.body);
    
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
      });
    }

    try {

      await emailQueue.add("sendEmail", value);
      return successResponse({
        res,
        message: "Email queued",
      });

    } catch (err) {
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
