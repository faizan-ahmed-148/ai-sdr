import MailInterface from "../../contract/MailInterface";

abstract class MailService implements MailInterface {
  protected config: Record<string, any>;

  constructor(config: object) {
    this.config = config;
  }

  // Mark send as abstract to ensure subclasses implement it
  abstract send({
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
  }): Promise<any>;
}

export default MailService;
