"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const companyNameParam = searchParams.get("companyName");
  const industryParam = searchParams.get("industry");
  const estimatedTimeParam = searchParams.get("estimatedTime");
  const emailParam = searchParams.get("email");

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      <div
        className={cn(
          "flex min-h-screen flex-col px-8 lg:px-16 xl:px-24 py-12 relative z-10 bg-white",
          "justify-center",
        )}
      >
        <div className={cn("max-w-md w-full mx-auto")}>
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex items-center gap-3 text-green-600">
              <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                <PartyPopper className="size-4" />
              </div>
              <span className="text-sm font-medium">Setup Complete</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-2xl font-medium text-gray-900">
                {companyNameParam
                  ? `${companyNameParam}'s AI Agent is Being Created`
                  : "Your AI Agent is Being Created"}
              </h1>
              <p className="text-muted-foreground leading-8">
                We're training your AI support agent
                {companyNameParam && (
                  <>
                    {" "}
                    for{" "}
                    <span className="font-medium text-gray-900">
                      {companyNameParam}
                    </span>
                  </>
                )}
                {industryParam && (
                  <>
                    {" "}
                    in the{" "}
                    <span className="font-medium text-gray-900">
                      {industryParam}
                    </span>{" "}
                    space
                  </>
                )}
                {/* {onboardingData.targetAudience && (
                    <>
                      , optimized to serve{" "}
                      <span className="font-medium text-gray-900">
                        {onboardingData.targetAudience
                          .toLowerCase()
                          .slice(0, 60)}
                        {onboardingData.targetAudience.length > 60 ? "..." : ""}
                      </span>
                    </>
                  )} */}
                . You'll receive an email at{" "}
                <span className="font-medium text-gray-900">{emailParam}</span>{" "}
                within{" "}
                <span className="font-medium text-gray-900">
                  {estimatedTimeParam || "10-15"} minutes
                </span>
                .
              </p>
            </div>

            <p className="text-sm text-muted-foreground leading-6.5">
              For demo purposes (before payment), your {companyNameParam}'s AI
              agent is trained only on a handful of key pages and basic public
              information from your website, so the answers are intentionally
              limited for proof‑of‑concept and will be far more robust and
              accurate once you’re live on the paid platform.
            </p>

            <p className="text-sm text-gray-400">
              You can safely close this page.
            </p>
          </div>
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
