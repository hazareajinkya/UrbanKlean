"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { normalizeDomain, validateDomain } from "@/lib/utils";
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
      },
    );

    if (inputRef.current) {
      observer.observe(inputRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a website URL");
      return;
    }

    const normalized = normalizeDomain(url);
    if (!validateDomain(normalized)) {
      setError("Please enter a valid domain");
      return;
    }

    setError("");
    setUrl(`https://${normalized}`);
    router.push(`/onboarding?url=${normalized}`);
  };
  const handleCompactClick = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const inputEl = inputRef.current?.querySelector("input");
    inputEl?.focus();
  };

  return (
    <div className="section-container border-x flex flex-col items-center justify-center w-full pt-20 sm:pt-16 md:pt-24 pb-5 md:pb-10 gap-6 sm:gap-8 md:gap-10">
      <div className="flex flex-col items-center text-center mt-8 sm:mt-12 md:mt-18">
        <h1 className="text-3xl leading-normal md:text-4xl mb-4 px-4 ">
          From "How can I help?" to "It's already done."
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto px-4">
          The world's first AI that makes superior customer experience simple
          and scalable, while increasing profits and lowering costs.
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
          src="https://player.mux.com/h701pwXlrvWkXBSD5fq021e43bQzLjUHZ5KKTpjm55ywU?accent-color=%23050505"
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
          document.body,
        )}
    </div>
  );
};
