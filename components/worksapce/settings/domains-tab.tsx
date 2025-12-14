"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash, Globe } from "lucide-react";
import { normalizeDomain, validateDomain, cn } from "@/lib/utils";
import { useWorkspaceActions } from "@/lib/hooks/workspace/use-workspace-actions";
import { IWorkspace } from "@/lib/types/workspace";

interface DomainsTabProps {
  workspace: IWorkspace;
  wid: string;
}

export function DomainsTab({ workspace, wid }: DomainsTabProps) {
  const [companyDomain, setCompanyDomain] = useState("");
  const [domainError, setDomainError] = useState("");
  const [removingDomain, setRemovingDomain] = useState<string | null>(null);
  const { addWorkspaceDomain, removeWorkspaceDomain } = useWorkspaceActions();
  const domains = workspace?.domains || [];

  const disableDomainActions = useMemo(
    () => addWorkspaceDomain.isPending || removeWorkspaceDomain.isPending,
    [addWorkspaceDomain.isPending, removeWorkspaceDomain.isPending]
  );

  const handleDomainChange = (value: string) => {
    setCompanyDomain(value);
    if (value && !validateDomain(value)) {
      setDomainError("Please enter a valid domain (e.g., magicalcx.com)");
    } else {
      setDomainError("");
    }
  };

  const handleDomainPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedValue = event.clipboardData.getData("text");
    const normalized = normalizeDomain(pastedValue);
    if (!normalized) return;
    event.preventDefault();
    handleDomainChange(normalized);
  };

  const isDomainInvalid = Boolean(domainError);
  const canAddDomain =
    Boolean(companyDomain.trim()) && !isDomainInvalid && !disableDomainActions;

  const handleAddDomain = async () => {
    const normalized = normalizeDomain(companyDomain);
    if (!normalized) {
      setDomainError("Please enter a domain before adding.");
      return;
    }

    if (!validateDomain(normalized)) {
      setDomainError("Please enter a valid domain (e.g., magicalcx.com)");
      return;
    }

    if (domains.includes(normalized)) {
      setDomainError("This domain is already linked.");
      return;
    }

    setCompanyDomain("");
    setDomainError("");

    await addWorkspaceDomain.mutateAsync({ wid, domain: normalized });
  };

  const handleRemoveDomain = async (domain: string) => {
    setRemovingDomain(domain);
    await removeWorkspaceDomain.mutateAsync({ wid, domain });
    setRemovingDomain(null);
  };

  const handleDomainKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddDomain();
    }
  };

  return (
    <motion.div
      key="domains"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-medium">Domain Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Allow only approved company domains to access workspace agents.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label>Company Domain</Label>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                type="text"
                placeholder="magicalcx.com"
                value={companyDomain}
                onChange={(e) => handleDomainChange(e.target.value)}
                onPaste={handleDomainPaste}
                onKeyDown={handleDomainKeyDown}
                className={cn(
                  "w-full",
                  isDomainInvalid &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              <Button
                type="button"
                disabled={!canAddDomain}
                onClick={handleAddDomain}
                className="w-full sm:w-auto"
              >
                {addWorkspaceDomain.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Domain
              </Button>
            </div>
            {isDomainInvalid ? (
              <p className="text-sm text-destructive" role="alert">
                {domainError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Use your apex domain (e.g., magicalcx.com). Subdomains aren't
                required.
              </p>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-3">Linked Domains</h3>
            <div className="rounded-lg border" role="list">
              <AnimatePresence initial={false} mode="popLayout">
                {domains.length === 0 ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center"
                  >
                    <Globe className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm font-medium">No domains linked yet</p>
                    <p className="text-xs text-muted-foreground">
                      Add your first domain to secure workspace access.
                    </p>
                  </motion.div>
                ) : (
                  domains.map((domain, index) => (
                    <motion.div
                      key={domain}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex items-center justify-between p-3 hover:bg-accent/50 transition-colors",
                        index !== domains.length - 1 && "border-b"
                      )}
                      role="listitem"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Globe className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{domain}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDomain(domain)}
                        disabled={removeWorkspaceDomain.isPending}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        {removeWorkspaceDomain.isPending &&
                        removingDomain === domain ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
