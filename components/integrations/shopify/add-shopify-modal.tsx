import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import { ShoppingBag, Copy, Check, Loader, X } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ShopifyLogo } from "@/lib/logos";

interface AddShopifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  wid: string;
  addShopifyIntegration: UseMutationResult<
    { metadata?: { token?: string } },
    Error,
    { wid: string; storeId: string }
  >;
}

export const AddShopifyModal = ({
  isOpen,
  onClose,
  wid,
  addShopifyIntegration,
}: AddShopifyModalProps) => {
  const [storeId, setStoreId] = useState("");
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleGenerateKey = () => {
    if (!storeId.trim()) {
      toast.error("Please enter a store ID first");
      return;
    }

    addShopifyIntegration.mutate(
      { wid, storeId: storeId.trim() },
      {
        onSuccess: (data) => {
          setGeneratedToken(data.metadata?.token || null);
        },
      }
    );
  };

  const handleClose = () => {
    setStoreId("");
    setGeneratedToken(null);
    setCopiedToken(null);
    onClose();
  };

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

  return (
    <Modal
      isOpen={isOpen}
      closeModal={handleClose}
      className="max-w-md bg-background rounded-xl p-6 shadow-xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="">
              <ShopifyLogo className="size-5 " />
            </div>
            <h3 className="text-lg font-medium">Connect Shopify</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your Shopify store ID and generate an API key to connect your
          store.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="storeId">Store ID</Label>
            <Input
              id="storeId"
              placeholder="e.g., my-store.myshopify.com"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              disabled={!!generatedToken}
              className="mt-2"
            />
          </div>

          {!generatedToken ? (
            <Button
              onClick={handleGenerateKey}
              disabled={addShopifyIntegration.isPending || !storeId.trim()}
              className="w-full gap-2"
            >
              {addShopifyIntegration.isPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating
                </>
              ) : (
                <>Generate Key</>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Key generated successfully!
                </span>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Your API Key</Label>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2.5 bg-muted rounded-lg font-mono text-sm break-all">
                    {generatedToken}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyToken(generatedToken)}
                    className={cn(
                      "shrink-0 transition-colors",
                      copiedToken === generatedToken &&
                        "border-green-500 text-green-600"
                    )}
                    aria-label="Copy token"
                  >
                    {copiedToken === generatedToken ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy this key and use it to authenticate your Shopify app.
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={handleClose} className="w-full">
              {generatedToken ? "Done" : "Cancel"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
