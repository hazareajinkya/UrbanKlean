export type IntegrationType = "shopify";

type metadata = Record<string, string>;

export interface IIntegration {
  id: string;
  wid: string;
  status: "active" | "inactive";
  type: IntegrationType;
  metadata?: metadata;
  createdAt: string;
  updatedAt: string;
}
