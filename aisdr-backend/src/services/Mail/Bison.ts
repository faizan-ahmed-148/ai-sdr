import axios from "axios";
import Base from "./Base";

export default class Biso extends Base {
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
    const payload = {
      subject: subject,
      message: html,
      sender_email_id: this.config["senderEmailId"],
      content_type: "html",
      to_emails: [{ name: from, email_address: to }],
    };

    return axios.post(
      "https://customer.prodigygroup.io/api/replies/new",
      payload,
      {
        headers: {
          Authorization: `Bearer ${this.config.token}`,
        },
      }
    );

  }
}
