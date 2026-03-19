import { IApp } from "@/lib/types/app";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Download, Trash2, MoreVertical } from "lucide-react";

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
        <div className="flex items-center gap-1.5">
          {isInstalled ? (
            <>
              <span className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 text-sm text-emerald-800 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Installed
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label="App options"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MoreVertical className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={onDisconnect}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2 text-destructive" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
