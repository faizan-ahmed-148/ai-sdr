import axios, { AxiosError, Method } from "axios";
import WizaException from "../../exceptions/integrations/WizaException";

export default class Wiza {
  private apiKey: string;
  private endpoints: Record<string, string>;

  constructor() {
    this.apiKey = process.env.WIZA_API_KEY!;
    this.endpoints = {
      search: "https://wiza.co/api/prospects/search",
      get_list: "https://wiza.co/api/lists/{id}",
      get_list_contacts: "https://wiza.co/api/lists/{id}/contacts?segment={segment}",
      create_list: "https://wiza.co/api/lists",
      create_prospect_list: "https://wiza.co/api/prospects/create_prospect_list",
    };
  }

  private async makeApiRequest(
    method: Method,
    url: string,
    data?: Record<string, any>
  ){
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      };

      const response = await axios.request({
        method,
        url,
        data,
        ...config,
      });

      return response.data.data;
    } catch (err) {
      const error = err as AxiosError<any>;
      if (!error.response) {
        throw new WizaException("Unable to reach Wiza API", 503);
      }

      const { status: httpCode, data: body } = error.response;
      const apiMessage: string | undefined = body?.status?.message;
      const apiCode: number | undefined = body?.status?.code;

      const message =
        apiMessage ??
        (httpCode === 401
          ? "Unauthorized - API key might be revoked or invalid"
          : `Unexpected error (HTTP ${httpCode})`);

      throw new WizaException(message, apiCode ?? httpCode);
    }
  }

  async createProspectList(list: Record<string, any>, filters: Record<string, any>) {
    return this.makeApiRequest("post", this.endpoints['create_prospect_list'],{ list, filters });
  }

  async getProspectList(prospectListId: number) {
    return this.makeApiRequest("get", this.endpoints['get_list'].replace("{id}", String(prospectListId)));
  }

  async getProspectListContacts(prospectListId: number, segment: string) {
    return this.makeApiRequest(
      "get", 
      this.endpoints['get_list_contacts']
      .replace("{id}", String(prospectListId))
      .replace("{segment}", segment)
    );
  }

}