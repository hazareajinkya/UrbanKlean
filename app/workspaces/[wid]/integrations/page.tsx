"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  ShoppingBag,
  Copy,
  Check,
  Trash2,
  Loader,
  RefreshCw,
  Key,
  Sparkles,
  Plus,
  X,
  Plug,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useIntegrations } from "@/lib/hooks/integrations/use-integrations";
import { useIntegrationsActions } from "@/lib/hooks/integrations/use-integrations-actions";
import { toast } from "sonner";
import { IIntegration } from "@/lib/types/integration";
import { cn } from "@/lib/utils";

export default function IntegrationsPage() {
  const { wid } = useParams() as { wid: string };
  const [isAddShopifyModalOpen, setIsAddShopifyModalOpen] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] =
    useState<IIntegration | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { integrations, isLoading } = useIntegrations(wid);
  const {
    addShopifyIntegration,
    deleteIntegration,
    regenerateToken,
    deleteShopifyIntegration,
  } = useIntegrationsActions();

  const hasShopifyIntegration = integrations?.some(
    (int) => int.type === "shopify"
  );

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

  const handleCloseAddModal = () => {
    setIsAddShopifyModalOpen(false);
    setStoreId("");
    setGeneratedToken(null);
  };

  const handleDeleteIntegration = () => {
    if (!deletingStoreId) return;
    const status =
      selectedIntegration?.status === "active" ? "inactive" : "active";

    deleteShopifyIntegration.mutate(
      { wid, storeId: deletingStoreId, status: status },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setDeletingStoreId(null);
          setIsDetailModalOpen(false);
          setSelectedIntegration(null);
        },
      }
    );
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

  const handleOpenDetail = (integration: IIntegration) => {
    setSelectedIntegration(integration);
    setIsDetailModalOpen(true);
  };

  const handleGenerateNewKey = () => {
    if (!selectedIntegration) return;

    regenerateToken.mutate(
      { wid, storeId: selectedIntegration.id },
      {
        onSuccess: (newToken) => {
          setSelectedIntegration((prev) =>
            prev
              ? {
                  ...prev,
                  metadata: { ...prev.metadata, token: newToken },
                }
              : null
          );
        },
      }
    );
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedIntegration(null);
  };

  return (
    <div className="p-4 space-y-8">
      <div>
        <h1 className="text-xl">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect your favorite tools and services
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Active Integrations</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        ) : integrations && integrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onOpenDetail={handleOpenDetail}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground p-1">
            No active integrations found.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="flex flex-col">
            <CardContent className="pt-6 flex-1">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg shrink-0">
                  <ShoppingBag className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Shopify</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your Shopify store to sync orders and customers.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setIsAddShopifyModalOpen(true)}
                className="w-full"
                variant="outline"
                disabled={hasShopifyIntegration}
              >
                {hasShopifyIntegration ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Connected
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Add Shopify Integration Modal */}
      <Modal
        isOpen={isAddShopifyModalOpen}
        closeModal={handleCloseAddModal}
        className="max-w-md bg-background rounded-xl p-6 shadow-xl"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium">Connect Shopify</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseAddModal}
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
                    Generating...
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
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCloseAddModal} className="w-full">
              {generatedToken ? "Done" : "Cancel"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Integration Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        closeModal={handleCloseDetailModal}
        className="max-w-md bg-background rounded-xl p-6 shadow-xl"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Shopify Integration</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedIntegration?.metadata?.storeId}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseDetailModal}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">API Token</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={handleGenerateNewKey}
                  disabled={regenerateToken.isPending}
                >
                  {regenerateToken.isPending ? (
                    <>
                      <Loader className="w-3 h-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      Regenerate Key
                    </>
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2.5 bg-muted rounded-lg font-mono text-sm break-all">
                  {selectedIntegration?.metadata?.token}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handleCopyToken(selectedIntegration?.metadata?.token || "")
                  }
                  className={cn(
                    "shrink-0 transition-colors",
                    copiedToken === selectedIntegration?.metadata?.token &&
                      "border-green-500 text-green-600"
                  )}
                  aria-label="Copy token"
                >
                  {copiedToken === selectedIntegration?.metadata?.token ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this token to authenticate your Shopify app with our
                service.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedIntegration) {
                  setDeletingStoreId(selectedIntegration.id);
                  setIsDeleteModalOpen(true);
                }
              }}
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button onClick={handleCloseDetailModal}>Done</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmatio  n Modal */}
      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingStoreId(null);
        }}
        onConfirm={handleDeleteIntegration}
        title="Delete Integration"
        description={`Are you sure you want to delete the integration for store "${deletingStoreId}"? This action cannot be undone.`}
        isLoading={deleteIntegration.isPending}
      />
    </div>
  );
}

const IntegrationCard = ({
  integration,
  onOpenDetail,
}: {
  integration: IIntegration;
  onOpenDetail: (integration: IIntegration) => void;
}) => {
  return (
    <Card className="gap-4">
      <CardContent className="">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>

          <div className="flex-1">
            <h3 className="font-medium text-sm mb-0.5">Shopify</h3>
            <p className="text-xs text-muted-foreground">
              {integration.metadata?.storeId}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                integration.status === "active" ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-xs text-muted-foreground">
              {integration.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="">
        <div className="flex items-center justify-end w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenDetail(integration)}
            className="text-xs"
          >
            Manage
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
