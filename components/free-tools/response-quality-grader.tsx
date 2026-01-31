"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoModal } from "@/components/landing/demo-modal";
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit2,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/clients/axios-client";
import type { GradeResponseOutput } from "@/app/api/free-tools/grade-response/schema";

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
  "Evaluating clarity and structure...",
  "Measuring empathy and tone...",
  "Checking resolution quality...",
  "Analyzing brand voice...",
  "Calculating overall score...",
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

export const ResponseQualityGrader = () => {
  const { openDemoModal } = useDemoModal();
  const [responseText, setResponseText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gradeResult, setGradeResult] = useState<GradeResponseOutput | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGrade = async () => {
    if (!responseText.trim() || responseText.trim().length < 10) {
      setError("Please enter a support response (at least 10 characters)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGradeResult(null);

    try {
      const response = await apiClient.post<{
        success: boolean;
        data: GradeResponseOutput;
        message: string;
      }>("/api/free-tools/grade-response", {
        responseText: responseText.trim(),
      });

      if (response.data.success) {
        setGradeResult(response.data.data);
      } else {
        setError(response.data.message || "Failed to grade response");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to grade response. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!gradeResult) return;

    const resultText = `Support Response Quality Score: ${gradeResult.overallScore}/100

Categories:
${gradeResult.categories
  .map((cat) => `- ${cat.name}: ${cat.score}/100 - ${cat.feedback}`)
  .join("\n")}

Strengths:
${gradeResult.strengths.map((s) => `• ${s}`).join("\n")}

Suggestions:
${gradeResult.suggestions.map((s) => `• ${s}`).join("\n")}

Grade your support responses: ${typeof window !== "undefined" ? window.location.origin : ""}/free-tools/support-response-quality-grader`;

    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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
                  Evaluating your response quality
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : gradeResult ? (
        <div className="bg-foreground text-background rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10">
          {/* Header with Score */}
          <div className="relative p-8 md:p-12 border-b border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quality Score
                </div>
                <Button
                  onClick={() => {
                    setGradeResult(null);
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
                  <CircularProgress score={gradeResult.overallScore} />
                </div>

                {/* Score Details */}
                <div className="flex-1 text-center md:text-left">
                  <p className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
                    {gradeResult.overallScore >= 80
                      ? "Excellent Response!"
                      : gradeResult.overallScore >= 60
                        ? "Good Start"
                        : "Needs Improvement"}
                  </p>
                  <p className="text-white/60 text-base md:text-lg mb-6">
                    {gradeResult.overallScore >= 80
                      ? "Your response is clear, empathetic, and helpful."
                      : "Review the suggestions below to improve your score."}
                  </p>

                  {/* Original Response Preview */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-h-[200px] overflow-y-auto">
                    <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap line-clamp-4">
                      {responseText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="p-8 md:p-12 space-y-8 bg-black/20">
            {/* Category Breakdowns */}
            <div>
              <h3 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Category Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {gradeResult.categories.map((category) => (
                  <div
                    key={category.name}
                    className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white/90 text-sm">
                        {category.name}
                      </span>
                      <span className="font-bold text-white tabular-nums bg-white/10 px-2 py-1 rounded-md text-sm">
                        {category.score}
                      </span>
                    </div>
                    <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-primary to-primary/60 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {category.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths and Suggestions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              {gradeResult.strengths.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/90 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Key Strengths
                  </div>
                  <div className="grid gap-3">
                    {gradeResult.strengths.map((strength, idx) => (
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
              {gradeResult.suggestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/90 uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Ways to Improve
                  </div>
                  <div className="grid gap-3">
                    {gradeResult.suggestions.map((suggestion, idx) => (
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
                    Copy Grading Results
                  </>
                )}
              </Button>

              {/* CTA */}
              <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 text-center space-y-4">
                <div className="space-y-1">
                  <h4 className="text-white font-semibold">
                    Want consistently great support?
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
        <div className="bg-card/50 backdrop-blur-sm border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm hover:shadow-md transition-all">
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2.5 text-foreground/90">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              Paste your support response
            </Label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
              <Textarea
                value={responseText}
                onChange={(e) => {
                  setResponseText(e.target.value);
                  setError(null);
                  setGradeResult(null);
                }}
                placeholder="Hi there! I understand your frustration with the delayed delivery. I've checked your order and it's currently in transit. Expected delivery is tomorrow by 5 PM. I've also upgraded your shipping to express at no extra cost. Is there anything else I can help with?"
                className="h-[320px] resize-none bg-background/80 border-border/50 text-base leading-relaxed p-6 rounded-xl shadow-inner focus:bg-background transition-all relative z-10 overflow-y-auto"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
              <span>Minimum 10 characters</span>
              <span>
                {responseText.length} characters
                {responseText.length > 0 && responseText.length < 10 && (
                  <span className="text-destructive ml-2 font-medium">
                    (Too short)
                  </span>
                )}
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleGrade}
            disabled={isLoading || responseText.trim().length < 10}
            size="lg"
            className="w-full h-14 rounded-xl text-base font-semibold shadow-lg hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin mr-2" />
                Analyzing Response...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Grade My Response
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
