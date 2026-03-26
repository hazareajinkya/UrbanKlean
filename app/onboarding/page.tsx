"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  isBlockedEmailDomain,
  isBlockedCompanyDomain,
  normalizeDomain,
  validateDomain,
  cn,
} from "@/lib/utils";
import { useOnboardingActions } from "@/lib/hooks/onboarding/use-onboarding-actions";
import { Loader, PartyPopper, Shield, Timer } from "lucide-react";
import { OnboardingData } from "@/lib/types/onboarding";
import { OnboardingMultiStepForm } from "@/components/onboarding/onboarding-multi-step-form";
import OnboardingAnimation from "@/components/onboarding/onboarding-animation";
import datafastService from "@/lib/services/datafast-service";
import { sendGTMEvent } from "@next/third-parties/google";

type Phase = "form" | "onboarding" | "success";

function OnboardingContent() {
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [emailError, setEmailError] = useState("");
  const [domainError, setDomainError] = useState("");
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("form");
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(
    null,
  );

  const { startOnboarding, uploadLogo, generateOnboardingInfo } =
    useOnboardingActions();

  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    if (isBlockedEmailDomain(value)) {
      setEmailError("Please use your work email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateDomainInput = (value: string): boolean => {
    if (!value) {
      setDomainError("Company website is required");
      return false;
    }
    const normalized = normalizeDomain(value);
    if (!validateDomain(normalized)) {
      setDomainError("Please enter a valid company website");
      return false;
    }
    if (isBlockedCompanyDomain(normalized)) {
      setDomainError("Please enter your own company website");
      return false;
    }
    setDomainError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) validateEmail(value);
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

  const searchParams = useSearchParams();
  useEffect(() => {
    datafastService.trackGoal("onboarding_page_viewed");
    sendGTMEvent({ event: "onboarding_viewed" });
  }, []);

  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      const normalized = normalizeDomain(urlParam);
      setDomain(normalized);
      // Validate immediately so user sees if it's valid
      if (normalized) {
        if (!validateDomain(normalized)) {
          setDomainError("Please enter a valid domain");
        } else if (isBlockedCompanyDomain(normalized)) {
          setDomainError("Please enter your own company domain");
        } else {
          setDomainError("");
        }
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isDomainValid = validateDomainInput(domain);

    if (!isEmailValid || !isDomainValid) {
      datafastService.trackGoal("onboarding_validation_failed", {
        source: "onboarding_form",
        reason:
          !isEmailValid && !isDomainValid
            ? "invalid_email_and_domain"
            : isEmailValid
              ? "invalid_domain"
              : "invalid_email",
        workEmail: email,
        domain: normalizeDomain(domain),
      });
      return;
    }

    const normalizedDomain = normalizeDomain(domain);
    const urlString = `https://${normalizedDomain}`;
    datafastService.trackGoal("onboarding_started", {
      source: "onboarding",
      workEmail: email,
      domain: normalizedDomain,
    });
    setUrl(urlString);
    setPhase("onboarding");
  };

  const handleOnboardingFinish = async (data: OnboardingData) => {
    if (!url) return;
    datafastService.trackGoal("onboarding_completed");
    sendGTMEvent({ event: "onboarding_complete" });

    try {
      const result = await startOnboarding.mutateAsync({
        email,
        url,
        onboardingData: data,
      });

      if (result.data) {
        const updatedData = { ...data };
        if (result.data.estimatedTime) {
          updatedData.estimatedTime = result.data.estimatedTime;
        }
        setOnboardingData(updatedData);
      } else {
        setOnboardingData(data);
      }

      router.push(
        "/thanks?" +
          new URLSearchParams({
            companyName: data.companyName,
            industry: data.industry,
            email: email,
            estimatedTime: result.data.estimatedTime?.toString() || "",
          }).toString(),
      );
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      datafastService.trackGoal("onboarding_failed", {
        workEmail: email,
        domain: url.replace(/^https?:\/\//, ""),
        reason:
          error?.response?.data?.message || error?.message || "unknown_error",
        status: error?.response?.status || error?.status || 0,
      });
    }
  };

  const getCompanyNameFromDomain = (domain?: string) => {
    if (!domain) return "your website";

    return domain;
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      <div
        className={cn(
          "flex min-h-screen flex-col px-8 lg:px-16 xl:px-24 py-12 relative z-10 bg-white",
          phase !== "form" && "justify-center",
        )}
      >
        <div
          className={cn(
            "max-w-md w-full mx-auto",
            phase === "form" && "flex flex-1 min-h-0 flex-col",
          )}
        >
          {phase === "form" && (
            <div className="flex flex-1 min-h-0 flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-1 flex-col justify-center">
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-medium leading-normal text-foreground mb-3 ">
                      See it work for your business before you pay a penny
                    </h1>
                    <p className="text-muted-foreground text-base ">
                      We'll create your personalized demo trained on{" "}
                      <span className="font-medium ">
                        {getCompanyNameFromDomain(domain)}
                      </span>
                      . No credit card needed.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Work Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={handleEmailChange}
                        autoFocus
                        onBlur={() => validateEmail(email)}
                        className={cn(
                          "h-11 transition-all",
                          emailError &&
                            "border-destructive focus-visible:ring-destructive/20",
                        )}
                      />
                      {emailError && (
                        <p className="text-destructive text-xs">{emailError}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="domain" className="text-sm font-medium">
                        Company website
                      </Label>
                      <InputGroup className="h-11">
                        <InputGroupAddon
                          align="inline-start"
                          className="bg-muted/30"
                        >
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
                          className={cn(domainError && "border-destructive")}
                        />
                      </InputGroup>
                      {domainError && (
                        <p className="text-destructive text-xs">
                          {domainError}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full font-medium h-11 text-base shadow-sm hover:shadow-md transition-all"
                      disabled={startOnboarding.isPending}
                    >
                      {startOnboarding.isPending ? (
                        <>
                          <Loader className="size-5 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        "Build My AI Agent"
                      )}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      <ul className="mt-1.5 flex flex-row flex-wrap justify-center gap-x-4 gap-y-1">
                        <li className="flex items-center gap-2">
                          <span>✓</span>
                          <span>Custom trained chatbot</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span>✓</span>
                          <span>Shareable demo link</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span>✓</span>
                          <span>No credit card needed</span>
                        </li>
                      </ul>
                    </div>
                  </form>
                </div>
              </div>

              <section className="mt-auto border-t border-muted/50 pt-6 space-y-4">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  We only use publicly available pages to train your AI agent
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <Link
                    href="/legal/terms"
                    className="font-medium hover:underline underline-offset-4 transition-colors"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/legal/privacy"
                    className="font-medium hover:underline underline-offset-4 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </section>
            </div>
          )}

          {phase === "onboarding" && url && (
            <OnboardingMultiStepForm
              email={email}
              url={url}
              onFinish={handleOnboardingFinish}
              generateOnboardingInfo={generateOnboardingInfo}
              uploadLogo={uploadLogo}
              mode="onboarding"
              showEstimatedTime={true}
              isSubmitting={startOnboarding.isPending}
              submitButtonText="Finish Setup"
              onParsedPhaseChange={setPhase}
              onEmailError={setEmailError}
            />
          )}
        </div>
      </div>

      <OnboardingAnimation />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
