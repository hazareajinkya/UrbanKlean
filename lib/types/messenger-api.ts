// export interface IWAContact {
//   phone: string;
//   name: string;
//   waId: string;
// }

export interface IMessengerMessage {
  id: string;
  from: string;
  to: string;
  timestamp: string;
  text?: string;
  type: "text" | "reaction" | "image";
  status?: "sent" | "delivered" | "read" | "failed";
}
