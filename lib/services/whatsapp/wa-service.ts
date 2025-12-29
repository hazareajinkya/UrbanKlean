import { storage } from "@/lib/clients/firebase";
import { waClient } from "@/lib/clients/axios-client";
import axiosClient from "@/lib/clients/axios-client";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import storageService from "../storage-service";
import axios from "axios";
import { waconf } from "@/lib/utils/conf";

class WaService {
  private body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
  };

  async sendWATextMessage({
    to,
    text,
    phoneId,
    accessToken,
  }: {
    to: string;
    text: string;
    phoneId: string;
    accessToken: string;
  }) {
    try {
      const payload = {
        ...this.body,
        to: to,
        type: "text",
        text: { body: text },
      };
      console.log(
        `Sending WhatsApp message with phoneId: ${phoneId}, to: ${to}`
      );
      const response = await waClient.post(`/${phoneId}/messages`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log(`Message sent with ID: ${response.data.messages[0].id}`);
      return response.data.messages[0].id;
    } catch (error: any) {
      console.error("Error sending message:", error);
      if (error.response) {
        const errorData = error.response.data;
        console.error(
          "Error response data:",
          JSON.stringify(errorData, null, 2)
        );
        console.error("Error response status:", error.response.status);

        // Handle specific WhatsApp API errors
        if (errorData?.error?.code === 131030) {
          const errorMessage =
            errorData.error.message ||
            "Recipient phone number not in allowed list";
          console.warn(
            `WhatsApp API restriction: ${errorMessage}. ` +
              `In development/test mode, you can only send messages to phone numbers added to the allowed recipient list in Meta Business Manager.`
          );
          // Don't throw for this specific error - it's a configuration issue, not a code bug
          throw new Error(
            `WhatsApp API: ${errorMessage}. Please add the recipient phone number to the allowed list in Meta Business Manager.`
          );
        }
      }
      throw error;
    }
  }

  async sendWATemplateMessage({
    to,
    templateName,
    phoneId,
  }: {
    to: string;
    templateName: string;
    phoneId: string;
  }) {
    try {
      const response = await waClient.post(`/${phoneId}/messages`, {
        ...this.body,
        to: to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en_US" },
        },
      });
      console.log(
        `Message template sent with ID: ${response.data.messages[0].id}`
      );
    } catch (error) {
      console.error("Error sending template message:", error);
      throw error;
    }
  }

  async sendWAMediaMessage({
    to,
    url,
    caption,
    phoneId,
  }: {
    to: string;
    url: string;
    caption?: string;
    phoneId: string;
  }) {
    try {
      const response = await waClient.post(`/${phoneId}/messages`, {
        ...this.body,
        to: to,
        type: "image",
        image: {
          link: url,
          caption: caption ?? "",
        },
      });
      console.log(`Message sent with ID: ${response.data.messages[0].id}`);
      return response.data.messages[0].id;
    } catch (error) {
      console.error("Error sending media message:", error);
      throw error;
    }
  }

  async retrieveWAMedia({
    phone,
    mediaId,
    phoneId,
  }: {
    phone: string;
    mediaId: string;
    phoneId: string;
  }) {
    try {
      const mediaResponse = await waClient.get(`/${phoneId}/${mediaId}`);

      console.log("mediaResponse: ", mediaResponse.data.url);

      const mediaUrl = mediaResponse.data.url;

      if (!mediaUrl) {
        console.error("Media URL not found in response");
        return {
          downloadUrl: "",
          storageRef: "",
        };
      }

      try {
        const mediaDownload = await axios.get(mediaUrl, {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${waconf.accessToken}`,
          },
        });

        console.log("mediaDownload: ", mediaDownload.data);

        const contentType = mediaResponse.data.mime_type?.split("/")[0];
        const extension = mediaResponse.data.mime_type?.split("/")[1];
        const fileName = `wa-attachment-${mediaId}.${extension}`;

        console.log("media extension: ", extension);

        const path = ref(storage, `wasync/${phone}/${fileName}`);

        const metadata = {
          contentType: contentType,
          extension,
        };

        const downloadUrl = await storageService.uploadB(
          path,
          mediaDownload.data,
          metadata
        );

        console.log("downloadUrl: ", downloadUrl);

        return {
          mimeType: contentType,
          fileName,
          downloadUrl: downloadUrl,
          storageRef: path.fullPath,
        };
      } catch (error) {
        console.error("Error uploading media to Firebase Storage:", error);
        return {
          mimeType: null,
          fileName: mediaId,
          downloadUrl: "",
          storageRef: "",
        };
      }
    } catch (error) {
      console.error("Error retrieving WhatsApp media:", error);
      return {
        mimeType: null,
        fileName: mediaId,
        downloadUrl: "",
        storageRef: "",
      };
    }
  }

  async sendTypingIndicator({
    messageId,
    phoneId,
    accessToken,
  }: {
    messageId: string;
    phoneId: string;
    accessToken: string;
  }): Promise<{ success: boolean }> {
    const payload = {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
      typing_indicator: {
        type: "text",
      },
    };

    try {
      const response = await waClient.post(`/${phoneId}/messages`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Typing indicator sent successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error sending typing indicator:  ", error);
      throw new Error("Failed to send typing indicator");
    }
  }
}

const waService = new WaService();
export default waService;
