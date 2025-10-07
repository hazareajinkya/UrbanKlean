import { v4 } from "uuid";

export interface IChannel {
  id: string;
  provider: IChannelProvider;
  providerAccountId: string;
  assignedAgentId: string;
  credentials: Record<string, string>;
  metadata: Record<string, string>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type IChannelProvider =
  | "whatsapp"
  | "instagram"
  | "messenger"
  | "slack"
  | "email"
  | "web";

export const generateDefaultChannel = (
  providerAccountId: string,
  provider: IChannelProvider,
  credentials: Record<string, string>,
  metadata: Record<string, string>
): IChannel => {
  return {
    id: providerAccountId,
    provider,
    status: "active",
    metadata: metadata,
    assignedAgentId: "",
    providerAccountId,
    credentials,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
