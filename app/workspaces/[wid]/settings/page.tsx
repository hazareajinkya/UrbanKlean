"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspace } from "@/lib/hooks/workspace/use-workspace";
import { useWorkspaceActions } from "@/lib/hooks/workspace/use-workspace-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";

const validateDomain = (domain: string): boolean => {
  if (!domain) return true;
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};
const normalizeDomain = (value: string) => {
  if (!value) return "";
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";

  try {
    const candidate = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
    const url = new URL(candidate);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return trimmed
      .replace(/^(https?:\/\/)/, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0];
  }
};

export default function SettingsPage() {
  const { wid } = useParams() as { wid: string };
  const {
    workspace,
    isLoading: isWorkspaceLoading,
    isFetching,
  } = useWorkspace(wid);
  const { updateWorkspace, addWorkspaceDomain, removeWorkspaceDomain } =
    useWorkspaceActions();
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [domainError, setDomainError] = useState("");
  const [removingDomain, setRemovingDomain] = useState<string | null>(null);

  const domains = workspace?.domains || [];

  useEffect(() => {
    if (!workspace) return;
    setWorkspaceName(workspace.name || "");
    setWorkspaceDescription(workspace.description || "");
  }, [workspace]);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (companyDomain && !validateDomain(companyDomain)) {
      setDomainError("Please enter a valid domain (e.g., magicalcx.com)");
      return;
    }

    await updateWorkspace.mutateAsync({
      wid,
      updates: {
        name: workspaceName.trim(),
        description: workspaceDescription.trim(),
      },
    });
  };

  if (isWorkspaceLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="space-y-4 p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-40" />
          </Card>
        ))}
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Workspace not found</CardTitle>
            <CardDescription>
              The workspace you are trying to access does not exist or you no
              longer have permission.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="p-6 max-w-4xl mx-auto space-y-6"
      aria-busy={updateWorkspace.isPending || isFetching}
    >
      <div className="mb-6">
        <h1 className="text-xl">Workspace Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your workspace information and settings.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Update your workspace informations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>
                Workspace Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter your workspace name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
                disabled={updateWorkspace.isPending}
                className="transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label>Workspace Description</Label>
              <Textarea
                placeholder="Describe what this workspace is used for (optional)"
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
                disabled={updateWorkspace.isPending}
                rows={4}
                className="transition-all resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={updateWorkspace.isPending || !workspaceName.trim()}
                className="min-w-[120px] transition-all"
              >
                {updateWorkspace.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin " />
                )}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Domain Settings</CardTitle>
          <CardDescription>
            Allow only approved company domains to access workspace agents.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="">
            <div className="space-y-2">
              <Label>Company domain</Label>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  type="text"
                  placeholder="magicalcx.com"
                  value={companyDomain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  onPaste={handleDomainPaste}
                  onKeyDown={handleDomainKeyDown}
                  className={`w-full transition-all ${
                    isDomainInvalid && "border-destructive"
                  }`}
                />
                <Button
                  type="button"
                  disabled={!canAddDomain}
                  onClick={handleAddDomain}
                  className="w-full sm:w-auto transition-all disabled:opacity-50"
                >
                  {addWorkspaceDomain.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin " />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Add domain
                </Button>
              </div>
              {isDomainInvalid ? (
                <p className="text-sm text-destructive" role="alert">
                  {domainError}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Use your apex domain (e.g., magicalcx.com). Subdomains aren't
                  required.
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-border/80" />

          <div className="rounded-xl" role="list">
            <AnimatePresence initial={false} mode="wait">
              {domains.length === 0 ? (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1 text-center"
                >
                  <p className="text-sm font-medium">No domains linked yet</p>
                  <p className="text-xs text-muted-foreground">
                    Add your first domain to secure workspace access.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="domain-list"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3"
                >
                  <AnimatePresence initial={false}>
                    {domains.map((domain) => (
                      <motion.div
                        key={domain}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex flex-col gap-2 rounded-lg border border-transparent bg-background/70 p-3 transition hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
                        role="listitem"
                        tabIndex={0}
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium tracking-tight">
                            {domain}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDomain(domain)}
                          disabled={removeWorkspaceDomain.isPending}
                          className="hover:text-destructive transition-colors"
                        >
                          {removeWorkspaceDomain.isPending &&
                          removingDomain === domain ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions that permanently affect your
            workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Delete Workspace</h4>
            <p className="text-sm text-muted-foreground">
              Once you delete a workspace, there is no going back. This action
              will permanently delete all workspace data, including agents,
              knowledge bases, members, and all associated content. This cannot
              be undone.
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="destructive" disabled>
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
