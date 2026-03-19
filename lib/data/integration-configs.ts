import React from "react";
import { ShopifyLogo } from "@/lib/logos";

export type IntegrationAuthType = "oauth2" | "api_key";

export interface IntegrationTool {
  name: string;
  description: string;
}

export interface IntegrationConfig {
  slug: string;
  name: string;
  description: string;
  categories: string[];
  authType: IntegrationAuthType | IntegrationAuthType[];
  logo: React.ComponentType<{ className?: string }>;
  tools: IntegrationTool[];
}

export const integrationConfigs: IntegrationConfig[] = [
  {
    slug: "shopify",
    name: "Shopify",
    description:
      "Shopify is an e-commerce platform enabling merchants to create online stores, manage products, and process orders",
    categories: ["E-commerce"],
    authType: ["api_key"],
    logo: ShopifyLogo,
    tools: [
      {
        name: "Search product",
        description: "Search for products in a Shopify store",
      },
      {
        name: "Track order",
        description: "Track the status and location of an order",
      },
      {
        name: "Cancel order",
        description: "Cancel an existing order in Shopify",
      },
      {
        name: "Refund order",
        description: "Process a refund for an order",
      },
      {
        name: "Change shipping address",
        description: "Update the shipping address for an order",
      },
    ],
  },
];

export const getIntegrationConfig = (
  slug: string,
): IntegrationConfig | undefined => {
  return integrationConfigs.find((config) => config.slug === slug);
};

export const getAllIntegrationConfigs = (): IntegrationConfig[] => {
  return integrationConfigs;
};
