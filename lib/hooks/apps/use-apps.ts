import appService from "@/lib/services/app-service";
import actionService from "@/lib/services/action-service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IApp } from "@/lib/types/app";
import { toast } from "sonner";

export const publishedAppsKey = () => ["published-apps"];
export const installedAppsKey = (wid: string) => ["installed-apps", wid];

export const usePublishedApps = () => {
  const query = useQuery({
    queryKey: publishedAppsKey(),
    queryFn: () => appService.getPublishedApps(),
  });

  return {
    apps: query.data,
    ...query,
  };
};

export const useInstalledApps = (wid: string) => {
  const query = useQuery({
    queryKey: installedAppsKey(wid),
    queryFn: () => appService.getInstalledApps(wid),
    enabled: !!wid,
  });

  return {
    installedApps: query.data,
    ...query,
  };
};

export const useUninstallApp = (wid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appId: string) => {
      await actionService.deleteActionsByAppId({ wid, appId });
      await appService.uninstallApp({ wid, appId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: installedAppsKey(wid) });
      queryClient.invalidateQueries({ queryKey: ["actions", wid] });
    },
  });
};

export const useConnectApp = (wid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      app,
      settings,
    }: {
      app: IApp;
      settings: Record<string, any>;
    }) => {
      if (app.authType === "oauth2") {
        const callbackRedirectUrl = `${window.location.origin}/workspaces/${wid}/apps`;
        const result = await appService.connectApp({
          slug: app.slug,
          workspaceId: wid,
          callbackRedirectUrl,
        });

        if (result.mode === "oauth2" && result.authorizationUrl) {
          window.location.href = result.authorizationUrl;
          return { redirected: true, appName: app.name };
        }

        toast.info(result.message || "Please provide credentials manually.");
        return { redirected: false, appName: app.name };
      }

      await appService.installApp({
        slug: app.slug,
        workspaceId: wid,
        credentials: settings,
      });

      return { redirected: false, appName: app.name };
    },
    onSuccess: (data) => {
      if (!data?.redirected) {
        queryClient.invalidateQueries({ queryKey: installedAppsKey(wid) });
        if (data?.appName) {
          toast.success(`${data.appName} connected successfully`);
        }
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to connect app");
    },
  });
};
