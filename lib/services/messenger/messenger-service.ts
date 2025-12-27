import { fbconf } from "@/lib/utils/conf";
import axios from "axios";

class MessengerService {
  async sendTextMessage({
    to,
    text,
    pageId,
    accessToken,
  }: {
    to: string;
    text: string;
    pageId: string;
    accessToken: string;
  }) {
    try {
      const baseURL = `${fbconf.baseURL}/${fbconf.version}/${pageId}`;
      const response = await axios.post(
        `${baseURL}/messages`,
        {
          messaging_type: "RESPONSE",
          recipient: { id: to },
          message: { text: text },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log(`Message sent with ID: ${response.data.message_id}`);
      return response.data.message_id;
    } catch (error: any) {
      console.log("error: ", error.response?.data);

      console.log("Error sending message:", JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async subscribeToWebhook({
    pageId,
    accessToken,
  }: {
    pageId: string;
    accessToken: string;
  }) {
    try {
      const baseURL = `${fbconf.baseURL}/${fbconf.version}/${pageId}`;
      const response = await axios.post(
        `${baseURL}/subscribed_apps`,
        {
          subscribed_fields: "messages",
        },
        {
          params: {
            access_token: accessToken,
          },
        }
      );
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

  async unsubscribeFromWebhook({
    pageId,
    accessToken,
  }: {
    pageId: string;
    accessToken: string;
  }) {
    try {
      const baseURL = `${fbconf.baseURL}/${fbconf.version}/${pageId}`;
      const response = await axios.delete(`${baseURL}/subscribed_apps`, {
        params: {
          access_token: accessToken,
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
      const baseURl = `${fbconf.baseURL}/${fbconf.version}/me`;
      const { data } = await axios.get(`${baseURl}`, {
        params: {
          fields:
            "id,name,picture.width(400).height(400){url,width,height,is_silhouette}",
          access_token: token,
        },
      });

      const profile_pic = data.picture?.data?.url;
      if (data.picture) {
        delete data.picture;
      }

      return { ...data, profile_pic };
    } catch (error: any) {
      console.log("error: ", error.response?.data);
      throw error;
    }
  }

  async getPages(token: string) {
    try {
      const baseURL = `${fbconf.baseURL}/${fbconf.version}/me/accounts`;
      const { data } = await axios.get(baseURL, {
        params: {
          fields: "id,name,access_token,picture",
          access_token: token,
        },
      });

      return data.data || [];
    } catch (error: any) {
      console.log("error getting pages: ", error.response?.data);
      throw error;
    }
  }

  async getPageInfo({
    pageId,
    pageAccessToken,
  }: {
    pageId: string;
    pageAccessToken: string;
  }) {
    try {
      const baseURL = `${fbconf.baseURL}/${fbconf.version}/${pageId}`;
      const { data } = await axios.get(baseURL, {
        params: {
          fields: "id,name,picture.width(400).height(400){url,width,height}",
          access_token: pageAccessToken,
        },
      });

      const profile_pic = data.picture?.data?.url;
      if (data.picture) {
        delete data.picture;
      }

      return { ...data, profile_pic };
    } catch (error: any) {
      console.log("error getting page info: ", error.response?.data);
      throw error;
    }
  }
}

const messengerService = new MessengerService();
export default messengerService;
