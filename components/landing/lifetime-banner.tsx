"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "magicalcx-lifetime-banner-dismissed";
const LIFETIME_PRICE = 999;
const SPOTS_LEFT = 47;

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
  const fallback = useMotionValue(0);
  const whyProgress = whyRefProgress ?? fallback;
  const ctaProgress = ctaRefProgress ?? fallback;

  const updateInside = (whyV: number, ctaV: number) => {
    if (!whyRefProgress || !ctaRefProgress) return;
    const inside = (whyV > 0 && whyV < 0.99) || (ctaV > 0 && ctaV < 0.99);
    setIsInside(inside);
  };
  useMotionValueEvent(whyProgress, "change", (v) =>
    updateInside(v, ctaProgress.get())
  );
  useMotionValueEvent(ctaProgress, "change", (v) =>
    updateInside(whyProgress.get(), v)
  );
  useEffect(() => {
    if (whyRefProgress && ctaRefProgress)
      updateInside(whyProgress.get(), ctaProgress.get());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const visible = !sessionStorage.getItem(STORAGE_KEY);
    setIsVisible(visible);
    onVisibilityChange?.(visible);
  }, []);

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
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "overflow-hidden bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 backdrop-blur-md border-b border-amber-500/20 transition-colors duration-300",
            isInside && "dark"
          )}
        >
          <div className="section-container flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm text-foreground">
            <span className="text-center">
              🔥 Lifetime Deal: ${LIFETIME_PRICE} once. No monthly fees. Ever.
            </span>
            <span className="text-muted-foreground">|</span>
            <span>
              {SPOTS_LEFT} spots left at this price →{" "}
              <Link
                href="/pricing#lifetime"
                className="font-medium text-amber-600 underline-offset-2 hover:underline dark:text-amber-400"
              >
                Claim yours
              </Link>
            </span>
            <button
              type="button"
              onClick={handleDismiss}
              onKeyDown={handleKeyDown}
              aria-label="Dismiss banner"
              tabIndex={0}
              className="ml-1 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
