import nodemailer from "nodemailer";
import Base from "./Base";

export default class Local extends Base {
  async send({
    from,
    to,
    subject,
    html,
    text,
  }: {
    from: string;
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }) {
    // Create a transporter using the SMTP transport configuration from the provider
    const transporter = nodemailer.createTransport({
      host: this.config['host'],
      port: this.config['port'],
    });

    const mailOptions: {
      from: string;
      to: string;
      subject: string;
      text?: string;
      html?: string;
    } = {
      from,
      to,
      subject,
    };

    if (text) {
      mailOptions.text = text;
    }

    if (html) {
      mailOptions.html = html;
    }

    return await transporter.sendMail(mailOptions);
  }
}
