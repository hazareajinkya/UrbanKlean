"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, normalizeDomain } from "@/lib/utils";
import { OnboardingData } from "@/lib/types/onboarding";
import {
  Loader,
  Globe,
  Link2,
  Building2,
  Check,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Cpu,
  Timer,
} from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";

type ProcessingStep = {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
};

const PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 1,
    title: "Identifying URL",
    description: "Verifying your website address",
    icon: Globe,
    color: "text-blue-500",
  },
  {
    id: 2,
    title: "Collecting Main URLS",
    description: "Scanning page structure and layout",
    icon: Link2,
    color: "text-purple-500",
  },
  {
    id: 3,
    title: "Collecting Company Information",
    description: "Gathering business details",
    icon: Building2,
    color: "text-indigo-500",
  },
  {
    id: 4,
    title: "Summarizing Data",
    description: "Consolidating gathered insights",
    icon: FileText,
    color: "text-pink-500",
  },
  {
    id: 5,
    title: "Processing",
    description: "Finalizing your agent setup",
    icon: Cpu,
    color: "text-orange-500",
  },
];

const CONFIRMATION_STEPS = [
  {
    id: 1,
    title: "Brand Identity",
    description: "Logo, name, color & tagline",
  },
  { id: 2, title: "Description", description: "About your business" },
  { id: 3, title: "Audience & Tone", description: "Who you serve and how" },
  {
    id: 4,
    title: "Core Offerings",
    description: "What makes you unique",
  },
];

type Phase = "processing" | "confirmation";

interface OnboardingMultiStepFormProps {
  url?: string;
  initialData?: Partial<OnboardingData>;
  onFinish: (data: OnboardingData) => void;
  generateOnboardingInfo: UseMutationResult<
    { data: { data: OnboardingData } },
    Error,
    { url: string }
  >;
  uploadLogo: UseMutationResult<string, Error, File>;
  mode?: "onboarding" | "workspace";
  showEstimatedTime?: boolean;
  companyNameLabel?: string;
  title?: string;
  isSubmitting?: boolean;
  submitButtonText?: string;
  onCompanyNameValidate?: (name: string) => string | null;
}

const getDefaultOnboardingData = (): OnboardingData => ({
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

export const OnboardingMultiStepForm = ({
  url,
  initialData,
  onFinish,
  generateOnboardingInfo,
  uploadLogo,
  mode = "onboarding",
  showEstimatedTime = false,
  companyNameLabel = "Company Name",
  title = "Customize Agent",
  isSubmitting = false,
  submitButtonText = "Finish Setup",
  onCompanyNameValidate,
}: OnboardingMultiStepFormProps) => {
  const [phase, setPhase] = useState<Phase>(
    url && !initialData ? "processing" : "confirmation"
  );
  const [processingStep, setProcessingStep] = useState(0);
  const [confirmationStep, setConfirmationStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(() => {
    const defaultData = getDefaultOnboardingData();
    return { ...defaultData, ...initialData };
  });
  const [companyNameError, setCompanyNameError] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Start processing when URL is provided
  useEffect(() => {
    if (!url || phase !== "processing" || processingStep !== 0) return;

    setProcessingStep(1);
    generateOnboardingInfo.mutate(
      { url },
      {
        onSuccess: (result) => {
          setOnboardingData(result.data.data);
        },
        onError: () => {
          setPhase("confirmation");
          setProcessingStep(0);
        },
      }
    );
  }, [url, phase, processingStep, generateOnboardingInfo]);

  // Animate processing steps
  useEffect(() => {
    if (phase !== "processing" || !url || processingStep === 0) return;

    const stepDuration = 3000;
    const interval = setInterval(() => {
      setProcessingStep((prev) => {
        const next = prev + 1;
        if (next > PROCESSING_STEPS.length) {
          clearInterval(interval);
          // Transition to confirmation when animation completes (only if we have data)
          if (onboardingData?.companyName) {
            setTimeout(() => {
              setPhase("confirmation");
            }, 500);
          }
          return prev;
        }
        return next;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [phase, url, processingStep, onboardingData]);

  const updateOnboardingData = (field: keyof OnboardingData, value: string) => {
    setOnboardingData({ ...onboardingData, [field]: value });
  };

  const validateCompanyName = (): boolean => {
    const name = onboardingData?.companyName?.trim() || "";
    if (onCompanyNameValidate) {
      const error = onCompanyNameValidate(name);
      if (error) {
        setCompanyNameError(error);
        return false;
      }
    } else if (!name) {
      if (mode === "workspace") {
        setCompanyNameError("Workspace name is required");
      } else {
        setCompanyNameError("Company name is required");
      }
      return false;
    }
    setCompanyNameError("");
    return true;
  };

  const handleNextConfirmationStep = () => {
    // Validate company name on step 1 before proceeding
    if (confirmationStep === 1) {
      if (!validateCompanyName()) {
        return;
      }
    }

    if (confirmationStep < CONFIRMATION_STEPS.length) {
      setConfirmationStep(confirmationStep + 1);
    } else {
      // Final submit - validate company name again
      if (onboardingData) {
        if (!validateCompanyName()) {
          // Go back to step 1 if validation fails
          setConfirmationStep(1);
          return;
        }
        onFinish(onboardingData);
      }
    }
  };

  const handlePrevConfirmationStep = () => {
    if (confirmationStep > 1) {
      setConfirmationStep(confirmationStep - 1);
    }
  };

  if (phase === "processing") {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Analyzing {url ? normalizeDomain(url) : ""}
          </h2>
        </div>

        {/* Current step indicator */}
        <div className="space-y-6">
          {PROCESSING_STEPS.map((step) => {
            const isActive = step.id === processingStep;
            const isCompleted = step.id < processingStep;

            return (
              <div key={step.id} className="flex items-center gap-4">
                <div
                  className={cn(
                    "size-6 flex items-center justify-center transition-all duration-500",
                    isCompleted
                      ? "text-green-500"
                      : isActive
                      ? "text-primary"
                      : "text-gray-200"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-5" />
                  ) : isActive ? (
                    <Loader className="size-5 animate-spin" />
                  ) : (
                    <div className="size-2 rounded-full bg-current" />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isActive
                        ? "text-gray-900"
                        : isCompleted
                        ? "text-gray-500"
                        : "text-gray-300"
                    )}
                  >
                    {step.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 shrink-0">
            {title}
          </h1>
          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${
                    (confirmationStep / CONFIRMATION_STEPS.length) * 100
                  }%`,
                }}
              />
            </div>
            <span className="text-sm text-gray-500 shrink-0 tabular-nums">
              {confirmationStep}/{CONFIRMATION_STEPS.length}
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm">
          {CONFIRMATION_STEPS[confirmationStep - 1].title}
        </p>
      </div>

      {showEstimatedTime && onboardingData.estimatedTime && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Timer className="size-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              Estimated Setup Time
            </h3>
            <p className="text-sm text-blue-700">
              Based on your data complexity, your agent will be ready in
              approximately{" "}
              <span className="font-semibold">
                {onboardingData.estimatedTime} minutes
              </span>
              .
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Step 1: Brand Identity */}
        {confirmationStep === 1 && (
          <div className="space-y-6">
            {/* Logo and Color in same row */}
            <div className="flex gap-4">
              <div
                className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:bg-muted/50 cursor-pointer flex-1"
                onClick={() => logoInputRef.current?.click()}
              >
                <div className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-white flex items-center justify-center">
                    {uploadLogo.isPending ? (
                      <Loader className="size-6 text-muted-foreground animate-spin" />
                    ) : onboardingData.logo ? (
                      <img
                        src={onboardingData.logo}
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
                    <h3 className="font-medium text-gray-900 text-sm">Logo</h3>
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
                        updateOnboardingData("logo", url);
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }}
                />
              </div>

              <div className="rounded-xl border bg-card p-4 flex-1">
                <div className="flex items-center gap-4">
                  <div
                    className="size-16 shrink-0 rounded-lg border flex items-center justify-center cursor-pointer"
                    style={{
                      backgroundColor: onboardingData.primaryColor,
                    }}
                    onClick={() =>
                      document.getElementById("primaryColor")?.click()
                    }
                  >
                    <input
                      id="primaryColor"
                      type="color"
                      value={onboardingData.primaryColor}
                      onChange={(e) =>
                        updateOnboardingData("primaryColor", e.target.value)
                      }
                      className="sr-only"
                    />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      Brand Color
                    </h3>
                    <Input
                      value={onboardingData.primaryColor}
                      onChange={(e) =>
                        updateOnboardingData("primaryColor", e.target.value)
                      }
                      placeholder="#000000"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">
                  {companyNameLabel}
                  {mode === "workspace" && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                <Input
                  value={onboardingData.companyName}
                  onChange={(e) => {
                    updateOnboardingData("companyName", e.target.value);
                    if (companyNameError) {
                      setCompanyNameError("");
                    }
                  }}
                  onBlur={() => {
                    if (confirmationStep === 1) {
                      validateCompanyName();
                    }
                  }}
                  className={cn(
                    "h-11",
                    companyNameError && "border-destructive"
                  )}
                  placeholder={
                    mode === "workspace"
                      ? "Enter your workspace name"
                      : "Enter your company name"
                  }
                />
                {companyNameError && (
                  <p className="text-destructive text-xs">{companyNameError}</p>
                )}
                {mode === "workspace" && (
                  <p className="text-xs text-muted-foreground">
                    This is required to create your workspace
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Tagline
                  {mode === "workspace" && (
                    <span className="text-muted-foreground text-xs font-normal ml-1">
                      (Optional)
                    </span>
                  )}
                </Label>
                <Input
                  value={onboardingData.tagline}
                  onChange={(e) =>
                    updateOnboardingData("tagline", e.target.value)
                  }
                  className="h-11"
                  placeholder="A short tagline"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {confirmationStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-700">
                One-line Pitch
                {mode === "workspace" && (
                  <span className="text-muted-foreground text-xs font-normal ml-1">
                    (Optional)
                  </span>
                )}
              </Label>
              <Input
                value={onboardingData.oneLineDescription}
                onChange={(e) =>
                  updateOnboardingData("oneLineDescription", e.target.value)
                }
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">
                Detailed Description
                {mode === "workspace" && (
                  <span className="text-muted-foreground text-xs font-normal ml-1">
                    (Optional)
                  </span>
                )}
              </Label>
              <Textarea
                value={onboardingData.description}
                onChange={(e) =>
                  updateOnboardingData("description", e.target.value)
                }
                className="min-h-[150px] resize-none text-base leading-relaxed"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Business Type
                  {mode === "workspace" && (
                    <span className="text-muted-foreground text-xs font-normal ml-1">
                      (Optional)
                    </span>
                  )}
                </Label>
                <Select
                  value={onboardingData.businessType}
                  onValueChange={(value) =>
                    updateOnboardingData("businessType", value)
                  }
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
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Industry
                  {mode === "workspace" && (
                    <span className="text-muted-foreground text-xs font-normal ml-1">
                      (Optional)
                    </span>
                  )}
                </Label>
                <Input
                  value={onboardingData.industry}
                  onChange={(e) =>
                    updateOnboardingData("industry", e.target.value)
                  }
                  className="h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Audience */}
        {confirmationStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-700">
                Target Audience
                {mode === "workspace" && (
                  <span className="text-muted-foreground text-xs font-normal ml-1">
                    (Optional)
                  </span>
                )}
              </Label>
              <Textarea
                value={onboardingData.targetAudience}
                onChange={(e) =>
                  updateOnboardingData("targetAudience", e.target.value)
                }
                className="min-h-[120px] resize-none"
                placeholder="e.g. Small business owners looking for automation..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">
                Tone of Voice
                {mode === "workspace" && (
                  <span className="text-muted-foreground text-xs font-normal ml-1">
                    (Optional)
                  </span>
                )}
              </Label>
              <Textarea
                value={onboardingData.toneGuidelines}
                onChange={(e) =>
                  updateOnboardingData("toneGuidelines", e.target.value)
                }
                className="min-h-[120px] resize-none"
                placeholder="e.g. Professional yet friendly, extremely concise..."
              />
            </div>
          </div>
        )}

        {/* Step 4: Core Offerings */}
        {confirmationStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-700">
                Offerings
                {mode === "workspace" && (
                  <span className="text-muted-foreground text-xs font-normal ml-1">
                    (Optional)
                  </span>
                )}
              </Label>
              <Textarea
                value={onboardingData.offerings}
                onChange={(e) =>
                  updateOnboardingData("offerings", e.target.value)
                }
                className="min-h-[120px] resize-none"
                placeholder="e.g. AI-powered customer support, automated workflows, real-time analytics..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">
                Differentiators
                {mode === "workspace" && (
                  <span className="text-muted-foreground text-xs font-normal ml-1">
                    (Optional)
                  </span>
                )}
              </Label>
              <Textarea
                value={onboardingData.differentiators}
                onChange={(e) =>
                  updateOnboardingData("differentiators", e.target.value)
                }
                className="min-h-[120px] resize-none"
                placeholder="e.g. Industry-leading response time, 24/7 availability, multilingual support..."
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-6">
        {confirmationStep > 1 && (
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevConfirmationStep}
            className="w-auto max-w-max"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        )}
        <Button
          size="lg"
          onClick={handleNextConfirmationStep}
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="size-4 animate-spin" />
              {mode === "onboarding" ? "Creating Agent" : "Creating Workspace"}
            </>
          ) : confirmationStep === CONFIRMATION_STEPS.length ? (
            submitButtonText
          ) : (
            <>
              Next Step <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
