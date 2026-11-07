import express from "express"
import AuthController from "../controller/AuthController"
import AuthMiddleware from "../middleware/AuthMiddleware"
import ProfileController from "../controller/ProfileController"
import ImportController from "../controller/ImportController"
import uploader from "../middleware/UploadMiddleware"
import CampaignController from "../controller/CampaignController"
import TemplateController from "../controller/TemplateController"
import LeadsController from "../controller/LeadsController"
import SchedulingController from "../controller/SchedulingController"
import WizaController from "../controller/WizaController"
import EmailController from "../controller/EmailController"
import KnowledgebaseController from "../controller/KnowledgebaseController"


const csvUploadMiddleware  = uploader({
    uploadPath: process.cwd() + "/tmp",
    allowedTypes: ['text/csv']
})

const pdfUploadMiddleware  = uploader({
    uploadPath: process.cwd() + "/uploads/knowledgebase",
    allowedTypes: ['application/pdf'],
    maxSizeMB:1,
})

const router = express.Router()

// Auth
router.post('/signup', AuthController.signup)
router.post('/signin', AuthController.signin)
router.post('/forgot', AuthController.forgotPassword)
router.post('/reset-password', AuthController.resetPassword)

// router.get('/foo', function(req:any, res){
//      // Set headers to enable SSE
//      res.setHeader('Content-Type', 'text/event-stream');
//      res.setHeader('Cache-Control', 'no-cache');
//      res.setHeader('Connection', 'keep-alive');
     
//      // Send data every 3 seconds
//      const interval = setInterval(() => {
//          const message = {
//              time: new Date().toLocaleTimeString(),
//              text: 'This is a message from the server'
//          };
//          // Send a message in SSE format
//          res.write(`id: foo\n`);
//          res.write(`event: foo\n`);
//          res.write(`data: ${JSON.stringify(message)}\n\n`);
//      }, 300);
 
//      // Handle client disconnect
//      req.on('close', () => {
//          clearInterval(interval);
//          res.end();
//      });


// })


// Email
router.post('/send-email', EmailController.sendMail)

router.use(AuthMiddleware)

// user
router.get('/profile', ProfileController.profile)
router.put('/profile', ProfileController.updateProfile)
router.put('/update-password', ProfileController.updatePassword)

// campaigns
router.get      ('/campaigns', CampaignController.index)
router.post     ('/campaigns', CampaignController.create)
router.get      ('/campaigns/:campaignId', CampaignController.show)
router.put      ('/campaigns/:campaignId', CampaignController.update)
router.delete   ('/campaigns/:campaignId', CampaignController.destroy)
router.get      ('/campaigns/:campaignId/leads', CampaignController.campaignLeads)
router.post     ('/campaigns/:campaignId/leads/assign', CampaignController.assignLeads)
router.delete   ('/campaigns/:campaignId/leads/unassign', CampaignController.unassignLeads)


// templates
router.get      ('/templates', TemplateController.index)
router.get      ('/templates/:templateId', TemplateController.show)
router.post     ('/templates', TemplateController.create)
router.put      ('/templates/:templateId', TemplateController.update)
router.delete   ('/templates/:templateId', TemplateController.destroy)

// schedulings
router.get      ('/schedules', SchedulingController.index)
router.get      ('/schedules/:scheduleId', SchedulingController.show)
router.post     ('/schedules', SchedulingController.create)
router.put      ('/schedules/:scheduleId', SchedulingController.update)
router.delete   ('/schedules/:scheduleId', SchedulingController.destroy)

// leads
router.get      ('/leads', LeadsController.index)
router.post     ('/leads', LeadsController.create)
router.post     ('/leads/many', LeadsController.createMany)
router.put      ('/leads/:leadId', LeadsController.update)
router.get      ('/leads/:leadId', LeadsController.show)
router.delete   ('/leads/:leadId', LeadsController.destroy)
router.get      ('/leads/:leadId/campaigns', LeadsController.leadCampaigns)
router.post     ('/leads/:leadId/campaigns/assign', LeadsController.assignCampaign)
router.delete   ('/leads/:leadId/campaigns/unassign', LeadsController.unassignCampaign)

// export / import
router.post('/import/leads', csvUploadMiddleware, ImportController.importLeads)

//wiza
router.post('/prospect/create', WizaController.createPropectList)
router.get('/prospect/list/', WizaController.getPropectList)
router.get('/prospect/list/:id/contacts', WizaController.getPropectListContacts)

//knowledgebase
router.get('/knowledgebase', KnowledgebaseController.index)
router.get('/knowledgebase/:id', KnowledgebaseController.show)
router.delete('/knowledgebase/:id', KnowledgebaseController.destroy)
router.post('/knowledgebase', pdfUploadMiddleware, KnowledgebaseController.create)

export default router