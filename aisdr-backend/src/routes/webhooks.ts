import express from "express"
import WizaController from "../controller/WizaController"


const router = express.Router()

// wiza
router.post('/integrations/wiza', WizaController.callback)

export default router