import { resendClient } from "@/lib/clients/axios-client";

interface ISendEmailParams {
  to: string;
  subject: string;
  html?: string;
  from?: string;
  template?: {
    id: string;
    variables: {
      [key: string]: string | number | boolean;
    };
  };
}

interface IEmailResponse {
  id: string;
  from: string;
  to: string[];
  created_at: string;
}

class ResendService {
  async sendEmail(params: ISendEmailParams): Promise<IEmailResponse> {
    try {
      const payload = {
        from: params.from || "Magical CX <noreply@magicalcx.com>",
        to: [params.to],
        subject: params.subject,
        template: params.template,
        html: params.html,
      };

      const response = await resendClient.post("/emails", payload);

      console.log(`Email sent to ${params.to} with ID: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Error sending email:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}

const resendService = new ResendService();
export default resendService;
