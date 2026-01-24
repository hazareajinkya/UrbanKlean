"use client";

import { Loader, Search, Settings, Wrench, Check, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useIntegrations } from "@/lib/hooks/integrations/use-integrations";
import { IIntegration } from "@/lib/types/integration";
import IntegrationGridCard from "@/components/integrations/integration-grid-card";
import {
  getAllIntegrationConfigs,
  getIntegrationConfig,
} from "@/lib/data/integration-configs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
          config.slug.toLowerCase().includes(query),
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
            All the toolkits that we support.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {activeIntegrations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Active Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activeIntegrations.map((integration) => {
                const config = getIntegrationConfigForActive(integration);
                if (!config) return null;

                const Logo = config.logo;
                return (
                  <IntegrationGridCard
                    key={integration.id}
                    title={config.name}
                    description={
                      integration.metadata?.storeId || config.description
                    }
                    icon={<Logo />}
                    onClick={() => handleCardClick(config.slug)}
                    action={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(config.slug);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-1.5" />
                        Manage
                      </Button>
                    }
                    footerIcon={
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                        >
                          Active
                        </Badge>
                      </div>
                    }
                  />
                );
              })}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Available Integrations</h2>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                {filteredConfigs.length} toolkits
              </p>
            )}
          </div>

          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredConfigs.map((config) => {
              const isConnected = connectedSlugs.has(config.slug);
              const Logo = config.logo;

              return (
                <IntegrationGridCard
                  key={config.slug}
                  title={config.name}
                  description={config.description}
                  icon={<Logo />}
                  onClick={() => handleCardClick(config.slug)}
                  footerIcon={
                    <div
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      title={`${config.tools.length} tools available`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{config.tools.length}</span>
                    </div>
                  }
                  action={
                    isConnected ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8"
                        disabled
                      >
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Connected
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 hover:bg-primary hover:text-primary-foreground group-hover/card:border-primary/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(config.slug);
                        }}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Connect
                      </Button>
                    )
                  }
                />
              );
            })}

            {!isLoading && filteredConfigs.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                <p>No integrations found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
