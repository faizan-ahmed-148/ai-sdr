import Prisma from "../services/DbService";
import fs from "fs";
import csvParser from "csv-parser";
import { Request, Response } from "express";
import { successResponse, errorResponse, statusCodes } from "../utils";

export default class ImportController {
  // Validation function to check if required columns are present
  static validate(row: any, requiredColumns: string[]): boolean {
    return requiredColumns.every((column) => row[column]);
  }

  static async importLeads(req: Request, res: Response) {
    if (!req.file) return errorResponse({ res, message: "File is required" });

    const filePath        = `${process.cwd()}/tmp/${req.file.filename}`;
    const leads: any[]    = [];
    const chunkSize       = 1000;
    const requiredColumns = ["firstName", "email", "phone", "company", "role"];
    const stream          = fs.createReadStream(filePath).pipe(csvParser());

    stream.on("data", (row) => {
      
      if (!ImportController.validate(row, requiredColumns)) {
        stream.destroy();
        return errorResponse({ res, message: "Invalid csv format", statusCode: statusCodes.UNPROCESSABLE_ENTITY, errorDetails: [{ name: "missing required columns" }] });
      }

      leads.push({
        userId:     req.user?.id,
        firstName:  row.firstName.trim(),
        email:      row.email.trim(),
        phone:      row.phone.trim(),
        company:    row.company?.trim(),
        role:       row.role?.trim(),
        lastName:   row.lastName?.trim()  || null,
        website:    row.website?.trim()   || null,
      });

      if (leads.length >= chunkSize) {
        stream.pause();
        Prisma.leads.createMany({ data: leads, skipDuplicates: true })
          .then(() => stream.resume())
          .catch((err) => errorResponse({ res, message: "Error importing leads", errorDetails: [err] }))
          .finally(() => leads.length = 0);
      }
    })
    .on("end", () => {
      if (leads.length) {
        Prisma.leads.createMany({ data: leads, skipDuplicates: true })
          .then(() => successResponse({ res, message: "Leads imported successfully" }))
          .catch((err) => errorResponse({ res, message: "Error importing leads", errorDetails: [err] }));
      } else {
        successResponse({ res, message: "Leads imported successfully" });
      }
    })
    .on("error", (err) => errorResponse({ res, message: "Error reading the file", errorDetails: [{ stream: err.message }] }))
    .on("close", () => fs.unlinkSync(filePath));
  }
}
