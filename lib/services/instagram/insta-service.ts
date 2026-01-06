import { instaClient } from "@/lib/clients/axios-client";

class InstaService {
  async sendTextMessage({
    to,
    text,
    instaUserId,
    accessToken,
  }: {
    to: string;
    text: string;
    instaUserId: string;
    accessToken: string;
  }) {
    try {
      const response = await instaClient.post(
        `/${instaUserId}/messages`,
        {
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
    accessToken,
    instaUserId,
  }: {
    accessToken: string;
    instaUserId: string;
  }) {
    console.log("subscribing to webhook: ", accessToken, instaUserId);
    try {
      const response = await instaClient.post(
        `/${instaUserId}/subscribed_apps`,
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
    accessToken,
    instaUserId,
  }: {
    accessToken: string;
    instaUserId: string;
  }) {
    console.log("unsubscribing from webhook: ", accessToken, instaUserId);
    try {
      const response = await instaClient.delete(
        `/${instaUserId}/subscribed_apps`,
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
        "Error unsubscribing from webhook:",
        JSON.stringify(error, null, 2)
      );
      throw error;
    }
  }

  async getProfile({ accessToken }: { accessToken: string }) {
    try {
      const { data } = await instaClient.get(`/me`, {
        params: {
          fields:
            "id,user_id,username,name,profile_picture_url,followers_count,media_count",
          accessToken: accessToken,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
  async getUserProfile({
    userId,
    accessToken,
  }: {
    userId: string;
    accessToken: string;
  }) {
    try {
      const { data } = await instaClient.get(`/${userId}`, {
        params: {
          fields: "username,name",
          access_token: accessToken,
        },
      });
      return data;
    } catch (error: any) {
      console.log("error: ", error.response?.data);
      console.log(
        "Error getting user profile:",
        JSON.stringify(error, null, 2)
      );
      throw error;
    }
  }
}

const instaService = new InstaService();
export default instaService;
