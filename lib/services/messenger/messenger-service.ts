import axiosClient, {
  instaClient,
  messengerClient,
} from "@/lib/clients/axios-client";
import { FB_ID, FB_PAGE_ACCESS_TOKEN } from "@/lib/constants";
import axios from "axios";

class MessengerService {
  async sendTextMessage(to: string, text: string) {
    try {
      const response = await messengerClient.post(`/messages`, {
        messaging_type: "RESPONSE",
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
      const response = await messengerClient.post(`/subscribed_apps`, {
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
      console.log("FB_PAGE_ACCESS_TOKEN: ", FB_PAGE_ACCESS_TOKEN);

      const response = await messengerClient.delete(`/subscribed_apps`, {
        params: {
          access_token: token,
          subscribed_fields: "messages",
        },
      });
      console.log("response.data: ", response.data);
      return response.data;
    } catch (error: any) {
      console.log("error: ", error.response?.data);

      throw error;
    }
  }

  async getProfile(token: string) {
    try {
      const baseURl = `https://graph.facebook.com/v23.0/me`;
      const { data } = await axios.get(`${baseURl}`, {
        params: {
          fields:
            "id,name,picture.width(400).height(400){url,width,height,is_silhouette}",
          accessToken: token,
        },
        headers: {
          Authorization: `Bearer ${FB_PAGE_ACCESS_TOKEN}`,
        },
      });

      const profile_pic = data.picture.data.url;
      delete data.picture;

      return { ...data, profile_pic };
    } catch (error: any) {
      console.log("error: ", error.response?.data);
      throw error;
    }
  }
}

const messengerService = new MessengerService();
export default messengerService;
