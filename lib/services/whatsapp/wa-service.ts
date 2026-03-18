import { storage, db } from "@/lib/clients/firebase";
import { axiosClient, waClient } from "@/lib/clients/axios-client";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  writeBatch,
  getDoc,
  updateDoc,
} from "firebase/firestore";
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
        `Sending WhatsApp message with phoneId: ${phoneId}, to: ${to}`,
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
          JSON.stringify(errorData, null, 2),
        );
        console.error("Error response status:", error.response.status);

        // Handle specific WhatsApp API errors
        if (errorData?.error?.code === 131030) {
          const errorMessage =
            errorData.error.message ||
            "Recipient phone number not in allowed list";
          console.warn(
            `WhatsApp API restriction: ${errorMessage}. ` +
              `In development/test mode, you can only send messages to phone numbers added to the allowed recipient list in Meta Business Manager.`,
          );
          // Don't throw for this specific error - it's a configuration issue, not a code bug
          throw new Error(
            `WhatsApp API: ${errorMessage}. Please add the recipient phone number to the allowed list in Meta Business Manager.`,
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
        `Message template sent with ID: ${response.data.messages[0].id}`,
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
          metadata,
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
  async getAccessToken({ authorizationCode }: { authorizationCode: string }) {
    try {
      const tokenPayload: {
        client_id: string;
        client_secret: string;
        code: string;
        grant_type: string;
        redirect_uri?: string;
      } = {
        client_id: waconf.appId,
        client_secret: waconf.appSecret,
        code: authorizationCode,
        grant_type: "authorization_code",
      };

      // if (waconf.redirectUri) {
      //   tokenPayload.redirect_uri = waconf.redirectUri;
      // }

      const tokenResponse = await waClient.post(
        `/oauth/access_token`,
        tokenPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return tokenResponse.data as {
        access_token: string;
        token_type: string;
        expires_in: number;
      };
    } catch (error) {
      console.error("Error getting access token:", error);
      throw error;
    }
  }
  async getNumberInfo({
    phoneId,
    accessToken,
  }: {
    phoneId: string;
    accessToken: string;
  }) {
    try {
      const fields = "display_phone_number,verified_name,status";

      const response = await waClient.get(`/${phoneId}?fields=${fields}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const phoneData = response.data;
      if (!phoneData) {
        throw new Error("No phone number data found");
      }

      const phoneInfo = {
        status: phoneData.status,
        display_phone_number: phoneData.display_phone_number,
        name: phoneData.verified_name,
      };
      return phoneInfo;
    } catch (error) {
      console.error("Error getting number info:", error);
    }
  }
  async subscribeToWebhook({
    wabaId,
    accessToken,
  }: {
    wabaId: string;
    accessToken: string;
  }) {
    try {
      await waClient.post(
        `/${wabaId}/subscribed_apps`,
        {
          subscribed_fields: "messages",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log("Successfully subscribed to WhatsApp webhook");
    } catch (error: any) {
      console.warn("Warning: Could not subscribe to WhatsApp webhook:", error);
      throw error;
    }
  }
  async unsubscribeFromWebhook({
    wabaId,
    accessToken,
  }: {
    wabaId: string;
    accessToken: string;
  }) {
    try {
      await waClient.delete(`/${wabaId}/subscribed_apps`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Successfully unsubscribed from WhatsApp webhook");
    } catch (error) {
      console.warn(
        "Warning: Could not unsubscribe from WhatsApp webhook:",
        error,
      );
      throw error;
    }
  }

  async checkRegistrationStatus({
    phoneId,
    accessToken,
  }: {
    phoneId: string;
    accessToken: string;
  }) {
    try {
      const fields = "status";
      const response = await waClient.get(`/${phoneId}?fields=${fields}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { status } = response.data;

      if (status === "CONNECTED") {
        console.log("Whatsapp is registered");
        return false;
      }
      console.log("Whatsapp is not registered");
      return true;
    } catch (error: any) {
      console.error("Error checking registration status:", error);
      throw error;
    }
  }

  async registerPhoneNumber({
    phoneId,
    pin,
    accessToken,
  }: {
    phoneId: string;
    pin: string;
    accessToken: string;
  }) {
    try {
      await waClient.post(
        `/${phoneId}/register`,
        {
          messaging_product: "whatsapp",
          pin,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log("Successfully registered WhatsApp phone number");
    } catch (error: any) {
      console.log("Could not register WhatsApp phone number:", error);
      throw error;
    }
  }
  async getMetaTemplates(args: { wabaId: string; accessToken: string }) {
    const { wabaId, accessToken } = args;
    try {
      const response = await waClient.get(`/${wabaId}/message_templates`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log(
        `Successfully fetched ${response.data.data.length} templates from Meta`,
      );
      return response.data.data;
    } catch (error: any) {
      console.error(
        "Error fetching templates from Meta:",
        error?.response?.data || error,
      );
      throw error;
    }
  }

  async createMetaTemplate(args: {
    wabaId: string;
    accessToken: string;
    templateData: any;
  }) {
    const { wabaId, accessToken, templateData } = args;
    try {
      const response = await waClient.post(
        `/${wabaId}/message_templates`,
        templateData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      console.log("Template created:", response.data.id);
      return response.data;
    } catch (error: any) {
      console.error("Error creating template:", error?.response?.data || error);
      throw error;
    }
  }

  async editMetaTemplate(args: {
    templateId: string;
    accessToken: string;
    templateData: { components: any[]; category?: string };
  }) {
    const { templateId, accessToken, templateData } = args;
    try {
      const response = await waClient.post(`/${templateId}`, templateData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Template edited:", response.data.success);
      return response.data;
    } catch (error: any) {
      console.error("Error editing template:", error?.response?.data || error);
      throw error;
    }
  }

  async deleteMetaTemplate(args: {
    wabaId: string;
    accessToken: string;
    templateName: string;
  }) {
    const { wabaId, accessToken, templateName } = args;
    try {
      const response = await waClient.delete(
        `/${wabaId}/message_templates?name=${templateName}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      console.log("Template deleted:", templateName);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting template:", error?.response?.data || error);
      throw error;
    }
  }

  async sendTemplateTestMessage(args: {
    to: string;
    phoneId: string;
    accessToken: string;
    templateName: string;
    languageCode: string;
    components?: any[];
  }) {
    const { to, phoneId, accessToken, templateName, languageCode, components } =
      args;
    try {
      const payload: any = {
        ...this.body,
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
        },
      };
      if (components && components.length > 0) {
        payload.template.components = components;
      }
      const response = await waClient.post(`/${phoneId}/messages`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log(
        `Template test message sent with ID: ${response.data.messages[0].id}`,
      );
      return response.data.messages[0].id;
    } catch (error: any) {
      console.error(
        "Error sending template test message:",
        error?.response?.data || error,
      );
      throw error;
    }
  }

  async getTemplates(args: { wid: string; wabaId?: string }): Promise<any[]> {
    const { wid, wabaId } = args;
    const templatesRef = collection(db, `workspaces/${wid}/wa-templates`);
    const q = wabaId
      ? query(templatesRef, where("wabaId", "==", wabaId))
      : templatesRef;

    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data() as any;
      if (typeof data.components === "string") {
        try {
          data.components = JSON.parse(data.components);
        } catch (e) {
          console.error("Failed to parse template components:", e);
          data.components = [];
        }
      }
      return data as any;
    });
  }

  async saveTemplate(args: { wid: string; template: any }): Promise<void> {
    const { wid, template } = args;
    const templateRef = doc(
      db,
      `workspaces/${wid}/wa-templates/${template.id}`,
    );

    const existing = await getDoc(templateRef);
    const now = Date.now();

    const data: any = {
      ...template,
      components: JSON.stringify(template.components || []),
      createdAt: existing.exists() ? existing.data().createdAt : now,
      updatedAt: now,
    };

    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );

    await setDoc(templateRef, data, { merge: true });
  }

  async updateTemplate(args: {
    wid: string;
    templateId: string;
    components: any[];
    category?: string;
  }) {
    const { wid, templateId, components, category } = args;
    const templateRef = doc(db, `workspaces/${wid}/wa-templates/${templateId}`);

    const updateData: any = {
      components: JSON.stringify(components),
      status: "PENDING",
      updatedAt: Date.now(),
    };

    if (category) {
      updateData.category = category;
    }

    await updateDoc(templateRef, updateData);
  }

  async saveTemplatesBatch(args: {
    wid: string;
    wabaId: string;
    templates: any[];
  }): Promise<void> {
    const { wid, wabaId, templates } = args;
    if (!templates.length) return;

    const batch = writeBatch(db);
    const now = Date.now();

    templates.forEach((template) => {
      const templateRef = doc(
        db,
        `workspaces/${wid}/wa-templates/${template.id}`,
      );

      const data: any = {
        id: template.id,
        name: template.name,
        category: template.category,
        language: template.language,
        status: template.status,
        components: JSON.stringify(template.components || []),
        quality_score: template.quality_score ?? null,
        rejected_reason: template.rejected_reason ?? null,
        wid,
        wabaId,
        updatedAt: now,
      };

      Object.keys(data).forEach(
        (key) => data[key] === undefined && delete data[key],
      );

      batch.set(templateRef, { ...data, createdAt: now }, { merge: true });
    });

    await batch.commit();
  }

  async deleteTemplate(args: {
    wid: string;
    templateId: string;
  }): Promise<void> {
    const { wid, templateId } = args;
    const templateRef = doc(db, `workspaces/${wid}/wa-templates/${templateId}`);
    await deleteDoc(templateRef);
  }

  async deleteTemplateByName(args: {
    wid: string;
    templateName: string;
  }): Promise<void> {
    const { wid, templateName } = args;
    const templatesRef = collection(db, `workspaces/${wid}/wa-templates`);
    const q = query(templatesRef, where("name", "==", templateName));
    const snaps = await getDocs(q);

    if (snaps.empty) return;

    const batch = writeBatch(db);
    snaps.docs.forEach((snap) => {
      batch.delete(snap.ref);
    });
    await batch.commit();
  }

  async deleteAllTemplates(args: {
    wid: string;
    wabaId: string;
  }): Promise<void> {
    const { wid, wabaId } = args;
    const templatesRef = collection(db, `workspaces/${wid}/wa-templates`);
    const q = query(templatesRef, where("wabaId", "==", wabaId));

    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  }

  async updateTemplateStatus(args: {
    wid: string;
    templateId: string;
    status: string;
    rejectedReason?: string;
  }): Promise<void> {
    const { wid, templateId, status, rejectedReason } = args;
    const templateRef = doc(db, `workspaces/${wid}/wa-templates/${templateId}`);

    const updateData: any = {
      status,
      updatedAt: Date.now(),
    };

    if (rejectedReason !== undefined) {
      updateData.rejected_reason = rejectedReason;
    }

    await updateDoc(templateRef, updateData);
  }
}

const waService = new WaService();
export default waService;
