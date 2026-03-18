export interface IWAContact {
  phone: string;
  name: string;
  waId: string;
}

export interface IWAMessage {
  id: string;
  from: string;
  timestamp: string;
  text?: string;
  type: "text" | "reaction" | "image";
  status?: "sent" | "delivered" | "read" | "failed";
  reaction?: {
    messageId: string;
    emoji: string;
  };
  image?: {
    caption?: string;
    mimeType: string;
    id: string;
    url?: string;
    storageRef?: string;
  };
}
export type WATemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";
export interface IWaTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  components: any[];
  rejected_reason?: string;
  wabaId?: string;
  wid?: string;
}
