import { Response, NextFunction, Request } from "express";
import { errorResponse, statusCodes } from "../utils";
import Prisma from "../services/DbService";
import jwt from "jsonwebtoken";

export default async function AuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return errorResponse({
      res,
      message: "Token is missing.",
      statusCode: statusCodes.UNAUTHORIZED,
    });
  }

  try {
    // Verify the token
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Fetch the user from the database
    const user = await Prisma.users.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (!user) {
      return errorResponse({
        res,
        message: "User not found.",
        statusCode: statusCodes.UNAUTHORIZED,
      });
    }

    // Assign the user to req.user, but now we know it is valid
    req.user = user; // only set the userId to match the expected type

    next();
  } catch (err: any) {
    return errorResponse({
      res,
      message: "Invalid or expired token. Please log in again.",
      statusCode: statusCodes.UNAUTHORIZED,
    });
  }
}
