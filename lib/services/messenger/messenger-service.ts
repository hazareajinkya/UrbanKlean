import { messengerClient } from "@/lib/clients/axios-client";
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
      const response = await messengerClient.post(
        `/${pageId}/messages`,
        {
          messaging_type: "RESPONSE",
          recipient: { id: to },
          message: { text: text },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
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
      const response = await messengerClient.post(
        `/${pageId}/subscribed_apps`,
        {
          subscribed_fields:
            "messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads",
        },
        {
          params: {
            access_token: accessToken,
          },
        },
      );
      console.log("response.data: ", response.data);
      return response.data;
    } catch (error: any) {
      console.log("error: ", error.response?.data);

      console.log(
        "Error subscribing to webhook:",
        JSON.stringify(error, null, 2),
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
      const tokenResponse = await axios.get(
        `${fbconf.baseURL}/${fbconf.version}/oauth/access_token`,
        {
          params: {
            client_id: fbconf.appId,
            client_secret: fbconf.appSecret,
            grant_type: "client_credentials",
          },
        },
      );
      const appAccessToken = tokenResponse.data.access_token;

      const response = await messengerClient.delete(
        `/${pageId}/subscribed_apps`,
        {
          params: {
            access_token: appAccessToken,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.log("error: ", error.response?.data);

      throw error;
    }
  }

  async getProfile(token: string) {
    try {
      const { data } = await messengerClient.get(`/me`, {
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
      const { data } = await messengerClient.get(`/me/accounts`, {
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
      const { data } = await messengerClient.get(`/${pageId}`, {
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
  async getUserProfile({
    userId,
    accessToken,
  }: {
    userId: string;
    accessToken: string;
  }) {
    try {
      const { data } = await messengerClient.get(`/${userId}`, {
        params: {
          fields: "first_name,last_name,profile_pic",
          access_token: accessToken,
        },
      });
      return data;
    } catch (error: any) {
      console.log(
        "error getting user profile: ",
        JSON.stringify(error.response?.data, null, 2),
      );
      throw error;
    }
  }
}

const messengerService = new MessengerService();
export default messengerService;
