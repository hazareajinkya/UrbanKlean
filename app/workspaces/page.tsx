"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Edit2, Loader, Plus, Trash2, X, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OnboardingMultiStepForm } from "@/components/onboarding/onboarding-multi-step-form";

export default function WorkspacesPage() {
  const router = useRouter();

  const { user, isLoading: userLoading } = useCurrentUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [editingWorkspace, setEditingWorkspace] = useState<IWorkspace>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState<IWorkspace>();

  const wids = user?.workspaces?.map((w: IUserWorkspace) => w.id) || [];

  const { workspaces, isLoading: workspacesLoading } = useWorkspaces(wids);

  const { createWorkspace, updateWorkspace, deleteWorkspace } =
    useWorkspaceActions();

  const handleCreateWorkspace = () => {
    if (!workspaceName.trim() || !user?.email) return;

    createWorkspace.mutate(
      {
        name: workspaceName.trim(),
        description: workspaceDescription.trim(),
        ownerId: user.email,
      },
      { onSuccess: () => handleCloseModal() }
    );
  };

  const handleUpdateWorkspace = () => {
    if (!workspaceName.trim() || !editingWorkspace || !user?.email) return;

    updateWorkspace.mutate(
      {
        wid: editingWorkspace.id,
        updates: {
          name: workspaceName.trim(),
          oneLiner: workspaceDescription.trim(),
        },
      },
      { onSuccess: () => handleCloseModal() }
    );
  };

  const handleSubmit = () => {
    if (editingWorkspace) {
      handleUpdateWorkspace();
    } else {
      handleCreateWorkspace();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setWorkspaceName("");
    setWorkspaceDescription("");
    setEditingWorkspace(undefined);
  };

  const handleEditWorkspace = (workspace: IWorkspace) => {
    setEditingWorkspace(workspace);
    setWorkspaceName(workspace.name);
    setWorkspaceDescription(workspace.oneLiner);
    setIsModalOpen(true);
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
        }
      );
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingWorkspace(undefined);
  };

  const openCreateModal = () => {
    setEditingWorkspace(undefined);
    setWorkspaceName("");
    setWorkspaceDescription("");
    setIsModalOpen(true);
  };

  if (userLoading) {
    return (
      <div className="mt-12 px-4 md:px-24">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 px-4 md:px-24">
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
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : workspaces && workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => router.push(`/workspaces/${workspace.id}`)}
            >
              <div className="relative">
                <img
                  src={workspace.thumbnail}
                  alt={workspace.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditWorkspace(workspace);
                    }}
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkspace(workspace);
                    }}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 bg-white/90 hover:bg-white"
                    disabled={deleteWorkspace.isPending}
                  >
                    {deleteWorkspace.isPending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <h3 className="font-medium text-lg">{workspace.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(workspace.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 h-[60vh] flex flex-col items-center justify-center">
          <div className="text-muted-foreground mb-4">No workspaces found</div>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 " />
            Create Workspace
          </Button>
        </div>
      )}

      {editingWorkspace ? (
        <WorkspaceEditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          workspaceName={workspaceName}
          setWorkspaceName={setWorkspaceName}
          workspaceDescription={workspaceDescription}
          setWorkspaceDescription={setWorkspaceDescription}
          onSubmit={handleSubmit}
          isLoading={updateWorkspace.isPending}
          editingWorkspace={editingWorkspace}
        />
      ) : (
        <CreateWorkspaceModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userEmail={user?.email || ""}
        />
      )}

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
  );
}

type CreateWorkspacePhase = "url-input" | "onboarding";

interface WorkspaceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  workspaceDescription: string;
  setWorkspaceDescription: (description: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  editingWorkspace: IWorkspace;
}

const WorkspaceEditModal = ({
  isOpen,
  onClose,
  workspaceName,
  setWorkspaceName,
  workspaceDescription,
  setWorkspaceDescription,
  onSubmit,
  isLoading,
  editingWorkspace,
}: WorkspaceEditModalProps) => {
  return (
    <Modal isOpen={isOpen} closeModal={onClose} size="md">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-0">
          <h3 className="text-lg font-medium">Edit Workspace</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground max-w-[80%]">
          Update your workspace name and settings.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="workspaceName">Company Name</Label>
            <Input
              id="workspaceName"
              type="text"
              placeholder="MagicalCX"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="workspaceDescription">
              What your company does in one line?
            </Label>
            <Input
              id="workspaceDescription"
              type="text"
              placeholder="e.g. We help businesses automate their customer support"
              value={workspaceDescription}
              onChange={(e) => setWorkspaceDescription(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!workspaceName.trim() || isLoading}>
              {isLoading && <Loader className="w-4 h-4 animate-spin " />}
              Update Workspace
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

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

  const { createWorkspace } = useWorkspaceActions();
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
      // Skip to manual entry
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
    createWorkspace.mutate(
      {
        name: data.companyName,
        description: data.oneLineDescription,
        ownerId: userEmail,
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
        },
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
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
      className="max-w-2xl bg-white dark:bg-black rounded-2xl p-8 max-h-[90vh] flex flex-col"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {phase === "url-input" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Create New Workspace
                </h3>
                <p className="text-sm text-muted-foreground">
                  Let's set up your workspace. You can provide your website URL
                  to auto-fill information, or skip to enter details manually.
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
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Label
                    htmlFor="domain"
                    className="text-sm font-medium text-gray-700"
                  >
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
                      domainError && "border-destructive"
                    )}
                  />
                </InputGroup>
                {domainError && (
                  <p className="text-destructive text-xs flex items-center gap-1">
                    {domainError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  We'll automatically gather your company information from your
                  website
                </p>
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
                  className=""
                >
                  We don't have a website
                </Button>
                <Button
                  type="submit"
                  disabled={generateOnboardingInfo.isPending || !!domainError}
                  className="max-w-max"
                >
                  {generateOnboardingInfo.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {phase === "onboarding" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Customize Workspace
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
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
