import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IIntegration } from "@/lib/types/integration";

interface ShopifyConnectedInfoProps {
  integration: IIntegration;
}

export const ShopifyConnectedInfo = ({
  integration,
}: ShopifyConnectedInfoProps) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const currentToken = integration.metadata?.token || "";

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(token);
      toast.success("Token copied to clipboard");
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      toast.error("Failed to copy token");
    }
  };

  const shopDomain = integration.metadata?.storeId || integration.id;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Shop Domain</Label>
        <div className="px-3 py-2.5 bg-muted rounded-lg font-mono text-sm">
          {shopDomain}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">API Token</Label>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2.5 bg-muted rounded-lg font-mono text-sm break-all">
            {currentToken}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleCopyToken(currentToken)}
            className={cn(
              "shrink-0 transition-colors",
              copiedToken === currentToken && "border-green-500 text-green-600"
            )}
            aria-label="Copy token"
          >
            {copiedToken === currentToken ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Use this token to authenticate your Shopify app with our service.
        </p>
      </div>
    </div>
  );
};
