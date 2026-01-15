"use client";

import { Loader, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useIntegrations } from "@/lib/hooks/integrations/use-integrations";
import { IIntegration } from "@/lib/types/integration";
import IntegrationCard from "@/components/integrations/integration-card";
import IntegrationListCard from "@/components/integrations/integration-list-card";
import {
  getAllIntegrationConfigs,
  getIntegrationConfig,
} from "@/lib/data/integration-configs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function IntegrationsPage() {
  const { wid } = useParams() as { wid: string };
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { integrations, isLoading } = useIntegrations(wid);
  const allConfigs = getAllIntegrationConfigs();

  const activeIntegrations = useMemo(() => {
    if (!integrations) return [];
    return integrations.filter((int) => int.status === "active");
  }, [integrations]);

  const connectedSlugs = useMemo(() => {
    return new Set(activeIntegrations.map((int) => int.type as string));
  }, [activeIntegrations]);

  const filteredConfigs = useMemo(() => {
    let configs = allConfigs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      configs = configs.filter(
        (config) =>
          config.name.toLowerCase().includes(query) ||
          config.description.toLowerCase().includes(query) ||
          config.slug.toLowerCase().includes(query)
      );
    }

    return configs;
  }, [allConfigs, searchQuery]);

  const handleCardClick = (slug: string) => {
    router.push(`/workspaces/${wid}/integrations/${slug}`);
  };

  const getIntegrationConfigForActive = (integration: IIntegration) => {
    return getIntegrationConfig(integration.type);
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 items-center justify-between mb-6">
        <div>
          <h1 className="text-xl">Integrations</h1>
          <p className="text-sm text-muted-foreground">
            All the toolkits, that we support.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Active Integrations</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin" />
            </div>
          ) : activeIntegrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeIntegrations.map((integration) => {
                const config = getIntegrationConfigForActive(integration);
                if (!config) return null;

                const Logo = config.logo;
                return (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onOpenDetail={() => handleCardClick(config.slug)}
                    icon={<Logo />}
                    title={config.name}
                    subtitle={integration.metadata?.storeId}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-1">
              No active integrations found.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Available Integrations</h2>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                {filteredConfigs.length} toolkits
              </p>
            )}
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConfigs.map((config) => {
              const isConnected = connectedSlugs.has(config.slug);
              return (
                <IntegrationListCard
                  key={config.slug}
                  config={config}
                  isConnected={isConnected}
                  onClick={() => handleCardClick(config.slug)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
