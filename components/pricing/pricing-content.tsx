"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoModal } from "../landing/demo-modal";
import { useGeo } from "@/lib/hooks/geo/use-geo";
import { PricingFaq } from "./pricing-faq";
import { PLANS } from "@/lib/plans";
import { usePolarCheckout } from "@/lib/hooks/use-polar-checkout";
import { useRazorpayCheckout } from "@/lib/hooks/use-razorpay-checkout";
import plans from "razorpay/dist/types/plans";

export const PricingContent = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "annually",
  );
  const { openDemoModal } = useDemoModal();
  const { isIndia ,isLoading } = useGeo();
  const { initiateCheckout: initiatePolarCheckout } = usePolarCheckout();
  const { initiateCheckout: initiateRazorpayCheckout } = useRazorpayCheckout();

  const handleCheckout = () => {
    if (process.env.NEXT_PUBLIC_ENV === "production") {
      openDemoModal();
      return;
    }

    const plan = PLANS.all_in_one;

    const targetTier = plan.tiers.find((t) => t.billingCycle === billingCycle);

    if (targetTier) {
      if (isIndia) {
        initiateRazorpayCheckout({
          planId: "all_in_one" as any,
          tier: targetTier.messages,
        });
      } else {
        initiatePolarCheckout({
          planId: "all_in_one" as any,
          tier: targetTier.messages,
        });
      }
    }
  };

  const currencySymbol = isIndia ? "₹" : "$";
  const plan = PLANS.all_in_one;
  const price = useMemo(() => {
    if (billingCycle === "monthly") {
      return isIndia ? "13,999" : "249";
    }
    return isIndia ? "9,999" : "199";
  }, [billingCycle, isIndia]);

  const originalPrice = useMemo(() => {
    if (billingCycle === "annually") {
      return isIndia ? "13,999" : "249";
    }
    return null;
  }, [billingCycle, isIndia]);

  const features = plan.features;

  return (
    <>
      <div className="section-content-padding section-container border-x py-24 md:py-32 section-content-padding px-6 w-full">
        <div className="text-center mb-12 space-y-4 max-w-3xl mx-auto">
          <h1 className="section-heading">Simple, transparent pricing</h1>
          <p className="section-subheadline text-lg">
            Everything you need to automate your customer support and boost
            revenue.
          </p>
        </div>

        <div className="flex items-center justify-center mb-12">
          <div className="bg-secondary/50 p-1 rounded-full flex relative">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 z-10",
                billingCycle === "monthly"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annually")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 z-10 flex items-center gap-2",
                billingCycle === "annually"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Annually
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                SAVE ~20%
              </span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="w-full bg-card rounded-3xl border shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-border bg-card/50 relative">
                <div className="mt-8 mb-6 space-y-2">
                  <div className="h-8 w-32 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
                  <div className="h-5 w-40 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
                </div>

                <div className="flex items-end gap-2 mb-2">
                  <div className="h-16 w-32 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
                  <div className="h-6 w-20 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md animate-[shimmer_2s_infinite] bg-[length:200%_100%] mb-1.5" />
                  <div className="h-5 w-16 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md animate-[shimmer_2s_infinite] bg-[length:200%_100%] mb-1.5 ml-1" />
                </div>

                <div className="h-4 w-28 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md animate-[shimmer_2s_infinite] bg-[length:200%_100%] mb-8" />

                <div className="h-12 w-full bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />

                <div className="h-3 w-48 mx-auto mt-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
              </div>

              <div className="lg:col-span-7 p-8 md:p-12 bg-background/50">
                <div className="h-6 w-36 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md animate-[shimmer_2s_infinite] bg-[length:200%_100%] mb-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 h-4 w-4 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full animate-[shimmer_2s_infinite] bg-[length:200%_100%] shrink-0" />
                      <div className="h-4 w-full bg-gradient-to-r from-muted via-muted/50 to-muted rounded-md animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full  bg-card rounded-3xl border shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-border bg-card/50 relative">
                <div className="mt-8 mb-6">
                  <h3 className="text-2xl font-bold mb-1">All in One</h3>
                  <p className="text-muted-foreground">Everything included.</p>
                </div>

                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl md:text-6xl font-bold tracking-tight leading-none">
                    {currencySymbol}
                    {price}
                  </span>
                  {originalPrice && (
                    <span className="text-xl text-muted-foreground line-through decoration-muted-foreground/50 mb-1.5">
                      {currencySymbol}
                      {originalPrice}
                    </span>
                  )}
                  <span className="text-muted-foreground font-medium mb-1.5 ml-1">
                    /month
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-8">
                  {billingCycle === "annually"
                    ? "Billed annually"
                    : "Billed monthly"}
                </p>

                <Button
                  size="lg"
                  className="w-full text-lg h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:scale-[1.02]"
                  onClick={handleCheckout}
                >
                  Get Started
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Cancel anytime. No questions asked!
                </p>
              </div>

              <div className="lg:col-span-7 p-8 md:p-12 bg-background/50">
                <h4 className="text-lg font-semibold mb-6">
                  What&apos;s included:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 bg-primary/10 rounded-full p-0.5 shrink-0">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground leading-snug">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-16 text-muted-foreground text-sm">
          Need more than 10k messages?{" "}
          <button
            onClick={openDemoModal}
            className="text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer"
          >
            Book a meeting
          </button>{" "}
          with our engineering team.
        </div>
      </div>
      <PricingFaq />
    </>
  );
};
