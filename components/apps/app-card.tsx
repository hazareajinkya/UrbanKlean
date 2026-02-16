import { IApp } from "@/lib/types/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Check,
  Loader2,
  ExternalLink,
  Settings2,
  Download,
  Trash2,
} from "lucide-react";

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
    <div className="group relative flex flex-col p-6 bg-card hover:bg-muted/30 border rounded-xl transition-all duration-200 hover:shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
          {app.logoUrl ? (
            <img
              src={app.logoUrl}
              alt={app.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-xl font-bold text-primary">
              {app.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          {isInstalled ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onDisconnect}
              disabled={isPending}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Uninstall
            </Button>
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

      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-base leading-none">{app.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {app.description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-0">
        <div className="text-muted-foreground"></div>
      </div>
    </div>
  );
}
