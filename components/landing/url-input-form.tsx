"use client";

import { normalizeDomain } from "@/lib/utils";
import { ArrowRight, Globe } from "lucide-react";
import React from "react";

interface UrlInputFormProps {
  url: string;
  setUrl: (url: string) => void;
  error: string;
  setError: (error: string) => void;
  onSubmit: (e: React.FormEvent, source: "hero" | "floating") => void;
  className?: string; // Allow passing extra classes like for the floating container
  compactOnMobile?: boolean;
  onCompactClick?: (source: "floating") => void;
}

export const UrlInputForm = ({
  url,
  setUrl,
  error,
  setError,
  onSubmit,
  className = "",
  compactOnMobile = false,
  onCompactClick,
}: UrlInputFormProps) => {
  const buttonBaseClassName =
    "h-11 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2";

  return (
    <div
      className={`w-full max-w-lg px-4 relative z-10 ${
        compactOnMobile ? "w-max max-w-none sm:w-full sm:max-w-lg" : ""
      } ${className}`}
    >
      <form
        onSubmit={(e) => onSubmit(e, compactOnMobile ? "floating" : "hero")}
        className="relative group w-full"
      >
        <div className="relative">
          <div
            className={`absolute inset-y-0 left-3 items-center pointer-events-none ${
              compactOnMobile ? "hidden sm:flex" : "flex"
            }`}
          >
            <Globe className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary/50 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Enter your website URL"
            className={`w-full h-14 rounded-lg border bg-white pl-10 pr-4 text-base transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:pr-32 ${
              compactOnMobile ? "hidden sm:block" : ""
            }`}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pastedText = e.clipboardData.getData("text");
              const normalized = normalizeDomain(pastedText);
              setUrl(normalized);
              if (error) setError("");
            }}
          />
        </div>

        {compactOnMobile && (
          <button
            type="button"
            className={`${buttonBaseClassName} w-max sm:hidden`}
            onClick={() => onCompactClick?.("floating")}
          >
            Try Free Demo
            <ArrowRight className="size-4" />
          </button>
        )}
        <button
          type="submit"
          className={`${buttonBaseClassName} mt-3 w-full justify-center sm:absolute sm:right-1.5 sm:top-1.5 sm:mt-0 sm:w-auto ${
            compactOnMobile ? "hidden sm:flex" : ""
          }`}
        >
          Try Free Demo
          <ArrowRight className="size-4" />
        </button>
      </form>

      {error && (
        <p className="text-destructive text-sm mt-2 text-left px-4 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};
