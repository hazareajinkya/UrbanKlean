import { IApp } from "@/lib/types/app";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Download, Trash2 } from "lucide-react";

interface AppCardProps {
  app: IApp;
  isInstalled: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  isPending: boolean;
}

export default function AppCard({
  app,
  isInstalled,
  onConnect,
  onDisconnect,
  isPending,
}: AppCardProps) {
  return (
    <div className="group relative flex flex-col p-6 bg-card border rounded-xl transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0 border p-1">
          {app.logoUrl ? (
            <img
              src={app.logoUrl}
              alt={app.name}
              className="w-full h-full object-contain rounded-md"
            />
          ) : (
            <span className="text-xl font-bold text-primary">
              {app.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isInstalled ? (
            <>
              <Button variant="outline" size="sm" disabled>
                <Check className="w-3.5 h-3.5 text-green-800" />
                Installed
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="size-8"
                onClick={onDisconnect}
                disabled={isPending}
                aria-label="Uninstall app"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onConnect}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Install
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-1.5 flex-1">
        <h3 className="font-medium text-base leading-none">{app.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {app.description}
        </p>
      </div>
    </div>
  );
}
