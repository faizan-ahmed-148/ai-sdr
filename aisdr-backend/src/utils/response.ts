import { Response } from "express";
import { statusCodes } from "./statusCodes";

// Success response with consistent structure
export const successResponse = ({
  res,
  message,
  data = null,
  statusCode = statusCodes.OK,
  ...params
}: {
  res: Response;
  message: string;
  data?: any;
  statusCode?: statusCodes;
  [key: string]: any;
}) => {
  res.status(statusCode).json({
    status: "success",
    message: message,
    data: data,
    ...params
  });
};

// Error response with consistent structure
export const errorResponse = ({
  res,
  message,
  errorDetails = [],
  statusCode = statusCodes.BAD_REQUEST,
}: {
  res: Response;
  message: string;
  errorDetails?: Array<Record<string, any>>;
  statusCode?: statusCodes;
}) => {
  res.status(statusCode).json({
    status: "error",
    message: message,
    error: errorDetails,
  });
};
