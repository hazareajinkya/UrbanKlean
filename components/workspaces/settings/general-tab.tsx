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
import { Loader, Trash, Palette, Sparkles } from "lucide-react";

import { useWorkspaceActions } from "@/lib/hooks/workspace/use-workspace-actions";
import { IWorkspace } from "@/lib/types/workspace";
import { normalizeDomain, validateDomain, cn } from "@/lib/utils";
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
  const [offerings, setOfferings] = useState("");
  const [differentiators, setDifferentiators] = useState("");

  // AI generation loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWebsiteDialogOpen, setIsWebsiteDialogOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [urlError, setUrlError] = useState("");

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

  const { updateWorkspace, generateWorkspaceInfo } = useWorkspaceActions();
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
    setPrimaryColor(workspace.info.primaryColor || "");
    setOfferings(workspace.info.offerings || "");
    setDifferentiators(workspace.info.differentiators || "");

    setTimeout(() => {
      isInitializing.current = false;
    }, 100);
  }, [workspace]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Business type: ", businessType);
    await updateWorkspace.mutateAsync({
      wid,
      updates: {
        name: workspaceName.trim(),
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
          offerings: offerings.trim(),
          differentiators: differentiators.trim(),
        },
      },
    });
  };

  // Handle AI generation with 5 second shimmer
  const handleAIGenerate = () => {
    setWebsiteUrl("");
    setUrlError("");
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
      }
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
      {/* General Information Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl ">General Information</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update your workspace name and description.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="space-y-5 ">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAIGenerate}
                  disabled={isGenerating}
                >
                  <Sparkles className="h-4 w-4" />
                  {isGenerating ? "Generating..." : "Auto Generate with AI"}
                </Button>
              </div>
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
                <Label>Workspace Description</Label>
                <Textarea
                  placeholder="Describe what this workspace is used for (optional)"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  disabled={updateWorkspace.isPending}
                  rows={4}
                  className="resize-none"
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

              {/* Row 2: Industry & Business Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    placeholder="e.g., Technology, Healthcare, Finance"
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
                      // Prevent resetting to empty during initialization
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

              {/* Row 3: Description */}
              <div className="space-y-2">
                <Label>Business Description</Label>
                <Textarea
                  placeholder="Describe your business, products, and services..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={updateWorkspace.isPending}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This helps AI understand your business context better
                </p>
              </div>

              {/* Row 4: Target Audience */}
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Textarea
                  placeholder="Describe your ideal customers and target market..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  disabled={updateWorkspace.isPending}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Row 5: Tone Guidelines */}
              <div className="space-y-2">
                <Label>Tone Guidelines</Label>
                <Textarea
                  placeholder="e.g., Professional yet friendly, Formal, Casual and conversational..."
                  value={toneGuidelines}
                  onChange={(e) => setToneGuidelines(e.target.value)}
                  disabled={updateWorkspace.isPending}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Define the communication style for your AI agents
                </p>
              </div>

              {/* Row 6: Primary Color */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Primary Color
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={primaryColor || "#6366f1"}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    disabled={updateWorkspace.isPending}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    placeholder="#6366f1"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    disabled={updateWorkspace.isPending}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your brand&apos;s primary color for UI customization
                </p>
              </div>

              {/* Row 7: Offerings */}
              <div className="space-y-2">
                <Label className="text-gray-700">Offerings</Label>
                <Textarea
                  value={offerings}
                  onChange={(e) => setOfferings(e.target.value)}
                  disabled={updateWorkspace.isPending}
                  className="min-h-[120px] resize-none"
                  placeholder="e.g. AI-powered customer support, automated workflows, real-time analytics..."
                />
              </div>

              {/* Row 8: Differentiators */}
              <div className="space-y-2">
                <Label className="text-gray-700">Differentiators</Label>
                <Textarea
                  value={differentiators}
                  onChange={(e) => setDifferentiators(e.target.value)}
                  disabled={updateWorkspace.isPending}
                  className="min-h-[120px] resize-none"
                  placeholder="e.g. Industry-leading response time, 24/7 availability, multilingual support..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={updateWorkspace.isPending || !workspaceName.trim()}
                  className="min-w-[120px]"
                >
                  {updateWorkspace.isPending && (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Business Information Section */}

      {/* Danger Zone Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-medium text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Irreversible and destructive actions. Proceed with caution.
          </p>
        </div>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Trash className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-destructive">
                  Delete Workspace
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Once you delete a workspace, there is no going back. This
                  action will permanently delete all workspace data, including
                  agents, knowledge bases, members, and all associated content.
                </p>
                <div className="mt-4">
                  <Button variant="destructive" disabled>
                    Delete Workspace
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isWebsiteDialogOpen}
        closeModal={() => setIsWebsiteDialogOpen(false)}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Auto Generate with AI</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your business website URL to automatically extract and
              generate your business profile.
            </p>
          </div>

          {isGenerating ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <div className="relative h-16 w-16 flex items-center justify-center">
                {/* Central Core */}
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

                {/* Orbital Rings - Atomic Look */}
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

                {/* Orbiting Particles */}
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
                  <span className="text-sm font-medium text-primary">
                    Generating Profile
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
                  Analyzing content from{" "}
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
                        "border-destructive focus-within:ring-destructive"
                    )}
                  >
                    <InputGroupAddon>
                      <InputGroupText>https://</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      value={websiteUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      onPaste={handleUrlPaste}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          startAIGeneration();
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
                  variant="outline"
                  onClick={() => setIsWebsiteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={startAIGeneration}
                  disabled={!websiteUrl.trim() || isUrlInvalid}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Profile
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </motion.div>
  );
}
