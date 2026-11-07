// src/schedulers/EmailScheduler.ts

import cron from "node-cron";
import CronService from "../services/CronService";
import Prisma from "../services/DbService";
import { emailQueue } from "../queue/emailQueue";
import { Logger } from "../utils";
import { EmailStatus } from "@prisma/client";
import axios from "axios";

export class EmailScheduler {
  private cronLock = new CronService("sendEmail");

  public start() {
    // Run once every minute, at second 1
    cron.schedule("1 * * * * *", async () => {
      let lockAcquired = false;
      try {
        
        lockAcquired = await this.cronLock.acquireLock();

        if (!lockAcquired) {
          Logger.warn("Email scheduler is already running");
          return;
        }

        const now = new Date();
        const toSend = await Prisma.scheduled_emails.findMany({
          where: {
            status: EmailStatus.PENDING,
            sentAt: { lte: now },
          },
          include: {
            campaign: true,
            knowledgebase: true,
          },
        });

        for (const job of toSend) {
          const { id: scheduledId, userId, campaignId } = job;
          Logger.info(`Processing scheduled email ${scheduledId}`);

          // Mark as PROCESSING
          await Prisma.scheduled_emails.update({
            where: { id: scheduledId },
            data: { status: EmailStatus.PROCESSING },
          });

          try {
            // build up all the leads in pages
            const leads = [];
            const chunkSize = 100;
            let skip = 0;

            while (true) {
              const batch = await Prisma.campaign_lead_pivot.findMany({
                where: { userId, campaignId },
                include: { lead: true },
                take: chunkSize,
                skip,
                orderBy: { id: "asc" },
              });

              if (batch.length === 0) {
                Logger.info(`All leads fetched for scheduled_email ${scheduledId}`);
                break;
              }

              Logger.info(
                `Fetched ${batch.length} leads (skip=${skip}) for scheduled_email ${scheduledId}`
              );

              for (const { lead } of batch) {
                leads.push({
                  name: `${lead.firstName} ${lead.lastName}`,
                  company: lead.company,
                  role: lead.role,
                  email: lead.email,
                });
              }

              skip += chunkSize;
            }

            // send to your email-generation API
            const response = await axios.post(
              "https://email.q22.ai/generate-email",
              {
                leads_data: leads,
                knowledge_base: job.knowledgebase.content,
                system_prompt: job.prompt,
                from_name: job.fromName,
                from_designation: job.fromDesignation,
                from_email: job.fromEmail,
              }
            );

            // if the API itself returns an error code, treat that as a failure
            if (response.status !== 200) {
              throw new Error(`Email API returned ${response.status}`);
            }

            console.log(response.data);

            // Mark as SENT
            await Prisma.scheduled_emails.update({
              where: { id: scheduledId },
              data: { status: EmailStatus.SENT },
            });

            Logger.info(`Finished scheduled_email ${scheduledId}`);
          } catch (jobErr) {
            // Something went wrong in this particular job:
            Logger.error(`Failed to process scheduled_email ${scheduledId}`);

            // Mark this one as FAILED so you can retry or inspect later
            await Prisma.scheduled_emails.update({
              where: { id: scheduledId },
              data: { status: EmailStatus.FAILED },
            });
          }
        }
      } catch (err) {
        // Any unexpected error in the overall loop
        Logger.error("Error in email scheduler main loop");
      } finally {
        // Always release the lock if we got it
        if (lockAcquired) {
          await this.cronLock.releaseLock();
        }
      }
    });
  }
}
