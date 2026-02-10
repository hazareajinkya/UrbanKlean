"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Star, CreditCard, ShieldCheck } from "lucide-react";

import { normalizeDomain, validateDomain } from "@/lib/utils";
import datafastService from "@/lib/services/datafast-service";
import { UrlInputForm } from "./url-input-form";

export const HeroSection = () => {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [showFloatingInput, setShowFloatingInput] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    router.prefetch("/onboarding");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setShowFloatingInput(true);
        } else {
          setShowFloatingInput(false);
        }
      },
      {
        threshold: 0,
        rootMargin: "-20px 0px 0px 0px",
      }
    );

    if (inputRef.current) {
      observer.observe(inputRef.current);
    }

    return () => observer.disconnect();
  }, [router]);

  const handleSubmit = (e: React.FormEvent, source: "hero" | "floating") => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a website URL");
      datafastService.trackGoal("onboarding_validation_failed", {
        source,
        reason: "empty_domain",
      });
      return;
    }

    const normalized = normalizeDomain(url);
    if (!validateDomain(normalized)) {
      setError("Please enter a valid domain");
      datafastService.trackGoal("onboarding_validation_failed", {
        source,
        reason: "invalid_domain",
      });
      return;
    }

    datafastService.trackGoal(
      source === "floating" ? "floating_cta_clicked" : "hero_cta_clicked",
    );
    datafastService.trackGoal("onboarding_started", { source });
    setError("");
    setUrl(`https://${normalized}`);
    router.push(`/onboarding?url=${normalized}`);
  };
  const handleCompactClick = (_source: "floating") => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const inputEl = inputRef.current?.querySelector("input");
    inputEl?.focus();
  };

  return (
    <div className="section-container border-x flex flex-col items-center justify-center w-full pt-20 sm:pt-16 md:pt-24 pb-5 md:pb-10 gap-6 sm:gap-8 md:gap-10">
      <div className="flex flex-col items-center text-center mt-4 sm:mt-6 md:mt-8">
        <h1 className="text-3xl font-playfair font-light leading-normal md:text-5xl mb-4 px-4 ">
          AI Customer Support that delivers <br className="hidden sm:block" />
          faster resolutions and <span className="">feels human</span>
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto px-4">
          {/* The world's first & only AI that responds with empathy, never makes
          people repeat themselves, and finds revenue opportunities
          automatically across your web chat, email, WhatsApp, Instagram, and
          Messenger. */}
          {/* The world's first & only omnichannel AI Agent that responds with
          empathy, remembers everything, and finds revenue opportunities
          automatically */}
          {/* The world's first & only omnichannel AI Agent that responds with
          empathy, remembers everything, and finds revenue opportunities
          automatically */}
          {/* AI agents that remember, respond with empathy, speak HumanlyClear™ and
          find revenue opportunities across every channel—web chat, email,
          WhatsApp, Instagram, Messenger. */}
          {/* AI agents with memory and empathy delivering HumanlyClear™ responses.
          MagicalCX AI find revenue opportunities for your business across web
          chat, email, WhatsApp, Instagram, and Messenger. */}
          AI agents that remember every conversation, respond with empathy, and
          speak HumanlyClear™ while creating revenue opportunities across web
          chat, email, WhatsApp, Instagram, and Messenger
        </p>

        <div ref={inputRef} className="w-full">
          <UrlInputForm
            url={url}
            setUrl={setUrl}
            error={error}
            setError={setError}
            onSubmit={handleSubmit}
            className="mt-8 !max-w-lg mx-auto"
          />
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground">4.9/5</span>{" "}
              Customer rating
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-foreground">99.9%</span> Uptime
              SLA
            </span>
          </div>
        </div>
      </div>

      <div
        className="relative flex items-center aspect-[1.58] justify-center w-full animate-fade-in p-4 md:p-6"
        style={{
          background: "linear-gradient(0deg, #f7fafc 0%, #e5ecec 100%)",
        }}
        aria-label="Customer support dashboard preview background"
        tabIndex={-1}
      >
        <iframe
          // src="https://player.mux.com/h701pwXlrvWkXBSD5fq021e43bQzLjUHZ5KKTpjm55ywU?accent-color=%23050505"
          // src="https://player.mux.com/7oVyNTLKAPKkOemlE1Xs9Z01Btawr00eY9DJlESMbnj9Q?metadata-video-title=MagicalCX+Intro+Video&video-title="
          src="https://player.mux.com/3x020001rrtgzTCZmbUIeOjunqmpTtvAaARAygoPECdVbA?metadata-video-title=MagicalCX+Intro"
          style={{ width: "100%", border: "none", aspectRatio: "16/9" }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          className="rounded-xl shadow-l"
        ></iframe>
      </div>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showFloatingInput && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="fixed bottom-6 left-4 -translate-x-0 z-[100] w-max sm:w-[90%] sm:max-w-lg sm:left-1/2 sm:-translate-x-1/2"
              >
                <UrlInputForm
                  url={url}
                  setUrl={setUrl}
                  error={error}
                  setError={setError}
                  onSubmit={handleSubmit}
                  compactOnMobile
                  onCompactClick={handleCompactClick}
                  className="shadow-2xl backdrop-blur-md w-full !px-0"
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
