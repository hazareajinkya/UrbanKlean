import { storage } from "@/lib/clients/firebase";
import { waclient, waMediaClient } from "@/lib/clients/axios-client";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import storageService from "../storage-service";
import axios from "axios";
import { waconf } from "@/lib/utils/conf";

class WaService {
  private body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
  };

  async sendWATextMessage(to: string, text: string) {
    try {
      const response = await waclient.post(`/messages`, {
        ...this.body,
        to: to,
        type: "text",
        text: { body: text },
      });

      console.log(`Message sent with ID: ${response.data.messages[0].id}`);
      return response.data.messages[0].id;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async sendWATemplateMessage(to: string, templateName: string) {
    try {
      const response = await waclient.post(`/messages`, {
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

  async sendWAMediaMessage(to: string, url: string, caption?: string) {
    try {
      const response = await waclient.post(`/messages`, {
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

  async retrieveWAMedia(phone: string, mediaId: string) {
    try {
      const mediaResponse = await waMediaClient.get(`/${mediaId}`);

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

  async sendTypingIndicator(messageId: string): Promise<{ success: boolean }> {
    const payload = {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
      typing_indicator: {
        type: "text",
      },
    };

    try {
      const response = await waclient.post("/messages", payload);
      console.log("Typing indicator sent successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error sending typing indicator:", error);
      throw new Error("Failed to send typing indicator");
    }
  }
}

const waService = new WaService();
export default waService;
