"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { getIntegrationConfig } from "@/lib/data/integration-configs";
import { useIntegrations } from "@/lib/hooks/integrations/use-integrations";
import IntegrationDetailHeader from "@/components/integrations/integration-detail-header";
import IntegrationToolsList from "@/components/integrations/integration-tools-list";
import { cn } from "@/lib/utils";
import { useIntegrationsActions } from "@/lib/hooks/integrations/use-integrations-actions";
import { AddShopifyModal } from "@/components/integrations/shopify/add-shopify-modal";
import { ShopifyConnectedInfo } from "@/components/integrations/shopify/shopify-connected-info";

export default function IntegrationDetailPage() {
  const router = useRouter();
  const params = useParams() as { wid: string; slug: string };
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "tools";

  const { wid, slug } = params;
  const config = getIntegrationConfig(slug);
  const { integrations } = useIntegrations(wid);
  const {
    addShopifyIntegration,
    addIntegration,
    deleteIntegration,
    deleteShopifyIntegration,
  } = useIntegrationsActions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const integration =
    integrations?.find((int) => int.type === slug && int.status === "active") ||
    null;

  if (!config) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Integration not found</h2>
            <p className="text-muted-foreground mb-4">
              The integration you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.back()}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const authTypes = Array.isArray(config.authType)
    ? config.authType
    : [config.authType];
  const supportsApiKey = authTypes.includes("api_key");
  const supportsOAuth = authTypes.includes("oauth2");

  const handleConnect = () => {
    if (supportsApiKey && !supportsOAuth) {
      // For API key only integrations, open modal
      setIsAddModalOpen(true);
    } else if (supportsOAuth) {
      // For OAuth integrations, initiate OAuth flow
      handleOAuthConnect();
    }
  };

  const handleOAuthConnect = () => {
    // TODO: Implement actual OAuth flow
    // For now, just create a placeholder integration
    addIntegration.mutate({
      wid,
      type: slug as any,
      integrationId: slug,
      metadata: {},
    });
  };

  const handleDisconnect = () => {
    if (!integration) return;

    if (slug === "shopify") {
      // Use the existing deleteShopifyIntegration for Shopify
      deleteShopifyIntegration.mutate({
        wid,
        storeId: integration.id,
        status: "inactive",
      });
    } else {
      // For other integrations, use deleteIntegration
      deleteIntegration.mutate({
        wid,
        storeId: integration.id,
      });
    }
  };

  return (
    <div className="p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/workspaces/${wid}/integrations`)}
        className="mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="space-y-6">
        <IntegrationDetailHeader
          config={config}
          integration={integration}
          isConnecting={
            addIntegration.isPending || addShopifyIntegration.isPending
          }
          isDisconnecting={
            deleteIntegration.isPending || deleteShopifyIntegration.isPending
          }
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />

        {slug === "shopify" &&
          integration &&
          integration.status === "active" && (
            <ShopifyConnectedInfo integration={integration} />
          )}

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                onClick={() =>
                  router.push(
                    `/workspaces/${wid}/integrations/${slug}?tab=tools`
                  )
                }
                className={cn(
                  "rounded-none border-b-2 border-transparent",
                  tab === "tools"
                    ? "border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Tools
              </Button>
            </div>
          </div>

          <IntegrationToolsList
            tools={config.tools}
            activeTab={tab === "tools" ? "tools" : "triggers"}
          />
        </div>
      </div>

      {supportsApiKey && slug === "shopify" && (
        <AddShopifyModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          wid={wid}
          addShopifyIntegration={addShopifyIntegration}
        />
      )}
    </div>
  );
}
