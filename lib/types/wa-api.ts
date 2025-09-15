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
