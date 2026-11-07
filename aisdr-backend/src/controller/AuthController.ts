import { successResponse, errorResponse, statusCodes } from "../utils"
import { Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"

import bcrypt from "bcryptjs"
import Joi from "joi"
import MailService from "../services/Mail/MailService"
import Prisma from "../services/DbService"

export default class AuthController {
  static async signup(req: Request, res: Response) {

    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        "string.base": "Email should be a string.",
        "string.empty": "Email is required.",
        "string.email": "Please provide a valid email address.",
        "any.required": "Email is required.", // This is for missing email
      }),
      password: Joi.string().min(6).required().messages({
        "string.base": "Password must be a string.",
        "string.empty": "Password is required.",
        "string.min": "Password must be at least 6 characters in length.",
        "any.required": "Password is required.", // This is for missing password
      }),
      firstName: Joi.string().min(3).required().messages({
        "string.base": "First Name must be a string.",
        "string.empty": "First Name is required.",
        "string.min": "First Name must be at least 3 characters long.",
        "any.required": "First Name is required.", // This is for missing name
      }),
      lastName: Joi.string().min(3).required().messages({
        "string.base": "Last Name must be a string.",
        "string.empty": "Last Name is required.",
        "string.min": "Last Name must be at least 3 characters long.",
        "any.required": "Last Name is required.", // This is for missing name
      }),
      accountType: Joi.string().required().messages({
        "string.base": "accountType must be a string.",
        "string.empty": "accountType is required.",
        "any.required": "accountType is required.", // This is for missing name
      }),
      companyName: Joi.string().optional()
    })

    const { error } = schema.validate(req.body)
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
      })
    }

    const { firstName, lastName, email, password, accountType, companyName } = req.body

    try {
      // Check if the email already exists
      const existingUser = await Prisma.users.findUnique({
        where: { email },
      })

      if (existingUser) {
        return errorResponse({
          res,
          message:
            "The provided email address is already associated with an existing account.",
          statusCode: statusCodes.CONFLICT,
        })
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create the user
      await Prisma.users.create({
        data: {
          firstName,
          lastName,
          email,
          accountType,
          companyName: accountType == 'company' ? companyName : null,
          password: hashedPassword,
        },
      })

      return successResponse({
        res,
        message: "User account created successfully.",
        statusCode: statusCodes.CREATED,
      })
    } catch (err: any) {

      return errorResponse({
        res,
        message: err?.message,
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  static async signin(req: Request, res: Response) {
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        "string.base": "Email should be a string.",
        "string.empty": "Email is required.",
        "string.email": "Please provide a valid email address.",
        "any.required": "Email is required.", // This is to handle missing fields
      }),
      password: Joi.string().min(6).required().messages({
        "string.base": "Password must be a string.",
        "string.empty": "Password is required.",
        "string.min": "Password must be at least 6 characters in length.",
        "any.required": "Password is required.", // This is to handle missing fields
      }),
    })

    const { error } = schema.validate(req.body)
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
      })
    }

    const { email, password } = req.body

    try {
      // Find the user by email
      const user = await Prisma.users.findUnique({
        where: { email },
      })

      if (!user) {
        return errorResponse({
          res,
          message:
            "Invalid email or password. Please check your credentials and try again.",
        })
      }

      // Compare the password
      const isPasswordValid = await bcrypt.compare(password, user.password!)
      if (!isPasswordValid) {
        return errorResponse({
          res,
          message:
            "Invalid email or password. Please check your credentials and try again.",
        })
      }

      // Create a JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      )

      return successResponse({
        res,
        message: "Login successful.",
        data: {
          token,
          user: {
            id: user.id.toString(),
            avatar: user.avatar,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
        },
      })
    } catch (err: any) {

      console.log(err);
      
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        "string.base": "Email should be a string.",
        "string.empty": "Email is required.",
        "string.email": "Please provide a valid email address.",
        "any.required": "Email is required.",
      }),
    })

    const { error } = schema.validate(req.body)
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
      })
    }

    const { email } = req.body

    try {
      // Check if the email exists
      const user = await Prisma.users.findUnique({
        where: { email },
      })

      if (!user) {
        return errorResponse({
          res,
          message: "No account found with the provided email address.",
          statusCode: statusCodes.NOT_FOUND,
        })
      }

      // Generate a reset token (using JWT)
      const resetToken = jwt.sign(
        { userId: user.id.toString(), email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" } // Token expires in 1 hour
      )

      // Send email with the reset token (for security, send a reset URL instead of the token directly)
      const resetUrl = `${process.env.APP_URL}/auth/recover-password?token=${resetToken}`

      MailService.provider("gmail").send({
        from: "Aidsr",
        to: email,
        subject: "Password Reset Request",
        html: `<p>You requested a password reset. Please click the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p>`, // HTML body
      })

      return successResponse({
        res,
        message: "A password reset link has been sent to your email address.",
      })
    } catch (err: any) {
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }

  static async resetPassword(req: Request, res: Response) {
    const schema = Joi.object({
      token: Joi.string().required().messages({
        "string.base": "Token must be a string.",
        "string.empty": "Token is required.",
        "any.required": "Token is required.",
      }),
      password: Joi.string().min(6).required().messages({
        "string.base": "Password must be a string.",
        "string.empty": "Password is required.",
        "string.min": "Password must be at least 6 characters long.",
        "any.required": "Password is required.",
      }),
    })

    const { error } = schema.validate(req.body)
    if (error) {
      return errorResponse({
        res,
        message: error.details[0].message,
        errorDetails: error.details,
      })
    }

    const { token, password } = req.body

    try {
      // Verify the reset token
      const { userId } = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload

      // Find the user by the decoded email (or user ID)
      const user = await Prisma.users.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return errorResponse({
          res,
          message: "No account found with the provided email address.",
          statusCode: statusCodes.NOT_FOUND,
        })
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Update the user's password
      await Prisma.users.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
      })

      return successResponse({
        res,
        message: "Your password has been reset successfully.",
      })
    } catch (err: any) {
      return errorResponse({
        res,
        message: "Internal server error",
        statusCode: statusCodes.INTERNAL_SERVER_ERROR,
      })
    }
  }
}
