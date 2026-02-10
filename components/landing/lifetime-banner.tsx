"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { db } from "@/lib/clients/firebase";
import { useGeo } from "@/lib/hooks/geo/use-geo";
import { LIFETIME_PLAN } from "@/lib/plans";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "magicalcx-lifetime-banner-dismissed";
const fetchLifetimeSpotsLeft = async (): Promise<number> => {
  const snap = await getDoc(doc(db, "lifetime", "default"));
  const count = snap.data()?.count ?? null;
  return count == null ? 1 : Math.max(1, 10 - count);
};

export const LifetimeBanner = ({
  onVisibilityChange,
  whyRefProgress,
  ctaRefProgress,
}: {
  onVisibilityChange?: (visible: boolean) => void;
  whyRefProgress?: MotionValue<number>;
  ctaRefProgress?: MotionValue<number>;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isInside, setIsInside] = useState(false);
  const { isIndia, isLoading: isGeoLoading } = useGeo();
  const { data: spotsLeft, isLoading: isSpotsLoading } = useQuery({
    queryKey: ["lifetime", "spots"],
    queryFn: fetchLifetimeSpotsLeft,
  });
  const hasLoadedDetails =
    !isGeoLoading && !isSpotsLoading && spotsLeft != null;
  const safeSpotsLeft = spotsLeft ?? 1;
  const fallback = useMotionValue(0);
  const whyProgress = whyRefProgress ?? fallback;
  const ctaProgress = ctaRefProgress ?? fallback;
  const lifetimeClaimed = 10 - safeSpotsLeft;
  const mainPrice = LIFETIME_PLAN.tiers[0].price;
  const currentLifetimePriceValue =
    lifetimeClaimed < 3
      ? Math.round((isIndia ? mainPrice.inr : mainPrice.usd) * 0.5)
      : lifetimeClaimed < 7
        ? Math.round((isIndia ? mainPrice.inr : mainPrice.usd) * 0.7)
        : isIndia
          ? mainPrice.inr
          : mainPrice.usd;
  const currentTierPrice = currentLifetimePriceValue.toLocaleString(
    isIndia ? "en-IN" : "en-US",
  );
  const spotsLeftInTier =
    lifetimeClaimed < 3
      ? 3 - lifetimeClaimed
      : lifetimeClaimed < 7
        ? 7 - lifetimeClaimed
        : 10 - lifetimeClaimed;
  const nextTierPriceValue =
    lifetimeClaimed < 3
      ? Math.round((isIndia ? mainPrice.inr : mainPrice.usd) * 0.7)
      : lifetimeClaimed < 7
        ? isIndia
          ? mainPrice.inr
          : mainPrice.usd
        : null;
  const nextTierPrice =
    nextTierPriceValue == null
      ? null
      : nextTierPriceValue.toLocaleString(isIndia ? "en-IN" : "en-US");
  const currencySymbol = isIndia ? "₹" : "$";

  const updateInside = (whyV: number, ctaV: number) => {
    if (!whyRefProgress || !ctaRefProgress) return;
    const inside = (whyV > 0 && whyV < 0.99) || (ctaV > 0 && ctaV < 0.99);
    setIsInside(inside);
  };
  useMotionValueEvent(whyProgress, "change", (v) =>
    updateInside(v, ctaProgress.get()),
  );
  useMotionValueEvent(ctaProgress, "change", (v) =>
    updateInside(whyProgress.get(), v),
  );
  useEffect(() => {
    if (whyRefProgress && ctaRefProgress)
      updateInside(whyProgress.get(), ctaProgress.get());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const visible = !sessionStorage.getItem(STORAGE_KEY);
    setIsVisible(visible);
  }, []);
  useEffect(() => {
    onVisibilityChange?.(isVisible && hasLoadedDetails);
  }, [hasLoadedDetails, isVisible, onVisibilityChange]);

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    onVisibilityChange?.(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") handleDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && hasLoadedDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "overflow-hidden bg-black border-b border-white/10 transition-colors duration-300",
            isInside && "dark",
          )}
        >
          <div className="section-container relative px-4 py-2.5 text-sm text-white">
            <div className="flex flex-col items-start gap-1 pr-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-3 sm:gap-y-1 sm:pr-0">
              <span className="text-left sm:text-center">
                🔥 Lifetime Deal: {currencySymbol}
                {currentTierPrice} one-time
              </span>
              <span className="hidden text-white/50 sm:inline">|</span>
              <span className="text-left sm:text-inherit">
                Only {spotsLeftInTier} spot{spotsLeftInTier === 1 ? "" : "s"} at
                this price
                {nextTierPrice
                  ? `, then ${currencySymbol}${nextTierPrice}`
                  : ""}
                . No recurring fees{" "}
                <Link
                  href="/pricing#lifetime"
                  className="ml-1 inline-block font-medium text-amber-400 underline-offset-2 hover:underline"
                >
                  Claim yours
                </Link>
              </span>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              onKeyDown={handleKeyDown}
              aria-label="Dismiss banner"
              tabIndex={0}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
