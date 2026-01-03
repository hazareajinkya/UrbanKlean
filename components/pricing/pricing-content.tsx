"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoModal } from "../landing/demo-modal";
import { MESSAGE_TIERS, PLANS } from "@/lib/plans";
import { usePaddleCheckout } from "@/lib/hooks/use-paddle-checkout";
import { initializePaddle } from "@/lib/clients/paddle";
import { PricingFaq } from "./pricing-faq";

export const PricingContent = () => {
  const [usage, setUsage] = useState([10]); // 10k default
  const { initiateCheckout } = usePaddleCheckout();
  const { openDemoModal } = useDemoModal();

  // Initialize Paddle SDK on mount
  useEffect(() => {
    initializePaddle().catch((error) => {
      console.error("Failed to initialize Paddle:", error);
    });
  }, []);

  const handleSliderChange = (value: number[]) => {
    setUsage(value);
  };

  const currentUsage = usage[0] * 1000; // Convert to actual message count

  // Find the closest tier that matches or is just above the current usage
  const findClosestTier = (usageValue: number) => {
    return (
      MESSAGE_TIERS.find((tier) => tier >= usageValue) ||
      MESSAGE_TIERS[MESSAGE_TIERS.length - 1]
    );
  };

  // Dynamic pricing logic
  const getPricingData = () => {
    const selectedTier = findClosestTier(currentUsage);
    const selectedTierInK = selectedTier / 1000;

    const growthPlan = PLANS.growth;
    const scalePlan = PLANS.scale;

    const growthPlanData = (() => {
      const maxMessages = growthPlan.maxMessages;
      const isWithinGrowthLimit = currentUsage <= maxMessages;
      const tierData = growthPlan.tiers.find(
        (t) => t.messages === selectedTier
      );

      let price: number | null = null;
      let isRecommended = false;
      let isActive = false;
      let messages = "";
      let messagePrefix = "Starts at";
      let buttonText = "Choose Plan";

      if (isWithinGrowthLimit && tierData) {
        price = tierData.price;
        isActive = true;
        messages = `${selectedTierInK}k`;
        messagePrefix = "Includes";
        if (currentUsage <= 10000) isRecommended = true;
      } else {
        const maxTier = growthPlan.tiers.find((t) => t.messages === 10000);
        price = maxTier?.price || null;
        messages = "10k";
        messagePrefix = "Includes";
        buttonText = "Available up to 10k only";
      }

      return {
        id: growthPlan.id,
        name: growthPlan.name,
        description: growthPlan.description,
        price,
        isRecommended,
        isActive,
        messages,
        messagePrefix,
        buttonText,
        features: growthPlan.features,
        badgeText: isRecommended ? "Recommended" : undefined,
        planId: growthPlan.id as "growth" | "scale",
        tier: selectedTier,
        paddlePriceId: tierData?.paddlePriceId,
      };
    })();

    const scalePlanData = (() => {
      const tierData = scalePlan.tiers.find((t) => t.messages === selectedTier);

      let price: number | null = null;
      let isRecommended = false;
      let isActive = false;
      let messages = "";
      let messagePrefix = "Starts at";
      let buttonText = "Choose Plan";

      if (tierData && currentUsage <= 30000) {
        price = tierData.price;
        isActive = true;
        messages = `${selectedTierInK}k`;
        messagePrefix = "Includes";
        if (currentUsage > 10000 && currentUsage <= 30000) isRecommended = true;
      } else if (currentUsage > 30000) {
        const maxTier = scalePlan.tiers.find((t) => t.messages === 30000);
        price = maxTier?.price || null;
        messages = "30k";
        messagePrefix = "Includes";
        buttonText = "Available up to 30k only";
      }

      return {
        id: scalePlan.id,
        name: scalePlan.name,
        description: scalePlan.description,
        price,
        isRecommended,
        isActive,
        messages,
        messagePrefix,
        buttonText,
        features: scalePlan.features,
        badgeText: isRecommended ? "Best Value" : undefined,
        planId: scalePlan.id as "growth" | "scale",
        tier: selectedTier,
        paddlePriceId: tierData?.paddlePriceId,
      };
    })();

    const enterprisePlanData = (() => {
      const isActive = currentUsage > 30000;
      const isRecommended = currentUsage > 30000;
      return {
        id: "enterprise",
        name: "Enterprise",
        description: "Custom solutions for large scale operations.",
        price: null,
        isRecommended,
        isActive,
        messages: "30k+",
        messagePrefix: "Includes",
        buttonText: "Talk to Sales",
        features: [
          "Everything in Scale",
          "Custom Model Fine-tuning",
          "Dedicated Success Manager",
          "SSO & Enterprise Security",
          "SLA Guarantee",
        ],
        badgeText: isRecommended ? "High Value" : undefined,
        planId: undefined as "growth" | "scale" | undefined,
        tier: undefined as number | undefined,
        paddlePriceId: undefined as string | undefined,
      };
    })();

    return [growthPlanData, scalePlanData, enterprisePlanData];
  };

  const pricingTiers = useMemo(() => getPricingData(), [currentUsage]);

  const handleCheckout = (tier: (typeof pricingTiers)[0]) => {
    if (tier.id === "enterprise") {
      openDemoModal();
      return;
    }
    console.log("process.env: ", process.env);

    // In production, open demo modal for all pricing buttons
    if (process.env.NEXT_PUBLIC_ENV === "production") {
      openDemoModal();
      return;
    }

    if (tier.planId && tier.tier !== undefined) {
      initiateCheckout({
        planId: tier.planId,
        tier: tier.tier,
      });
    }
  };

  const tierValues = MESSAGE_TIERS.map((tier) => tier / 1000);
  const minTier = tierValues[0];
  const maxTier = tierValues[tierValues.length - 1];
  const currentUsageInK = currentUsage / 1000;

  return (
    <>
      <div className="section-content-padding section-container border-x py-24 md:py-32 section-content-padding px-6">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="section-heading">
            Choose the plan that fits your volume.
          </h1>
          <p className="section-subheadline">
            Simple pricing that scales with your AI interactions. No hidden fees.
          </p>
        </div>

        {/* Usage Estimator */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="flex flex-col items-center text-center mb-10">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
              Estimate your usage
            </h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl md:text-3xl font-medium text-primary tracking-tight">
                {currentUsageInK}k
              </span>
              <span className="text-lg md:text-xl font-medium text-muted-foreground">
                messages/mo
              </span>
            </div>
            <p className="text-muted-foreground">
              Slide to adjust your monthly volume
            </p>
          </div>

          <div className="px-4">
            <div className="relative">
              <Slider
                defaultValue={[10]}
                max={maxTier}
                min={minTier}
                step={5}
                value={usage}
                onValueChange={handleSliderChange}
                className="mb-8 py-4"
              />
              <div className="absolute top-12 left-0 right-0 h-6 pointer-events-none">
                {tierValues.map((value) => {
                  const percentage =
                    ((value - minTier) / (maxTier - minTier)) * 100;
                  return (
                    <span
                      key={value}
                      className="absolute text-sm font-medium text-muted-foreground/50 uppercase tracking-widest -translate-x-1/2"
                      style={{ left: `${percentage}%` }}
                    >
                      {value}k{value === maxTier ? "+" : ""}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative flex flex-col p-8 rounded-xl border transition-all duration-200",
                tier.isRecommended
                  ? "border-primary shadow-lg scale-105 z-10 bg-card"
                  : "border-border bg-card/50",
                !tier.isActive && "opacity-60 cursor-not-allowed"
              )}
            >
              {tier.isRecommended && tier.badgeText && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {tier.badgeText}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm text-muted-foreground min-h-[40px]">
                  {tier.description}
                </p>
              </div>

              <div className="mb-8">
                {tier.price !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold">Talk to us</div>
                )}
                <div className="text-sm font-medium text-primary mt-2">
                  {tier.price !== null
                    ? `${tier.messagePrefix} ${tier.messages} messages / month`
                    : `${tier.messages} messages`}
                </div>
              </div>

              <Button
                disabled={!tier.isActive}
                onClick={() => handleCheckout(tier)}
                className={cn(
                  "w-full mb-8 rounded-full",
                  tier.isRecommended
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : !tier.isActive
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "bg-foreground text-background"
                )}
              >
                {!tier.isActive && <Lock className="w-4 h-4 mr-2" />}
                {tier.buttonText}
              </Button>

              <ul className="space-y-4 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16 text-muted-foreground text-sm">
          Need more than 30k messages?{" "}
          <button
            onClick={openDemoModal}
            className="text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer"
          >
            Book a meeting
          </button>{" "}
          with our engineering team.
        </div>
      </div>

      {/* FAQ Section */}
      <PricingFaq />
    </>
  );
};
