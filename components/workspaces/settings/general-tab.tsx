"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Modal from "@/components/ui/modal";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  Loader,
  Trash,
  Sparkles,
  Building2,
  Upload,
  Wand2,
  Save,
  X,
} from "lucide-react";

import { useWorkspaceActions } from "@/lib/hooks/workspace/use-workspace-actions";
import { IWorkspace } from "@/lib/types/workspace";
import { normalizeDomain, validateDomain, cn } from "@/lib/utils";
import storageService from "@/lib/services/storage-service";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

interface GeneralTabProps {
  workspace: IWorkspace;
  wid: string;
}

export function GeneralTab({ workspace, wid }: GeneralTabProps) {
  const router = useRouter();
  // General workspace fields
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");

  // Business info fields
  const [tagline, setTagline] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [description, setDescription] = useState("");
  const [toneGuidelines, setToneGuidelines] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [logo, setLogo] = useState("");
  const [offerings, setOfferings] = useState("");
  const [differentiators, setDifferentiators] = useState("");

  // Logo upload state
  const logoInputRef = useRef<HTMLInputElement>(null);

  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      const storageRef = `workspaces/${wid}/logo`;
      const result = await storageService.uploadFile(
        file,
        storageRef,
        file.name,
      );
      return result.downloadURL;
    },
  });

  // AI generation loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWebsiteDialogOpen, setIsWebsiteDialogOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isUrlInvalid = Boolean(urlError);

  const handleUrlChange = (value: string) => {
    setWebsiteUrl(value);
    if (value && !validateDomain(value)) {
      setUrlError("Please enter a valid URL (e.g., example.com)");
    } else {
      setUrlError("");
    }
  };

  const handleUrlPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedValue = event.clipboardData.getData("text");
    const normalized = normalizeDomain(pastedValue);
    if (!normalized) return;
    event.preventDefault();
    handleUrlChange(normalized);
  };

  const { updateWorkspace, generateWorkspaceInfo, deleteWorkspace } =
    useWorkspaceActions();
  const isInitializing = useRef(true);

  useEffect(() => {
    if (!workspace) return;
    setWorkspaceName(workspace.name || "");
    setWorkspaceDescription(workspace.oneLiner || "");

    // Initialize business info fields
    console.log("Workspace info: ", workspace.info.businessType);
    setTagline(workspace.info.tagline || "");
    setIndustry(workspace.info.industry || "");
    // Normalize businessType to lowercase to match SelectItem values
    const normalizedBusinessType = (workspace.info.businessType || "")
      .toLowerCase()
      .trim();
    setBusinessType(normalizedBusinessType);
    setDescription(workspace.info.description || "");
    setToneGuidelines(workspace.info.toneGuidelines || "");
    setTargetAudience(workspace.info.targetAudience || "");
    setPrimaryColor(workspace.info.primaryColor || "#000000");
    setLogo(workspace.info.logo || "");
    setOfferings(workspace.info.offerings || "");
    setDifferentiators(workspace.info.differentiators || "");

    setTimeout(() => {
      isInitializing.current = false;
    }, 100);
  }, [workspace]);

  const handleSave = async () => {
    const updates: any = {
      oneLiner: workspaceDescription.trim(),
      info: {
        ...workspace.info,
        tagline: tagline.trim(),
        industry: industry.trim(),
        businessType: businessType.trim(),
        description: description.trim(),
        toneGuidelines: toneGuidelines.trim(),
        targetAudience: targetAudience.trim(),
        primaryColor: primaryColor.trim(),
        logo: logo,
        offerings: offerings.trim(),
        differentiators: differentiators.trim(),
      },
    };

    // Update workspace name if it has changed
    if (workspaceName.trim() !== (workspace.name || "")) {
      updates.name = workspaceName.trim();
    }

    await updateWorkspace.mutateAsync({
      wid,
      updates,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSave();
  };

  // Handle AI generation with 5 second shimmer
  const handleAIGenerate = () => {
    setUrlError("");
    // Auto-fill from first domain if available
    if (workspace?.domains && workspace.domains.length > 0) {
      const firstDomain = workspace.domains[0];
      const normalized = normalizeDomain(firstDomain);
      setWebsiteUrl(normalized || "");
    } else {
      setWebsiteUrl("");
    }
    setIsWebsiteDialogOpen(true);
  };

  const startAIGeneration = () => {
    if (!websiteUrl.trim()) return;

    // Normalize to extract just the domain
    const normalized = normalizeDomain(websiteUrl);

    if (!normalized || !validateDomain(normalized)) {
      setUrlError("Please enter a valid URL (e.g., example.com)");
      return;
    }

    // Construct the full URL with https://
    const fullUrl = "https://" + normalized;

    setUrlError("");
    setIsGenerating(true);

    generateWorkspaceInfo.mutateAsync(
      {
        wid,
        url: fullUrl,
      },
      {
        onSuccess: (response) => {
          setIsGenerating(false);
          const generatedData = response?.data;

          if (generatedData) {
            if (generatedData.companyName)
              setWorkspaceName(generatedData.companyName);
            if (generatedData.oneLineDescription)
              setWorkspaceDescription(generatedData.oneLineDescription);
            if (generatedData.tagline) setTagline(generatedData.tagline);
            if (generatedData.industry) setIndustry(generatedData.industry);
            if (generatedData.businessType) {
              const normalizedBusinessType = generatedData.businessType
                .toLowerCase()
                .trim();
              setBusinessType(normalizedBusinessType);
            }
            if (generatedData.description)
              setDescription(generatedData.description);
            if (generatedData.toneGuidelines)
              setToneGuidelines(generatedData.toneGuidelines);
            if (generatedData.targetAudience)
              setTargetAudience(generatedData.targetAudience);
            if (generatedData.primaryColor)
              setPrimaryColor(generatedData.primaryColor);
            if (generatedData.logo) setLogo(generatedData.logo);
            if (generatedData.offerings) setOfferings(generatedData.offerings);
            if (generatedData.differentiators)
              setDifferentiators(generatedData.differentiators);
          }

          setIsWebsiteDialogOpen(false);
        },
        onError: () => {
          setIsGenerating(false);
          setIsWebsiteDialogOpen(false);
        },
      },
    );
  };

  const handleDeleteWorkspace = () => setIsDeleteModalOpen(true);

  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const confirmDeleteWorkspace = () => {
    deleteWorkspace.mutate(
      { wid },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          router.push("/workspaces");
        },
      },
    );
  };

  return (
    <motion.div
      key="general"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl">General Information</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update your workspace name and description.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="rounded-full bg-card"
          >
            <Wand2 className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Auto Generate with AI"}
          </Button>
        </div>

        <Card>
          <CardContent className="space-y-6 px-6 pb-6 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base mb-0.5">Brand Identity</h3>
                <p className="text-xs text-muted-foreground">
                  Upload your logo and set your brand color.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleSave}
                size={"sm"}
                disabled={updateWorkspace.isPending}
                className="rounded-full "
              >
                {updateWorkspace.isPending && (
                  <Loader className="h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </div>
            {/* Logo and Color Section */}
            <div className="flex gap-4">
              <div
                className="group relative bg-muted overflow-hidden rounded-xl border bg-card p-4 transition-all hover:bg-muted/50 cursor-pointer flex-1"
                onClick={() => logoInputRef.current?.click()}
              >
                <div className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-white flex items-center justify-center">
                    {uploadLogo.isPending ? (
                      <Loader className="size-6 text-muted-foreground animate-spin" />
                    ) : logo ? (
                      <img
                        src={logo}
                        alt="Logo"
                        className="size-full object-contain p-2"
                      />
                    ) : (
                      <Building2 className="size-6 text-muted-foreground/50" />
                    )}

                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="size-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm">Logo</h3>
                    <p className="text-xs text-gray-500">Click to upload</p>
                  </div>
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const url = await uploadLogo.mutateAsync(file);
                        setLogo(url);
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }}
                />
              </div>

              <div className="bg-muted rounded-xl border bg-card p-4 flex-1">
                <div className="flex items-center gap-4">
                  <div
                    className="size-16 shrink-0 rounded-lg border flex items-center justify-center cursor-pointer"
                    style={{
                      backgroundColor: primaryColor || "#000000",
                    }}
                    onClick={() =>
                      document.getElementById("primaryColor")?.click()
                    }
                  >
                    <input
                      id="primaryColor"
                      type="color"
                      value={primaryColor || "#000000"}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="sr-only"
                    />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h3 className="text-sm">Brand Color</h3>
                    <Input
                      value={primaryColor || "#000000"}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#000000"
                      className="h-8 text-xs"
                      disabled={updateWorkspace.isPending}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* General Information Section */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input
                    placeholder="Enter your business tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    disabled={updateWorkspace.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    A short phrase that represents your brand
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>One Liner</Label>
                <Textarea
                  placeholder="A brief one-line description of your workspace (optional)"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  disabled={updateWorkspace.isPending}
                  rows={3}
                  className="resize-none bg-muted leading-relaxed"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Business Profile Section */}
      <Card>
        <CardContent className="space-y-5 px-6 pb-6 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base mb-0.5">Business Profile</h3>
              <p className="text-xs text-muted-foreground">
                Define your business identity and core information.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleSave}
              disabled={updateWorkspace.isPending}
              size={"sm"}
              className="rounded-full"
            >
              {updateWorkspace.isPending && (
                <Loader className="h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input
                placeholder="e.g., Technology, Healthcare"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={updateWorkspace.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select
                value={businessType}
                onValueChange={(value) => {
                  if (isInitializing.current && !value && businessType) {
                    return;
                  }
                  setBusinessType(value);
                }}
                disabled={updateWorkspace.isPending}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="edtech">EdTech</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Business Description</Label>
            <Textarea
              placeholder="Describe your business, products, and services..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={updateWorkspace.isPending}
              rows={4}
              className="resize-none bg-muted leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">
              This helps AI understand your business context better
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Communication & Branding Section */}
      <Card>
        <CardContent className="space-y-5 px-6 pb-6 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base mb-0.5">Communication & Branding</h3>
              <p className="text-xs text-muted-foreground">
                Configure how your AI agents communicate and represent your
                brand.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleSave}
              disabled={updateWorkspace.isPending}
              size={"sm"}
              className="rounded-full"
            >
              {updateWorkspace.isPending && (
                <Loader className="h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Textarea
              placeholder="Describe your ideal customers and target market..."
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              disabled={updateWorkspace.isPending}
              rows={3}
              className="resize-none bg-muted leading-relaxed"
            />
          </div>
          <div className="space-y-2">
            <Label>Tone Guidelines</Label>
            <Textarea
              placeholder="e.g., Professional yet friendly, Formal, Casual..."
              value={toneGuidelines}
              onChange={(e) => setToneGuidelines(e.target.value)}
              disabled={updateWorkspace.isPending}
              rows={3}
              className="resize-none bg-muted leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">
              Define the communication style for your AI agents
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Details Section */}
      <Card>
        <CardContent className="space-y-5 px-6 pb-6 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base mb-0.5">Business Details</h3>
              <p className="text-xs text-muted-foreground">
                Highlight what you offer and what makes you unique.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleSave}
              disabled={updateWorkspace.isPending}
              size={"sm"}
              className="rounded-full"
            >
              {updateWorkspace.isPending && (
                <Loader className="h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Offerings</Label>
              <Textarea
                value={offerings}
                onChange={(e) => setOfferings(e.target.value)}
                disabled={updateWorkspace.isPending}
                className="min-h-[140px] resize-none bg-muted leading-relaxed"
                placeholder="e.g. AI-powered customer support, automated workflows, real-time analytics..."
              />
            </div>
            <div className="space-y-2">
              <Label>Differentiators</Label>
              <Textarea
                value={differentiators}
                onChange={(e) => setDifferentiators(e.target.value)}
                disabled={updateWorkspace.isPending}
                className="min-h-[140px] resize-none bg-muted leading-relaxed"
                placeholder="e.g. Industry-leading response time, 24/7 availability, multilingual support..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone Section */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="px-6 pb-6 pt-2">
          <div className="mb-4">
            <h2 className="text-xl text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Irreversible and destructive actions. Proceed with caution.
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <Trash className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-destructive">Delete Workspace</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Once you delete a workspace, there is no going back. This action
                will permanently delete all workspace data, including agents,
                knowledge bases, members, and all associated content.
              </p>
              <div className="mt-4">
                <Button
                  variant="destructive"
                  onClick={handleDeleteWorkspace}
                  disabled={deleteWorkspace.isPending}
                >
                  {deleteWorkspace.isPending && (
                    <Loader className="h-4 w-4 animate-spin" />
                  )}
                  Delete Workspace
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AIGenerateModal
        isOpen={isWebsiteDialogOpen}
        onClose={() => setIsWebsiteDialogOpen(false)}
        isGenerating={isGenerating}
        websiteUrl={websiteUrl}
        urlError={urlError}
        isUrlInvalid={isUrlInvalid}
        onUrlChange={handleUrlChange}
        onUrlPaste={handleUrlPaste}
        onGenerate={startAIGeneration}
      />
      <ConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteWorkspace}
        title="Delete Workspace"
        description={`Are you sure you want to delete "${workspace?.name}"?`}
        warningMessage="This action cannot be undone. All data associated with this workspace will be permanently removed."
        confirmText="Delete Workspace"
        cancelText="Cancel"
        isLoading={deleteWorkspace.isPending}
        variant="destructive"
      />
    </motion.div>
  );
}

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGenerating: boolean;
  websiteUrl: string;
  urlError: string;
  isUrlInvalid: boolean;
  onUrlChange: (value: string) => void;
  onUrlPaste: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
}

const AIGenerateModal = ({
  isOpen,
  onClose,
  isGenerating,
  websiteUrl,
  urlError,
  isUrlInvalid,
  onUrlChange,
  onUrlPaste,
  onGenerate,
}: AIGenerateModalProps) => {
  return (
    <Modal isOpen={isOpen} closeModal={onClose} size="md">
      <div className="space-y-6 w-full">
        <div className="flex items-start justify-between ">
          <div>
            <h3 className="text-lg ">Generate Profile with AI</h3>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
              Provide your website URL and we'll automatically extract your
              business information to create your profile.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full shrink-0"
            disabled={isGenerating}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isGenerating ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="relative h-16 w-16 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 0.8, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative z-10 bg-background rounded-full p-3 shadow-lg border border-primary/20">
                <Sparkles className="h-6 w-6 text-primary fill-primary/20" />
              </div>
              <motion.div
                className="absolute inset-[-4px] rounded-full border border-primary/30"
                style={{
                  borderTopColor: "transparent",
                  borderBottomColor: "transparent",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-[-12px] rounded-full border border-primary/20"
                style={{
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              </motion.div>
            </div>
            <div className="mt-8 text-center space-y-2">
              <div className="flex items-center justify-center gap-1">
                <span className="text-sm text-primary font-medium">
                  Generating your profile
                </span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    times: [0, 0.5, 1],
                  }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.2,
                    times: [0, 0.5, 1],
                  }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.4,
                    times: [0, 0.5, 1],
                  }}
                >
                  .
                </motion.span>
              </div>
              <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                Extracting information from{" "}
                {websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Website URL</Label>
                <InputGroup
                  className={cn(
                    isUrlInvalid &&
                      "border-destructive focus-within:ring-destructive",
                  )}
                >
                  <InputGroupAddon>
                    <InputGroupText>https://</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    value={websiteUrl}
                    onChange={(e) => onUrlChange(e.target.value)}
                    onPaste={onUrlPaste}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onGenerate();
                      }
                    }}
                    placeholder="example.com"
                  />
                </InputGroup>
                {isUrlInvalid ? (
                  <p className="text-sm text-destructive" role="alert">
                    {urlError}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Enter your website domain (e.g., magicalcx.com)
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={onGenerate}
                disabled={!websiteUrl.trim() || isUrlInvalid}
                className="rounded-full"
              >
                Generate Profile
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
