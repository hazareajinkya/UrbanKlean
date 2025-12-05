"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDemoModal } from "../landing/demo-modal";

export const PricingContent = () => {
  const [usage, setUsage] = useState([10]); // 10k default

  const handleSliderChange = (value: number[]) => {
    setUsage(value);
  };

  const currentUsage = usage[0];

  // Dynamic pricing logic
  const getPricingData = () => {
    const tiers = [
      {
        id: "growth",
        name: "Growth",
        description: "Perfect for startups and early-stage products.",
        basePrice: 149,
        badgeText: "Recommended",
        features: [
          "Standard AI Models",
          "Email Support",
          "5 Team Members",
          "Basic Analytics",
        ],
      },
      {
        id: "scale",
        name: "Scale",
        description: "For growing teams requiring higher volume.",
        basePrice: 299,
        badgeText: "Best Value",
        features: [
          "Everything in Growth",
          "Advanced AI Models (GPT-4)",
          "Priority Support",
          "Unlimited Team Members",
          "API Access",
        ],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        description: "Custom solutions for large scale operations.",
        basePrice: null,
        badgeText: "High Value",
        features: [
          "Everything in Scale",
          "Custom Model Fine-tuning",
          "Dedicated Success Manager",
          "SSO & Enterprise Security",
          "SLA Guarantee",
        ],
      },
    ];

    return tiers.map((tier) => {
      let price = tier.basePrice;
      let isRecommended = false;
      let isActive = false;
      let messages = "";
      let messagePrefix = "Starts at";

      // Determine which tier is active based on slider
      if (currentUsage <= 10) {
        if (tier.id === "growth") {
          isRecommended = true;
          isActive = true;
          if (currentUsage === 5) price = 99;
          else price = 149;
          messages = `${currentUsage}k`;
          messagePrefix = "Includes";
        } else if (tier.id === "scale") {
          isActive = true;
          if (currentUsage === 5) price = 129;
          else price = 169;
          messages = `${currentUsage}k`;
          messagePrefix = "Includes";
        } else {
          messages = "35k+";
        }
      } else if (currentUsage <= 30) {
        if (tier.id === "scale") {
          isRecommended = true;
          isActive = true;
          if (currentUsage === 15) price = 189;
          else if (currentUsage === 20) price = 229;
          else if (currentUsage === 25) price = 269;
          else price = 299;
          messages = `${currentUsage}k`;
          messagePrefix = "Includes";
        } else if (tier.id === "growth") {
          price = 149; // Max price for Growth
          messages = "10k";
          messagePrefix = "Includes";
        } else {
          messages = "35k+";
        }
      } else {
        if (tier.id === "enterprise") {
          isRecommended = true;
          isActive = true;
          messages = "35k+";
          messagePrefix = "Includes";
        } else if (tier.id === "growth") {
          price = 149; // Max price for Growth
          messages = "10k";
          messagePrefix = "Includes";
        } else if (tier.id === "scale") {
          price = 299; // Max price for Scale
          messages = "30k";
          messagePrefix = "Includes";
        }
      }

      let buttonText = price ? "Choose Plan" : "Talk to Sales";

      if (!isActive) {
        if (tier.id === "growth") buttonText = "Available up to 10k only";
        else if (tier.id === "scale") buttonText = "Available up to 30k only";
        else if (tier.id === "enterprise") buttonText = "Talk to Sales";
      }

      return {
        ...tier,
        price,
        isRecommended,
        isActive,
        messages,
        messagePrefix,
        buttonText,
      };
    });
  };

  const pricingTiers = getPricingData();
  const { openDemoModal } = useDemoModal();

  return (
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
              {currentUsage}k
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
          <div className=" relative">
            <Slider
              defaultValue={[10]}
              max={50}
              min={5}
              step={5}
              value={usage}
              onValueChange={handleSliderChange}
              className="mb-8 py-4"
            />
            <div className="absolute top-12 left-0 right-0 h-6 pointer-events-none">
              {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((value) => {
                const percentage = ((value - 5) / 45) * 100;
                return (
                  <span
                    key={value}
                    className="absolute text-sm font-medium text-muted-foreground/50 uppercase tracking-widest -translate-x-1/2"
                    style={{ left: `${percentage}%` }}
                  >
                    {value}k{value === 50 ? "+" : ""}
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
            {tier.isRecommended && (
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
              onClick={openDemoModal}
              className={cn(
                "w-full mb-8",
                tier.isRecommended
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : !tier.isActive
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-foreground text-background"
              )}
            >
              {!tier.isActive && tier.id !== "enterprise" && (
                <Lock className="w-4 h-4 mr-2" />
              )}
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
        Need more than 100k messages?{" "}
        <Link
          href="https://calendly.com/echorift-ai"
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Book a meeting
        </Link>{" "}
        with our engineering team.
      </div>
    </div>
  );
};
