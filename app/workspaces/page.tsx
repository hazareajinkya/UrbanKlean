"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useCurrentUser } from "@/lib/hooks/user/use-user";
import { useWorkspaces } from "@/lib/hooks/workspace/use-workspace";
import { useWorkspaceActions } from "@/lib/hooks/workspace/use-workspace-actions";
import { useOnboardingActions } from "@/lib/hooks/onboarding/use-onboarding-actions";
import { IUserWorkspace } from "@/lib/types/user";
import { IWorkspace } from "@/lib/types/workspace";
import { OnboardingData } from "@/lib/types/onboarding";
import {
  formatDate,
  normalizeDomain,
  validateDomain,
  isBlockedCompanyDomain,
  cn,
} from "@/lib/utils";
import {
  Edit2,
  Loader,
  Plus,
  Trash2,
  X,
  Globe,
  ChartColumnIncreasing,
  Waves,
  Settings2,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingMultiStepForm } from "@/components/onboarding/onboarding-multi-step-form";
import { WorkspacesNavbar } from "@/components/workspaces/workspace-navbar";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { canCreateWorkspace } from "@/lib/utils/permissions";
import { toast } from "sonner";

export default function WorkspacesPage() {
  const router = useRouter();

  const { user, isLoading: userLoading } = useCurrentUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState<IWorkspace>();

  const wids = user?.workspaces?.map((w: IUserWorkspace) => w.id) || [];

  const { workspaces, isLoading: workspacesLoading } = useWorkspaces(wids);

  const { createWorkspace, deleteWorkspace } = useWorkspaceActions();

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteWorkspace = (workspace: IWorkspace) => {
    setDeletingWorkspace(workspace);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteWorkspace = () => {
    if (deletingWorkspace) {
      deleteWorkspace.mutate(
        { wid: deletingWorkspace.id },
        {
          onSuccess: () => {
            setIsDeleteModalOpen(false);
            setDeletingWorkspace(undefined);
          },
        },
      );
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingWorkspace(undefined);
  };

  const openCreateModal = () => {
    if (!canCreateWorkspace(user?.subscription?.planId)) {
      toast.error("Upgrade your plan to create a workspace", {
        action: {
          label: "Upgrade",
          onClick: () => router.push("/pricing"),
        },
      });
      return;
    }
    setIsModalOpen(true);
  };

  if (userLoading) {
    return (
      <>
        <WorkspacesNavbar />
        <div className="mt-24 max-w-7xl mx-auto px-4 pr-2 md:px-3 lg:px-3">
          <div className="animate-pulse">
            <Skeleton className="h-8 w-48 mb-8 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <WorkspaceCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <WorkspacesNavbar />
      <div className="mt-24 max-w-7xl mx-auto px-4 pr-2 md:px-3 lg:px-3">
        <div className="flex gap-4 justify-between mb-8">
          <h2 className="text-xl font-medium">Workspaces</h2>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            Workspace
          </Button>
        </div>

        {workspacesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <WorkspaceCardSkeleton key={i} />
            ))}
          </div>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="dark:border group relative h-[340px] w-full cursor-pointer overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5 transition-all duration-500 hover:shadow-2xl hover:ring-black/10 hover:-translate-y-1"
                onClick={() =>
                  router.push(`/workspaces/${workspace.id}/dashboard`)
                }
              >
                {/* Full Background Layer */}
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundColor: workspace.info?.primaryColor || "#f3f4f6",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20 pointer-events-none" />
                  <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl pointer-events-none mix-blend-overlay" />
                  <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-black/10 blur-3xl pointer-events-none mix-blend-multiply" />
                </div>

                {/* Action Buttons */}
                <div className="absolute right-4 top-4 z-20 flex gap-2 opacity-0 transition-all duration-300 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 rounded-full bg-card/90 hover:bg-card shadow-sm backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/workspaces/${workspace.id}/settings`);
                    }}
                  >
                    <Edit2 className="w-4 h-4 " />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 rounded-full bg-card/90 hover:bg-card shadow-sm hover:text-red-600 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkspace(workspace);
                    }}
                    disabled={deleteWorkspace.isPending}
                  >
                    {deleteWorkspace.isPending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Floating Content Card */}
                <div className="absolute bottom-3 left-3 right-3 top-[100px] flex flex-col rounded-2xl bg-card/95 p-5 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:bg-card group-hover:shadow-xl">
                  {/* Logo */}
                  <div className="absolute -top-8 left-5">
                    <div className="h-16 w-16 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center ring-1 ring-black/5">
                      {workspace.info?.logo ? (
                        <img
                          src={workspace.info.logo}
                          alt={workspace.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-xl font-bold text-gray-400">
                          {workspace.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="mt-8 flex-1 space-y-2.5">
                    <h3
                      className="font-medium text-xl line-clamp-1 tracking-tight "
                      title={workspace.name}
                    >
                      {workspace.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {workspace.oneLiner ||
                        workspace.info?.tagline ||
                        workspace.info?.description ||
                        "No description provided."}
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-auto pt-0 flex items-center justify-between gap-2">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-9 flex-1 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 px-0 transition-colors"
                    >
                      <Link
                        href={`/workspaces/${workspace.id}/dashboard`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ChartColumnIncreasing className="w-4 h-4 mr-1" />
                        Dashboard
                      </Link>
                    </Button>
                    <div className="w-[1px] h-4 bg-gray-200" />
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-9 flex-1 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 px-0 transition-colors"
                    >
                      <Link
                        href={`/workspaces/${workspace.id}/agents`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Waves className="w-4 h-4 mr-1" />
                        Agents
                      </Link>
                    </Button>
                    <div className="w-[1px] h-4 bg-gray-200" />
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-9 flex-1 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 px-0 transition-colors"
                    >
                      <Link
                        href={`/workspaces/${workspace.id}/settings`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings2 className="w-4 h-4 mr-1" />
                        Settings
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 h-[60vh] flex flex-col items-center justify-center">
            <div className="text-muted-foreground mb-4">
              No workspaces found
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 " />
              Create Workspace
            </Button>
          </div>
        )}

        <CreateWorkspaceModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userEmail={user?.email || ""}
        />

        <ConfirmationDialog
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={confirmDeleteWorkspace}
          title="Delete Workspace"
          description={`Are you sure you want to delete "${deletingWorkspace?.name}"?`}
          warningMessage="This action cannot be undone. All data associated with this workspace will be permanently removed."
          confirmText="Delete Workspace"
          cancelText="Cancel"
          isLoading={deleteWorkspace.isPending}
          variant="destructive"
        />
      </div>
    </>
  );
}

type CreateWorkspacePhase = "url-input" | "onboarding";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const CreateWorkspaceModal = ({
  isOpen,
  onClose,
  userEmail,
}: CreateWorkspaceModalProps) => {
  const [phase, setPhase] = useState<CreateWorkspacePhase>("url-input");
  const [domain, setDomain] = useState("");
  const [domainError, setDomainError] = useState("");
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [initialData, setInitialData] = useState<
    Partial<OnboardingData> | undefined
  >(undefined);

  const { createWorkspace, initWorkspaceTraining } = useWorkspaceActions();
  const { generateOnboardingInfo, uploadLogo } = useOnboardingActions();

  const validateDomainInput = (value: string): boolean => {
    if (!value) {
      setDomainError("");
      return true; // Not required
    }
    const normalized = normalizeDomain(value);
    if (!validateDomain(normalized)) {
      setDomainError("Please enter a valid domain");
      return false;
    }
    if (isBlockedCompanyDomain(normalized)) {
      setDomainError("Please enter your own company domain");
      return false;
    }
    setDomainError("");
    return true;
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDomain(value);
    if (domainError) validateDomainInput(value);
  };

  const handleDomainPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const normalized = normalizeDomain(pastedText);
    setDomain(normalized);
    if (domainError) validateDomainInput(normalized);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      setInitialData({
        companyName: "",
        tagline: "",
        oneLineDescription: "",
        industry: "",
        businessType: "",
        description: "",
        toneGuidelines: "",
        primaryColor: "#000000",
        logo: "",
        targetAudience: "",
        offerings: "",
        estimatedTime: "",
        differentiators: "",
      });
      setUrl(undefined);
      setPhase("onboarding");
      return;
    }

    const isDomainValid = validateDomainInput(domain);
    if (!isDomainValid) return;

    const normalizedDomain = normalizeDomain(domain);
    const urlString = `https://${normalizedDomain}`;

    setUrl(urlString);
    setInitialData(undefined);
    setPhase("onboarding");
  };

  const handleOnboardingFinish = (data: OnboardingData) => {
    const domains = [domain];
    createWorkspace.mutate(
      {
        name: data.companyName,
        description: data.oneLineDescription,
        ownerId: userEmail,
        domains,
        info: {
          email: userEmail,
          tagline: data.tagline,
          industry: data.industry,
          businessType: data.businessType,
          description: data.description,
          toneGuidelines: data.toneGuidelines,
          targetAudience: data.targetAudience,
          primaryColor: data.primaryColor,
          logo: data.logo,
          differentiators: data.differentiators,
          offerings: data.offerings,
        },
      },
      {
        onSuccess: (workspace) => {
          if (url) initWorkspaceTraining.mutate({ wid: workspace.id, url });
          handleClose();
        },
      },
    );
  };

  const validateCompanyName = (name: string): string | null => {
    if (!name.trim()) {
      return "Workspace name is required";
    }
    return null;
  };

  const handleClose = () => {
    onClose();
    // Reset state
    setPhase("url-input");
    setDomain("");
    setDomainError("");
    setUrl(undefined);
    setInitialData(undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={handleClose}
      className="relative max-w-xl bg-white dark:bg-black rounded-2xl p-4 max-h-[90vh] flex flex-col"
      clickOutsideToClose={false}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 w-full">
        {phase === "url-input" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Create New Workspace</h3>

                <p className="text-sm max-w-md text-muted-foreground">
                  Provide your website URL and our agent will auto-fill
                  information for you.
                </p>
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

            <form onSubmit={handleUrlSubmit} className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="domain" className="text-gray-700">
                    Website URL
                  </Label>
                </div>
                <InputGroup className="h-11">
                  <InputGroupAddon align="inline-start">
                    <span className="text-muted-foreground text-sm">
                      https://
                    </span>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="domain"
                    value={domain}
                    onChange={handleDomainChange}
                    onPaste={handleDomainPaste}
                    onBlur={() => validateDomainInput(domain)}
                    placeholder="yourcompany.com"
                    className={cn(
                      "text-base",
                      domainError && "border-destructive",
                    )}
                  />
                </InputGroup>
                {domainError && (
                  <p className="text-destructive text-xs flex items-center gap-1">
                    {domainError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2 justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setInitialData({
                      companyName: "",
                      tagline: "",
                      oneLineDescription: "",
                      industry: "",
                      businessType: "",
                      description: "",
                      toneGuidelines: "",
                      primaryColor: "#000000",
                      logo: "",
                      targetAudience: "",
                      offerings: "",
                      estimatedTime: "",
                      differentiators: "",
                    });
                    setUrl(undefined);
                    setPhase("onboarding");
                  }}
                  className="w-min px-0 text-muted-foreground rounded-full hover:bg-transparent hover:text-primary font-normal"
                >
                  We don't have a website
                </Button>
                <Button
                  type="submit"
                  disabled={generateOnboardingInfo.isPending || !!domainError}
                  className="w-28 rounded-full"
                >
                  {generateOnboardingInfo.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {phase === "onboarding" && (
          <div className="space-y-6">
            <div className="absolute top-7.5 right-26 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="rounded-full text-muted-foreground"
              >
                <X className="w-4 h-4 " />
              </Button>
            </div>
            <OnboardingMultiStepForm
              url={url}
              initialData={initialData}
              onFinish={handleOnboardingFinish}
              generateOnboardingInfo={generateOnboardingInfo}
              uploadLogo={uploadLogo}
              mode="workspace"
              companyNameLabel="Workspace Name"
              title="Customize Workspace"
              isSubmitting={createWorkspace.isPending}
              submitButtonText="Create Workspace"
              onCompanyNameValidate={validateCompanyName}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

const WorkspaceCardSkeleton = () => {
  return (
    <div className="relative h-[340px] w-full overflow-hidden rounded-3xl ring-1 ring-black/5 bg-gray-100 dark:bg-muted/20">
      {/* Floating Content Card */}
      <div className="absolute bottom-3 left-3 right-3 top-[100px] flex flex-col rounded-2xl bg-card/80 p-5 shadow-sm backdrop-blur-sm border border-black/5">
        {/* Logo */}
        <div className="absolute -top-8 left-5">
          <Skeleton className="h-16 w-16 rounded-2xl ring-4 ring-white dark:ring-black/10" />
        </div>

        {/* Text Content */}
        <div className="mt-8 flex-1 space-y-3">
          <Skeleton className="h-7 w-3/4 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-auto pt-0 flex items-center justify-between gap-2">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <div className="w-[1px] h-4 bg-muted" />
          <Skeleton className="h-9 flex-1 rounded-md" />
          <div className="w-[1px] h-4 bg-muted" />
          <Skeleton className="h-9 flex-1 rounded-md" />
        </div>
      </div>
    </div>
  );
};
