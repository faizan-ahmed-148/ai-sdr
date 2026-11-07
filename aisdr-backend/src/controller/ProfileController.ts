import { Request, Response } from "express";
import { successResponse, errorResponse, statusCodes } from "../utils";
import bcrypt from "bcryptjs";
import Joi from "joi";
import Prisma from "../services/DbService";

export default class ProfileController {
  static async profile(req: Request, res: Response) {

    const user = await Prisma.users.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        accountType: true,
        companyName: true,
        email: true,
      },
    });

    return successResponse({
      res,
      message: "user profile",
      data: user,
    });
  }

  static async updatePassword(req: Request, res: Response) {
    const schema = Joi.object({
      password: Joi.string().min(6).required().messages({
        "string.base": "Password must be a string.",
        "string.empty": "Password is required.",
        "string.min": "Password must be at least 6 characters long.",
        "any.required": "Password is required.",
      }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
      });
    }

    const { password } = req.body;

    try {

      const hashedPassword = await bcrypt.hash(password, 10);

      await Prisma.users.update({
        where: { id: req.user?.id },
        data: {
          password: hashedPassword,
        },
      });

      return successResponse({
        res,
        message: "Your password has been updated successfully.",
      });
    } catch (err: any) {
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    const schema = Joi.object({
      firstName: Joi.string().min(2).required().messages({
        "string.base": "firstName must be a string.",
        "string.empty": "firstName is required.",
        "string.min": "firstName must be at least 3 characters long.",
        "any.required": "firstName is required.",
      }),
       lastName: Joi.string().min(2).required().messages({
        "string.base": "lastName must be a string.",
        "string.empty": "lastName is required.",
        "string.min": "lastName must be at least 3 characters long.",
        "any.required": "lastName is required.",
      }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
      });
    }

    const { firstName, lastName } = req.body;

    try {
      await Prisma.users.update({
        where: { id: req.user?.id },
        data: {
          firstName,
          lastName,
        },
      });

      return successResponse({
        res,
        message: "Your profile has been updated successfully.",
      });
    } catch (err: any) {
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
