"use client";

import React, { useState } from "react";
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
import { Loader, PartyPopper, Timer } from "lucide-react";
import { OnboardingData } from "@/lib/types/onboarding";
import { OnboardingMultiStepForm } from "@/components/onboarding/onboarding-multi-step-form";

type Phase = "form" | "onboarding" | "success";

export default function Page() {
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [emailError, setEmailError] = useState("");
  const [domainError, setDomainError] = useState("");

  const [phase, setPhase] = useState<Phase>("form");
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(
    null
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
      setDomainError("Business domain is required");
      return false;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isDomainValid = validateDomainInput(domain);

    if (!isEmailValid || !isDomainValid) return;

    const normalizedDomain = normalizeDomain(domain);
    const urlString = `https://${normalizedDomain}`;

    setUrl(urlString);
    setPhase("onboarding");
  };

  const handleOnboardingFinish = async (data: OnboardingData) => {
    if (!url) return;

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

      setPhase("success");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Left Side: Interaction Area */}
      <div className="flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12 relative z-10 bg-white">
        <div className="max-w-md w-full mx-auto">
          {phase === "form" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-medium text-foreground mb-3 tracking-tight">
                  Get Started
                </h1>
                <p className="text-muted-foreground text-base">
                  Enter your work email and business domain to begin setting up
                  your Empathy-First AI customer experience agent.
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
                    onBlur={() => validateEmail(email)}
                    className={cn(
                      "h-11 transition-all",
                      emailError &&
                        "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {emailError && (
                    <p className="text-destructive text-xs">{emailError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain" className="text-sm font-medium">
                    Business Domain
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
                    <p className="text-destructive text-xs">{domainError}</p>
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
                    "Continue"
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link
                  href="/legal/terms"
                  className="text-foreground hover:underline underline-offset-4 transition-colors"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal/privacy"
                  className="text-foreground hover:underline underline-offset-4 transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          )}

          {phase === "onboarding" && url && (
            <OnboardingMultiStepForm
              url={url}
              onFinish={handleOnboardingFinish}
              generateOnboardingInfo={generateOnboardingInfo}
              uploadLogo={uploadLogo}
              mode="onboarding"
              showEstimatedTime={true}
              isSubmitting={startOnboarding.isPending}
              submitButtonText="Finish Setup"
            />
          )}

          {phase === "success" && onboardingData && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div className="flex items-center gap-3 text-green-600">
                <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                  <PartyPopper className="size-4" />
                </div>
                <span className="text-sm font-medium">Setup Complete</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-2xl font-medium text-gray-900">
                  {onboardingData.companyName
                    ? `${onboardingData.companyName}'s AI Agent is Being Created`
                    : "Your AI Agent is Being Created"}
                </h1>
                <p className="text-gray-600 leading-relaxed">
                  We're training your AI support agent
                  {onboardingData.companyName && (
                    <>
                      {" "}
                      for{" "}
                      <span className="font-medium text-gray-900">
                        {onboardingData.companyName}
                      </span>
                    </>
                  )}
                  {onboardingData.industry && (
                    <>
                      {" "}
                      in the{" "}
                      <span className="font-medium text-gray-900">
                        {onboardingData.industry}
                      </span>{" "}
                      space
                    </>
                  )}
                  {onboardingData.targetAudience && (
                    <>
                      , optimized to serve{" "}
                      <span className="font-medium text-gray-900">
                        {onboardingData.targetAudience
                          .toLowerCase()
                          .slice(0, 60)}
                        {onboardingData.targetAudience.length > 60 ? "..." : ""}
                      </span>
                    </>
                  )}
                  . You'll receive an email at{" "}
                  <span className="font-medium text-gray-900">{email}</span>{" "}
                  within{" "}
                  <span className="font-medium text-gray-900">
                    {onboardingData.estimatedTime || "10-15"} minutes
                  </span>
                  .
                </p>
              </div>

              <p className="text-sm text-gray-400">
                You can safely close this page.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-primary"></div>
    </div>
  );
}
