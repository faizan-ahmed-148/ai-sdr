import multer from "multer"
import { FileFilterCallback } from "multer"
import path from "path"
import fs from "fs"
import { isEmpty } from "../helpers"
import { Request, Response, NextFunction } from "express"
import { errorResponse, statusCodes } from "../utils"

function uploader({
  uploadPath = "",
  allowedTypes = ["image/jpeg", "image/png"],
  maxSizeMB   = 5,
  maxCount    = 10,
  multiple    = false
}) {
  if (isEmpty(uploadPath)) {
    throw new Error("Upload path is required")
  }
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadPath),
    filename:    (_req, file, cb) => {
      const ext       = path.extname(file.originalname)
      const baseName  = path.basename(file.originalname, ext)
      const safeName  = baseName.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      cb(null, `${Date.now()}_${safeName}${ext}`)
    },
  })

  const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed.`))
    }
  }

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  })

  // pick the right multer method
  const handler = multiple
    ? upload.array("files", maxCount)
    : upload.single("file")

  // wrap it so errors become 422
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, (err: any) => {
      if (err) {
        return errorResponse({
          res,
          message: err.message,
          statusCode: statusCodes.UNPROCESSABLE_ENTITY
        })
      }
      // any other error bubbles up
      next(err)
    })
  }
}

export default uploader
