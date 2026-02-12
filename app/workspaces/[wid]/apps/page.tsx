"use client";

import { Loader, Search, Settings, Check, Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import {
    usePublishedApps,
    useInstalledApps,
    useUninstallApp,
    useConnectApp,
} from "@/lib/hooks/apps/use-apps";
import { IApp } from "@/lib/types/app";
import IntegrationGridCard from "@/components/integrations/integration-grid-card";
import ConnectAppModal from "@/components/apps/connect-app-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AppsPage() {
    const { wid } = useParams() as { wid: string };
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedApp, setSelectedApp] = useState<IApp | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                .map((a) => a.appSlug)
        );
    }, [installedApps]);

    const installedAppsWithDetails = useMemo(() => {
        if (!installedApps || !apps) return [];
        return installedApps
            .map((installed) => {
                const appDetails = apps.find((a) => a.id === installed.appId);
                return appDetails ? { installed, app: appDetails } : null;
            })
            .filter(Boolean) as { installed: (typeof installedApps)[0]; app: IApp }[];
    }, [installedApps, apps]);

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
                    app.categories.some((c) => c.toLowerCase().includes(query))
            );
        }

        return filtered;
    }, [apps, searchQuery]);

    const handleConnect = (app: IApp) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };

    const handleModalConnect = async (settings: Record<string, any>) => {
        if (!selectedApp) return;
        connectMutation.mutate(
            { app: selectedApp, settings },
            {
                onSuccess: (data) => {
                    if (!data?.redirected) {
                        setIsModalOpen(false);
                        setSelectedApp(null);
                    }
                },
            }
        );
    };

    const handleDisconnect = async (appId: string, appName: string) => {
        try {
            await uninstallMutation.mutateAsync(appId);
            toast.success(`${appName} disconnected`);
        } catch (error) {
            toast.error("Failed to disconnect app");
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
            </div>

            <div className="space-y-8">
                {/* Active / Installed Apps */}
                {installedAppsWithDetails.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium">Connected Apps</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {installedAppsWithDetails.map(({ installed, app }) => (
                                <IntegrationGridCard
                                    key={installed.id}
                                    title={app.name}
                                    description={app.description}
                                    icon={
                                        app.logoUrl ? (
                                            <img
                                                src={app.logoUrl}
                                                alt={app.name}
                                                className="w-full h-full object-contain rounded"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary/10 rounded flex items-center justify-center text-xs font-bold text-primary">
                                                {app.name.charAt(0)}
                                            </div>
                                        )
                                    }
                                    action={
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDisconnect(installed.appId, app.name);
                                            }}
                                            disabled={uninstallMutation.isPending}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1.5" />
                                            Disconnect
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
                            ))}
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader className="w-6 h-6 animate-spin" />
                    </div>
                )}

                {/* Available Apps */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium">Available Apps</h2>
                        {searchQuery && (
                            <p className="text-sm text-muted-foreground">
                                {filteredApps.length} apps
                            </p>
                        )}
                    </div>

                    <div className="relative max-w-md mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search apps..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredApps.map((app) => {
                            const isConnected = installedSlugs.has(app.slug);

                            return (
                                <IntegrationGridCard
                                    key={app.id}
                                    title={app.name}
                                    description={app.description}
                                    icon={
                                        app.logoUrl ? (
                                            <img
                                                src={app.logoUrl}
                                                alt={app.name}
                                                className="w-full h-full object-contain rounded"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary/10 rounded flex items-center justify-center text-xs font-bold text-primary">
                                                {app.name.charAt(0)}
                                            </div>
                                        )
                                    }
                                    footerIcon={
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            {app.categories.length > 0 && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] font-medium px-1.5 py-0"
                                                >
                                                    {app.categories[0]}
                                                </Badge>
                                            )}
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
                                                    handleConnect(app);
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

                        {!isLoading && filteredApps.length === 0 && (
                            <div className="col-span-full py-8 text-center text-muted-foreground">
                                <p>No apps found matching &quot;{searchQuery}&quot;</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Connect App Modal */}
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
