"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDemoModal } from "@/components/landing/demo-modal";
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  MessageSquare,
  AlertCircle,
  Loader2,
  Heart,
  Shield,
  Zap,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/clients/axios-client";
import type {
  CheckToneOutput,
  ToneGoal,
} from "@/app/api/free-tools/check-tone/schema";

// Tone goal options with icons and descriptions
const TONE_OPTIONS: {
  value: ToneGoal;
  label: string;
  icon: LucideIcon;
  description: string;
}[] = [
    {
      value: "friendly",
      label: "Friendly",
      icon: Heart,
      description: "Warm & approachable",
    },
    {
      value: "professional",
      label: "Professional",
      icon: Shield,
      description: "Formal & polished",
    },
    {
      value: "calm",
      label: "Calm",
      icon: Zap,
      description: "Soothing & reassuring",
    },
    {
      value: "firm",
      label: "Firm",
      icon: Users,
      description: "Direct & assertive",
    },
  ];

// Animated number component
const AnimatedNumber = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = displayValue;
    const end = value;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * ease);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span className={className}>{displayValue}</span>;
};

// Circular Progress Component
const CircularProgress = ({
  score,
  size = 140,
  strokeWidth = 10,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20 transition-colors duration-1000"
        style={{ backgroundColor: getColor(score) }}
      />

      <svg
        width={size}
        height={size}
        className="transform -rotate-90 relative z-10"
        style={{ width: size, height: size }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-white/10"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1500 ease-out drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
        <AnimatedNumber
          value={score}
          className="text-4xl font-bold text-white tracking-tight"
        />
        <span className="text-xs font-medium text-white/50 uppercase tracking-widest mt-1">
          Score
        </span>
      </div>
    </div>
  );
};

// Analyzing Text Component with cycling messages
const ANALYZING_MESSAGES = [
  "Evaluating emotional warmth...",
  "Checking message clarity...",
  "Scanning for risky phrases...",
  "Analyzing tone alignment...",
  "Calculating empathy score...",
];

const AnalyzingText = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % ANALYZING_MESSAGES.length);
        setIsVisible(true);
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p
      className={cn(
        "text-lg font-medium text-foreground transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
      )}
    >
      {ANALYZING_MESSAGES[messageIndex]}
    </p>
  );
};

export const ToneEmpathyChecker = () => {
  const { openDemoModal } = useDemoModal();
  const [messageText, setMessageText] = useState<string>("");
  const [toneGoal, setToneGoal] = useState<ToneGoal>("friendly");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CheckToneOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleAnalyze = async () => {
    if (!messageText.trim() || messageText.trim().length < 10) {
      setError("Please enter a message (at least 10 characters)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post<{
        success: boolean;
        data: CheckToneOutput;
        message: string;
      }>("/api/free-tools/check-tone", {
        messageText: messageText.trim(),
        toneGoal,
      });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.message || "Failed to analyze tone");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to analyze tone. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    const resultText = `Tone & Empathy Analysis Score: ${result.overallScore}/100
Target Tone: ${toneGoal.charAt(0).toUpperCase() + toneGoal.slice(1)}
Tone Match: ${result.toneMatch.score}/100 - ${result.toneMatch.feedback}

Metrics:
${result.metrics.map((m) => `- ${m.name}: ${m.score}/100 - ${m.feedback}`).join("\n")}

${result.riskyPhrases.length > 0 ? `Risky Phrases:\n${result.riskyPhrases.map((r) => `⚠️ "${r.phrase}" - ${r.reason}${r.suggestion ? `\n   Suggestion: ${r.suggestion}` : ""}`).join("\n")}` : "No risky phrases detected!"}

Strengths:
${result.strengths.map((s) => `• ${s}`).join("\n")}

Suggestions:
${result.suggestions.map((s) => `• ${s}`).join("\n")}

Check your message tone: ${typeof window !== "undefined" ? window.location.origin : ""}/free-tools/cx-tone-empathy-checker`;

    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const selectedTone = TONE_OPTIONS.find((t) => t.value === toneGoal);

  return (
    <div className="max-w-7xl mx-auto">
      {isLoading ? (
        <div className="bg-card/50 backdrop-blur-sm border rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="flex flex-col items-center justify-center py-20 space-y-8">
            {/* Simple Loader */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
            </div>

            {/* Status Text */}
            <div className="text-center space-y-3">
              <AnalyzingText />
              <div className="flex justify-center">
                <p className="text-sm text-muted-foreground animate-pulse bg-primary/5 px-3 py-1 rounded-full">
                  Checking {selectedTone?.label.toLowerCase()} tone
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : result ? (
        <div className="bg-foreground text-background rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10">
          {/* Header with Score */}
          <div className="relative p-8 md:p-12 border-b border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                  <Heart className="w-3.5 h-3.5" />
                  Tone Analysis
                </div>
                <Button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                  Try Another
                </Button>
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                {/* Circular Progress */}
                <div className="flex-shrink-0">
                  <CircularProgress score={result.overallScore} />
                </div>

                {/* Score Details */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                    <span className="px-2 py-1 rounded-md bg-white/10 text-white/90 text-xs font-medium capitalize">
                      {toneGoal} Tone
                    </span>
                    <span className="px-2 py-1 rounded-md bg-white/10 text-white/70 text-xs">
                      Match: {result.toneMatch.score}%
                    </span>
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
                    {result.overallScore >= 80
                      ? "Excellent Empathy!"
                      : result.overallScore >= 60
                        ? "Good Start"
                        : "Needs More Warmth"}
                  </p>
                  <p className="text-white/60 text-base md:text-lg mb-6">
                    {result.toneMatch.feedback}
                  </p>

                  {/* Original Message Preview */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-h-[200px] overflow-y-auto">
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap line-clamp-4">
                      {messageText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="p-8 md:p-12 space-y-8 bg-black/20">
            {/* Metric Breakdowns */}
            <div>
              <h3 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Empathy Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.metrics.map((metric) => (
                  <div
                    key={metric.name}
                    className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white/90 text-sm">
                        {metric.name}
                      </span>
                      <span className="font-bold text-white tabular-nums bg-white/10 px-2 py-1 rounded-md text-sm">
                        {metric.score}
                      </span>
                    </div>
                    <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-primary to-primary/60 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {metric.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risky Phrases */}
            {result.riskyPhrases.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Risky Phrases Detected
                </h3>
                <div className="space-y-3">
                  {result.riskyPhrases.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/10 space-y-2"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-white/90 font-medium text-sm">
                            &ldquo;{item.phrase}&rdquo;
                          </p>
                          <p className="text-white/50 text-xs mt-1">
                            {item.reason}
                          </p>
                          {item.suggestion && (
                            <p className="text-green-400/80 text-xs mt-2">
                              <span className="text-white/40">Try: </span>
                              {item.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths and Suggestions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              {result.strengths.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/90 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Key Strengths
                  </div>
                  <div className="grid gap-3">
                    {result.strengths.map((strength, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/10 text-sm text-white/80 hover:bg-green-500/10 transition-colors"
                      >
                        <span className="text-green-400 mt-0.5 shrink-0">
                          •
                        </span>
                        <span className="leading-relaxed">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/90 uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Ways to Improve
                  </div>
                  <div className="grid gap-3">
                    {result.suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-sm text-white/80 hover:bg-amber-500/10 transition-colors"
                      >
                        <span className="text-amber-400 mt-0.5 shrink-0">
                          →
                        </span>
                        <span className="leading-relaxed">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="w-full md:w-auto h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-white hover:border-white/20 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Results Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Analysis Results
                  </>
                )}
              </Button>

              {/* CTA */}
              <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 text-center space-y-4">
                <div className="space-y-1">
                  <h4 className="text-white font-semibold">
                    Empathy-First AI isn&apos;t optional anymore.
                  </h4>
                  <p className="text-white/60 text-xs">
                    AI-powered responses that always score 90+
                  </p>
                </div>
                <Button
                  onClick={openDemoModal}
                  size="lg"
                  className="w-full bg-white text-black hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 font-bold h-11 rounded-xl text-sm shadow-lg"
                >
                  Try MagicalCX Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column - Tone Selector */}
            <div className="lg:col-span-2 bg-[#f5f5f5] dark:bg-card/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="space-y-6">
                {/* Step Badge */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background text-sm font-bold shadow-md">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Choose Tone
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      What style fits your message?
                    </p>
                  </div>
                </div>

                {/* Tone Options - Vertical Stack */}
                <div className="space-y-3">
                  {TONE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = toneGoal === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setToneGoal(option.value)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 focus:outline-none group cursor-pointer active:scale-[0.98]",
                          isSelected
                            ? "bg-foreground"
                            : "bg-background hover:bg-muted/60",
                        )}
                        aria-label={`Select ${option.label} tone`}
                        tabIndex={0}
                      >
                        <div
                          className={cn(
                            "p-3 rounded-xl transition-all duration-200",
                            isSelected
                              ? "bg-background/20 text-background"
                              : "bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <p
                            className={cn(
                              "font-semibold transition-colors",
                              isSelected
                                ? "text-background"
                                : "text-foreground",
                            )}
                          >
                            {option.label}
                          </p>
                          <p
                            className={cn(
                              "text-sm transition-colors",
                              isSelected
                                ? "text-background/70"
                                : "text-muted-foreground",
                            )}
                          >
                            {option.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-background/60" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Message Input */}
            <div className="lg:col-span-3 bg-card/50 backdrop-blur-sm border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
              <div className="flex-1 flex flex-col space-y-5">
                {/* Step Badge */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Paste Your Message
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      We&apos;ll analyze it for empathy and clarity
                    </p>
                  </div>
                </div>

                {/* Textarea */}
                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
                  <Textarea
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      setError(null);
                      setResult(null);
                    }}
                    placeholder="Hi there! I completely understand how frustrating this situation must be for you. Let me look into this right away and find the best solution..."
                    className="h-full min-h-[280px] resize-none bg-background border-border/50 text-base leading-relaxed p-5 rounded-2xl shadow-inner focus:bg-background focus:border-primary/30 transition-all relative z-10"
                  />
                </div>

                {/* Character count and status */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full transition-colors",
                        messageText.length >= 10
                          ? "bg-green-500/10 text-green-600"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {messageText.length >= 10 ? "✓ Ready" : "Min 10 chars"}
                    </span>
                  </div>
                  <span className="text-muted-foreground tabular-nums">
                    {messageText.length} / 5000
                  </span>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-sm font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading || messageText.trim().length < 10}
                  size="lg"
                  className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze Tone & Empathy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
