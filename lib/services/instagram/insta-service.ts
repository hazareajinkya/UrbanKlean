import { instaClient } from "@/lib/clients/axios-client";
import { INSTA_PAGE_ACCESS_TOKEN } from "@/lib/constants";
import axios from "axios";

class InstaService {
  async sendTextMessage(to: string, text: string) {
    try {
      const response = await instaClient.post(`/messages`, {
        recipient: { id: to },
        message: { text: text },
      });

      console.log(`Message sent with ID: ${response.data.message_id}`);
      return response.data.message_id;
    } catch (error: any) {
      console.log("error: ", error.response?.data);
      console.log("Error sending message:", JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async subscribeToWebhook(token: string) {
    try {
      const response = await instaClient.post(`/subscribed_apps`, {
        accessToken: token,
        subscribed_fields: "messages",
      });
      console.log("response.data: ", response.data);
      return response.data;
    } catch (error: any) {
      console.log("error: ", error.response?.data);
      console.log(
        "Error subscribing to webhook:",
        JSON.stringify(error, null, 2)
      );
      throw error;
    }
  }

  async unsubscribeFromWebhook(token: string) {
    try {
      const response = await instaClient.delete(`/subscribed_apps`, {
        params: {
          accessToken: token,
        },
      });
      console.log("response.data: ", response.data);
      return response.data;
    } catch (error: any) {
      console.log("error: ", error.response?.data);
      console.log(
        "Error unsubscribing from webhook:",
        JSON.stringify(error, null, 2)
      );
      throw error;
    }
  }

  async getProfile(token: string) {
    try {
      const baseURl = "https://graph.instagram.com/v23.0/me";
      const { data } = await axios.get(`${baseURl}`, {
        params: {
          fields:
            "id,user_id,username,name,profile_picture_url,followers_count,media_count",
          accessToken: token,
        },
        headers: {
          Authorization: `Bearer ${INSTA_PAGE_ACCESS_TOKEN}`,
        },
      });
      console.log("data: ", data);

      const metadata = {
        ...data,
        id: data.user_id,
        id2: data.id,
      };

      delete metadata.user_id;

      return metadata;
    } catch (error: any) {
      console.log("error: ", error.response?.data);
      console.log("Error getting profile:", JSON.stringify(error, null, 2));
      throw error;
    }
  }
}

const instaService = new InstaService();
export default instaService;
