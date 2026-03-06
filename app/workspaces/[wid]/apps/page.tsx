"use client";

import { Loader, Search } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import {
  usePublishedApps,
  useInstalledApps,
  useUninstallApp,
  useConnectApp,
} from "@/lib/hooks/apps/use-apps";
import { IApp } from "@/lib/types/app";
import AppCard from "@/components/apps/app-card";
import ConnectAppModal from "@/components/apps/connect-app-modal";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AppsPage() {
  const { wid } = useParams() as { wid: string };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<IApp | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAppId, setPendingAppId] = useState<string | null>(null);

  const { apps, isLoading: isLoadingApps } = usePublishedApps();
  const { installedApps, isLoading: isLoadingInstalled } =
    useInstalledApps(wid);
  const uninstallMutation = useUninstallApp(wid);
  const connectMutation = useConnectApp(wid);

  const installedSlugs = useMemo(() => {
    if (!installedApps) return new Set<string>();
    return new Set(
      installedApps
        .filter((a) => a.status === "connected")
        .map((a) => a.appSlug),
    );
  }, [installedApps]);

  const filteredApps = useMemo(() => {
    if (!apps) return [];
    let filtered = apps;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query) ||
          app.slug.toLowerCase().includes(query) ||
          app.categories.some((c) => c.toLowerCase().includes(query)),
      );
    }

    return [...filtered].sort((a, b) => {
      const aInstalled = installedSlugs.has(a.slug);
      const bInstalled = installedSlugs.has(b.slug);
      return aInstalled === bInstalled ? 0 : aInstalled ? -1 : 1;
    });
  }, [apps, searchQuery, installedSlugs]);

  const handleConnect = (app: IApp) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const handleModalConnect = async (settings: Record<string, any>) => {
    if (!selectedApp) return;
    setPendingAppId(selectedApp.id);
    connectMutation.mutate(
      { app: selectedApp, settings },
      {
        onSettled: () => setPendingAppId(null),
        onSuccess: (data) => {
          if (!data?.redirected) {
            setIsModalOpen(false);
            setSelectedApp(null);
          }
        },
      },
    );
  };

  const handleDisconnect = async (appId: string, appName: string) => {
    setPendingAppId(appId);
    try {
      await uninstallMutation.mutateAsync(appId);
      toast.success(`${appName} disconnected`);
    } finally {
      setPendingAppId(null);
    }
  };

  const isLoading = isLoadingApps || isLoadingInstalled;

  return (
    <div className="p-4">
      <div className="flex gap-4 items-center justify-between mb-6">
        <div>
          <h1 className="text-xl">Apps</h1>
          <p className="text-sm text-muted-foreground">
            Connect apps to extend your workspace capabilities.
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      <div className="space-y-8">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => {
              const isInstalled = installedSlugs.has(app.slug);
              const installedApp = installedApps?.find(
                (a) => a.appSlug === app.slug,
              );

              return (
                <AppCard
                  key={app.id}
                  app={app}
                  isInstalled={isInstalled}
                  onConnect={() => handleConnect(app)}
                  onDisconnect={() => {
                    if (installedApp) {
                      handleDisconnect(installedApp.appId, app.name);
                    }
                  }}
                  isPending={
                    !!(
                      pendingAppId === app.id ||
                      (installedApp && pendingAppId === installedApp.appId)
                    )
                  }
                />
              );
            })}

            {!isLoading && filteredApps.length === 0 && (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                <p>No apps found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConnectAppModal
        app={selectedApp}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApp(null);
        }}
        onConnect={handleModalConnect}
        isConnecting={connectMutation.isPending}
      />
    </div>
  );
}
