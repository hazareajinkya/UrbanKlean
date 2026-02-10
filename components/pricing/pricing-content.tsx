"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/clients/firebase";
import { Button } from "@/components/ui/button";
import { Check, Info, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoModal } from "../landing/demo-modal";
import { useGeo } from "@/lib/hooks/geo/use-geo";
import { PricingFaq } from "./pricing-faq";
import { CREDIT_ADDON, LIFETIME_PLAN, PLANS } from "@/lib/plans";
import { usePolarCheckout } from "@/lib/hooks/use-polar-checkout";
import { useRazorpayCheckout } from "@/lib/hooks/use-razorpay-checkout";
import { usePolarCreditCheckout } from "@/lib/hooks/use-polar-credit-checkout";
import { useRazorpayCreditCheckout } from "@/lib/hooks/use-razorpay-credit-checkout";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/user/use-user";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const fetchLifetimeSpotsLeft = async (): Promise<number> => {
  const snap = await getDoc(doc(db, "lifetime", "default"));
  const count = snap.data()?.count ?? null;
  console.log("count: ", count);

  return count == null ? 1 : Math.max(1, 10 - count);
};

export const PricingContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasProcessedParamsRef = useRef(false);

  const planIdParam = searchParams.get("plan");
  const tierParam = searchParams.get("tier");
  const billingCycleParam = searchParams.get("billingCycle");

  const hasPendingCheckoutParams = !!(
    planIdParam &&
    tierParam &&
    billingCycleParam
  );

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "annually",
  );
  const { openDemoModal } = useDemoModal();
  const { isIndia, isLoading: isGeoLoading } = useGeo();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { initiateCheckout: initiatePolarCheckout, isLoading: isPolarLoading } =
    usePolarCheckout();
  const {
    initiateCheckout: initiateRazorpayCheckout,
    isLoading: isRazorpayLoading,
  } = useRazorpayCheckout();
  const {
    initiateCheckout: initiatePolarCreditCheckout,
    isLoading: isPolarCreditLoading,
  } = usePolarCreditCheckout();
  const {
    initiateCheckout: initiateRazorpayCreditCheckout,
    isLoading: isRazorpayCreditLoading,
  } = useRazorpayCreditCheckout();

  const [creditQuantity, setCreditQuantity] = useState(1);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(
    hasPendingCheckoutParams,
  );
  const [activeCheckoutType, setActiveCheckoutType] = useState<
    "subscription" | "lifetime" | null
  >(null);

  const hasActiveSubscription = useMemo(() => {
    const subscriptionStatus = user?.subscription?.status;
    return (
      subscriptionStatus &&
      subscriptionStatus !== "canceled" &&
      subscriptionStatus !== "past_due"
    );
  }, [user?.subscription?.status]);

  const hasLifetimeAccess = useMemo(() => {
    return user?.subscription?.planId === "lifetime";
  }, [user?.subscription?.planId]);

  useEffect(() => {
    if (hasProcessedParamsRef.current) {
      return;
    }
    if (!planIdParam || !tierParam || !billingCycleParam) {
      return;
    }
    if (isUserLoading) {
      return;
    }
    if (!user?.email) {
      return;
    }
    if (isGeoLoading) {
      return;
    }

    setIsCheckoutLoading(true);
    hasProcessedParamsRef.current = true;

    const isLifetimeCheckout =
      planIdParam === "lifetime" || billingCycleParam === "lifetime";
    if (!isLifetimeCheckout) {
      setBillingCycle(billingCycleParam as "monthly" | "annually");
    }

    router.replace("/pricing", { scroll: false });

    setTimeout(() => {
      if (isLifetimeCheckout) {
        handleLifetimeCheckout();
        setIsCheckoutLoading(false);
        return;
      }
      handleCheckout();
      setIsCheckoutLoading(false);
    }, 100);
  }, [
    planIdParam,
    tierParam,
    billingCycleParam,
    isUserLoading,
    user?.email,
    isGeoLoading,
    isIndia,
    router,
    initiateRazorpayCheckout,
    initiatePolarCheckout,
  ]);

  const handleCheckout = () => {
    if (process.env.NEXT_PUBLIC_ENV === "production") {
      openDemoModal();
      return;
    }

    setActiveCheckoutType("subscription");
    const plan = PLANS.all_in_one;

    const targetTier = plan.tiers.find((t) => t.billingCycle === billingCycle);

    if (targetTier) {
      if (isIndia) {
        initiateRazorpayCheckout({
          planId: "all_in_one" as any,
          tier: targetTier.messages,
          billingCycle,
        });
      } else {
        initiatePolarCheckout({
          planId: "all_in_one" as any,
          tier: targetTier.messages,
          billingCycle,
        });
      }
    }
  };

  const currencySymbol = isIndia ? "₹" : "$";
  const plan = PLANS.all_in_one;
  const monthlyTier = plan.tiers.find((t) => t.billingCycle === "monthly");
  const annualTier = plan.tiers.find((t) => t.billingCycle === "annually");
  const monthlyPrice = isIndia
    ? monthlyTier?.price.inr
    : monthlyTier?.price.usd;
  const annualPrice = isIndia ? annualTier?.price.inr : annualTier?.price.usd;
  const savingsPercent =
    monthlyPrice && annualPrice
      ? Math.max(0, Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100))
      : null;
  const activeMonthlyPrice =
    billingCycle === "annually" && annualPrice
      ? Math.round(annualPrice / 12)
      : monthlyPrice;
  const price = (activeMonthlyPrice ?? 0).toLocaleString(
    isIndia ? "en-IN" : "en-US",
  );
  const originalPrice =
    billingCycle === "annually" && monthlyPrice
      ? monthlyPrice.toLocaleString(isIndia ? "en-IN" : "en-US")
      : null;

  const features = plan.features;

  const creditPrice = isIndia ? CREDIT_ADDON.price.inr : CREDIT_ADDON.price.usd;
  const creditTotalPrice = creditQuantity * creditPrice;
  const creditTotalPriceFormatted = isIndia
    ? creditTotalPrice.toLocaleString("en-IN")
    : creditTotalPrice.toLocaleString("en-US");

  const handleCreditPurchase = () => {
    if (process.env.NEXT_PUBLIC_ENV === "production") {
      openDemoModal();
      return;
    }

    if (isIndia) {
      initiateRazorpayCreditCheckout(creditQuantity);
    } else {
      initiatePolarCreditCheckout(creditQuantity);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 100) {
      setCreditQuantity(newQuantity);
    }
  };

  const isCreditLoading = isPolarCreditLoading || isRazorpayCreditLoading;
  const isPaymentLoading = isPolarLoading || isRazorpayLoading;
  const isSubscriptionCheckoutLoading =
    (isPaymentLoading && activeCheckoutType === "subscription") ||
    isCheckoutLoading;
  const isLifetimeCheckoutLoading =
    isPaymentLoading && activeCheckoutType === "lifetime";

  const mainPrice = LIFETIME_PLAN.tiers[0].price;

  const { data: spotsLeft = 1 } = useQuery({
    queryKey: ["lifetime", "spots"],
    queryFn: fetchLifetimeSpotsLeft,
  });
  const lifetimeClaimed = 10 - spotsLeft;

  const currentLifetimePriceValue = useMemo(() => {
    const main = isIndia ? mainPrice.inr : mainPrice.usd;
    if (lifetimeClaimed < 3) return Math.round(main * 0.5);
    if (lifetimeClaimed < 7) return Math.round(main * 0.7);
    return main;
  }, [isIndia, mainPrice.inr, mainPrice.usd, lifetimeClaimed]);
  const currentTierPrice = currentLifetimePriceValue.toLocaleString(
    isIndia ? "en-IN" : "en-US",
  );

  const lifetimeStepperPrices = useMemo(() => {
    const main = isIndia ? mainPrice.inr : mainPrice.usd;
    const fmt = (n: number) => n.toLocaleString(isIndia ? "en-IN" : "en-US");
    return {
      till3: fmt(Math.round(main * 0.5)),
      till7: fmt(Math.round(main * 0.7)),
      till10: fmt(main),
    };
  }, [isIndia, mainPrice.inr, mainPrice.usd]);

  const currentPillPositionPercent =
    lifetimeClaimed < 3 ? 30 : lifetimeClaimed < 7 ? 70 : 100;

  const spotsLeftInTier =
    lifetimeClaimed < 3
      ? 3 - lifetimeClaimed
      : lifetimeClaimed < 7
        ? 7 - lifetimeClaimed
        : 10 - lifetimeClaimed;
  const nextTierPrice =
    lifetimeClaimed < 3
      ? lifetimeStepperPrices.till7
      : lifetimeClaimed < 7
        ? lifetimeStepperPrices.till10
        : null;

  const handleLifetimeCheckout = () => {
    if (process.env.NEXT_PUBLIC_ENV === "production") {
      openDemoModal();
      return;
    }
    setActiveCheckoutType("lifetime");
    if (isIndia) {
      initiateRazorpayCheckout({
        planId: "lifetime",
        tier: LIFETIME_PLAN.tiers[0].messages,
        billingCycle: "lifetime",
        lifetimePrice: currentLifetimePriceValue,
      });
    } else {
      initiatePolarCheckout({
        planId: "lifetime",
        tier: LIFETIME_PLAN.tiers[0].messages,
        billingCycle: "lifetime",
        lifetimePrice: currentLifetimePriceValue,
      });
    }
  };

  return (
    <motion.div
      key="pricing"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className=""
    >
      <div
        id="pricing-plans"
        className="section-content-padding section-container border-x py-24 md:py-32 section-content-padding px-6 w-full"
      >
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="section-heading">
            Start for Free, Choose your plan later
          </h1>
          <p className="section-subheadline text-lg">
            Everything you need to automate your customer support and boost
            revenue.
          </p>
        </div>

        <div className="flex items-center justify-center mb-12">
          <div className="relative flex items-center bg-secondary/40 p-1.5 rounded-full border border-border/50">
            <button
              onClick={() => setBillingCycle("monthly")}
              className="cursor-pointer relative px-8 py-2.5 rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <span
                className={cn(
                  "relative z-10 transition-colors duration-200",
                  billingCycle === "monthly"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Monthly
              </span>
              {billingCycle === "monthly" && (
                <motion.div
                  layoutId="active-billing-pill"
                  className="absolute inset-0 bg-background rounded-full shadow-sm border border-border/50"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setBillingCycle("annually")}
              className="cursor-pointer relative px-8 py-2.5 rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/20 flex items-center gap-2"
            >
              <span
                className={cn(
                  "relative z-10 transition-colors duration-200",
                  billingCycle === "annually"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Annually
              </span>
              {savingsPercent !== null && (
                <span className="relative z-10 text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  SAVE {savingsPercent}%
                </span>
              )}
              {billingCycle === "annually" && (
                <motion.div
                  layoutId="active-billing-pill"
                  className="absolute inset-0 bg-background rounded-full shadow-sm border border-border/50"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>

        <div className="w-full  bg-card rounded-3xl border shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-5 p-6 md:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-border bg-card/50 relative">
              <div className="mt-8 mb-6">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-2xl font-medium">All in One</h3>
                    <p className="text-muted-foreground">
                      Everything included.
                    </p>
                  </div>
                  <span className="ml-auto rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                    14 days free trial
                  </span>
                </div>
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
                disabled={isSubscriptionCheckoutLoading}
              >
                {isSubscriptionCheckoutLoading ? (
                  <>
                    <Loader className=" h-5 w-5 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Get Started for Free"
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground mt-4">
                <span className="font-semibold">Cancel anytime.</span> No
                questions asked!
              </p>
            </div>

            <div className="lg:col-span-7 p-4 md:p-6 bg-background/50">
              <h4 className="text-lg font-medium mb-6">What's included:</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {features.map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-3 py-2.5 px-3 group rounded-xl hover:bg-muted/80 transition-colors cursor-default"
                  >
                    <span className="shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-green-800/30 to-green-800/10 border border-green-800/45 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-800" />
                    </span>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
                      {feature.label}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label={feature.tooltip}
                          className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6}>
                        {feature.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lifetime Deal Section - Premium Design */}
        <div id="lifetime" className="mt-20">
          <div className="text-center mb-8 ">
            <h2 className="section-heading">Lifetime Deal</h2>
            <p className="section-subheadline">
              One-time payment. Own MagicalCX forever.
            </p>
          </div>

          <div className="relative w-full overflow-hidden group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-orange-500/20 rounded-[40px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative w-full rounded-[32px] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-white/[0.08] overflow-hidden">
              {/* Animated shimmer border effect */}
              <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
                <div
                  className="absolute inset-[-2px] rounded-[34px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, transparent 40%, rgba(251, 191, 36, 0.4) 50%, transparent 60%, transparent 100%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s ease-in-out infinite",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                  }}
                />
              </div>
              {/* Top edge shimmer glow */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, transparent 20%, rgba(249, 115, 22, 0.6) 45%, rgba(251, 191, 36, 0.8) 50%, rgba(249, 115, 22, 0.6) 55%, transparent 80%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 3s ease-in-out infinite",
                }}
              />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />

              <div className="relative">
                <div className="px-8 md:px-12 lg:px-16 pt-10 md:pt-14 pb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div>
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/20 backdrop-blur-sm mb-6">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-orange-400 to-amber-400"></span>
                      </span>
                      <span className="text-[11px] font-semibold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent uppercase tracking-[0.2em]">
                        Only {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left
                      </span>
                    </div>
                    <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-3">
                      Lifetime Deal
                    </h3>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
                      One-time payment for lifetime access to MagicalCX. No
                      recurring fees.
                    </p>
                  </div>
                  <div className="shrink-0 w-full lg:max-w-[280px] xl:max-w-[320px]">
                    <div className="relative h-2.5 w-full bg-zinc-800 rounded-full mb-4">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-300"
                        style={{
                          width: `${(lifetimeClaimed / 10) * 100}%`,
                          background:
                            "linear-gradient(90deg, #ea580c, #f59e0b, #fbbf24)",
                          boxShadow: "0 0 16px rgba(249, 115, 22, 0.5)",
                        }}
                      />
                      <div
                        className="absolute -translate-x-1/2 -top-10"
                        style={{ left: `${currentPillPositionPercent}%` }}
                      >
                        <div
                          className="relative bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
                          style={{ backgroundColor: "#f97316" }}
                        >
                          {currencySymbol}
                          {currentTierPrice}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                            <div
                              className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
                              style={{ borderTopColor: "#f97316" }}
                            />
                          </div>
                        </div>
                      </div>
                      {lifetimeClaimed < 3 && (
                        <div
                          className="absolute -translate-x-1/2 -top-10"
                          style={{ left: "70%" }}
                        >
                          <div className="relative bg-zinc-700/90 text-zinc-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-600 whitespace-nowrap">
                            {currencySymbol}
                            {lifetimeStepperPrices.till7}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-600" />
                            </div>
                          </div>
                        </div>
                      )}
                      {lifetimeClaimed < 7 && (
                        <div
                          className="absolute -translate-x-1/2 -top-10"
                          style={{ left: "100%" }}
                        >
                          <div className="relative bg-zinc-700/90 text-zinc-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-600 whitespace-nowrap">
                            {currencySymbol}
                            {lifetimeStepperPrices.till10}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-600" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">
                      Only{" "}
                      <span className="text-white font-bold">
                        {spotsLeftInTier}
                      </span>{" "}
                      spot{spotsLeftInTier === 1 ? "" : "s"} for{" "}
                      {currencySymbol}
                      {currentTierPrice}
                      {nextTierPrice != null ? (
                        <>
                          , thereafter {currencySymbol}
                          {nextTierPrice}
                        </>
                      ) : (
                        ""
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-5 px-8 md:px-12 lg:px-16 pb-10 md:pb-14 lg:border-r border-white/[0.04]">
                    <div className="mb-8">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                          {currencySymbol}
                          {currentTierPrice}
                        </span>
                        <span className="text-base text-zinc-500 font-medium">
                          one-time
                        </span>
                      </div>
                      <p className="text-zinc-500 text-sm">
                        Pay once. Use forever.
                      </p>
                    </div>

                    {/* CTA Button */}
                    <div className="relative group/btn-wrapper">
                      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 rounded-2xl blur-lg opacity-40 group-hover/btn-wrapper:opacity-70 transition-opacity duration-500 animate-pulse" />

                      <Button
                        size="lg"
                        className="relative w-full text-base h-14 rounded-xl border-0 font-bold overflow-hidden group/btn transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                        style={{
                          background:
                            "linear-gradient(135deg, #ea580c 0%, #f59e0b 40%, #fbbf24 70%, #fcd34d 100%)",
                          boxShadow:
                            "0 8px 32px rgba(249, 115, 22, 0.4), inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.1)",
                        }}
                        onClick={handleLifetimeCheckout}
                        disabled={
                          hasLifetimeAccess ||
                          hasActiveSubscription ||
                          isLifetimeCheckoutLoading
                        }
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out" />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                        <span className="relative z-10 flex items-center justify-center gap-2 text-zinc-900">
                          {isLifetimeCheckoutLoading ? (
                            <>
                              <Loader className="h-5 w-5 animate-spin" />
                              <span>Securing your spot...</span>
                            </>
                          ) : hasLifetimeAccess ? (
                            <>
                              <Check className="h-5 w-5" />
                              <span>You Own This Forever</span>
                            </>
                          ) : hasActiveSubscription ? (
                            <span>Already Subscribed</span>
                          ) : (
                            <>
                              <span>Get Lifetime Access</span>
                            </>
                          )}
                        </span>
                      </Button>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-4">
                      <p className="text-[11px] text-zinc-500">
                        Only available for new customers
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-7 px-4 pb-6">
                    <h4 className="text-base font-semibold text-white mb-6 flex items-center gap-3">
                      <span>Everything included</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {LIFETIME_PLAN.features.map((feature) => (
                        <div
                          key={feature.label}
                          className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/[0.02] transition-colors group/item cursor-default"
                        >
                          <span className="shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center group-hover/item:border-orange-400/50 transition-colors">
                            <Check
                              className="w-3 h-3 text-orange-400"
                              strokeWidth={3}
                            />
                          </span>
                          <span className="text-sm text-zinc-400 group-hover/item:text-zinc-300 transition-colors">
                            {feature.label}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                aria-label={feature.tooltip}
                                className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 hover:text-zinc-300 transition-colors"
                              >
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" sideOffset={6}>
                              {feature.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="extra-credits" className="mt-28">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-2xl font-medium">Need Extra Credits?</h2>
            <p className="text-muted-foreground">
              Purchase additional message credits anytime. One-time purchase, no
              subscription required.
            </p>
          </div>

          <div className="mx-auto w-full ">
            <div className="rounded-2xl border bg-card px-4 md:px-5 py-6 shadow-sm transition-colors">
              <div className="flex w-full flex-col gap-4 md:flex-row items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <span className="text-xs font-medium text-muted-foreground">
                      1k
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-medium">Extra credits</h3>
                    <p className="text-sm text-muted-foreground">
                      Add extra credits to your account.
                    </p>
                    {!hasActiveSubscription && (
                      <p className="mt-2 text-xs text-muted-foreground italic">
                        Subscribe to a plan to purchase credits
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                  <div className="text-sm text-muted-foreground">
                    <span className="text-base font-medium text-foreground">
                      {currencySymbol}
                      {creditTotalPriceFormatted}
                    </span>
                    <span className="ml-1">
                      for{" "}
                      <span className="text-foreground font-medium">
                        {(
                          creditQuantity * CREDIT_ADDON.messagesPerUnit
                        ).toLocaleString()}{" "}
                        message credits
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => handleQuantityChange(creditQuantity - 1)}
                      disabled={
                        creditQuantity <= 1 ||
                        isCreditLoading ||
                        !hasActiveSubscription
                      }
                      aria-label="Decrease credit quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={creditQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        handleQuantityChange(val);
                      }}
                      className="h-9 w-16 text-center text-sm font-medium"
                      disabled={isCreditLoading || !hasActiveSubscription}
                      aria-label="Credit quantity"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => handleQuantityChange(creditQuantity + 1)}
                      disabled={
                        creditQuantity >= 100 ||
                        isCreditLoading ||
                        !hasActiveSubscription
                      }
                      aria-label="Increase credit quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      className="h-9 rounded-full bg-primary px-4 text-sm text-primary-foreground transition-all hover:bg-primary/90"
                      onClick={handleCreditPurchase}
                      disabled={isCreditLoading || !hasActiveSubscription}
                    >
                      {isCreditLoading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Adding credits
                        </>
                      ) : (
                        "Add Credits"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PricingFaq />
    </motion.div>
  );
};
