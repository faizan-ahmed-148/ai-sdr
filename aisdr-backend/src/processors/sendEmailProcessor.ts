import MailService from "../services/Mail/MailService";
import { Logger } from "../utils";

export default async function sendEmailProcessor(job: any) {
  try {
    const { from, to, subject, body } = job.data;
    await MailService.provider("bison").send({
      from,
      to,
      subject,
      html: body,
    });
  } catch (error: any) {
    Logger.error(error.message, "email-queue.log");
  }
}
