"use client";

import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDemoModal } from "@/components/landing/demo-modal";
import {
  AlertTriangle,
  Clock,
  Shield,
  Users,
  ArrowRight,
  Info,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Industry = "ecommerce" | "saas" | "services" | "retail" | "edtech";
type PolicyStrictness = "lenient" | "moderate" | "strict";
type SupportStyle = "reactive" | "proactive" | "empathetic";

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "saas", label: "SaaS" },
  { value: "services", label: "Services" },
  { value: "retail", label: "Retail" },
  { value: "edtech", label: "EdTech" },
];

const POLICY_OPTIONS: {
  value: PolicyStrictness;
  label: string;
  description: string;
}[] = [
    {
      value: "lenient",
      label: "Lenient",
      description: "Easy refunds, no questions",
    },
    { value: "moderate", label: "Moderate", description: "Standard terms apply" },
    { value: "strict", label: "Strict", description: "Limited refund window" },
  ];

const SUPPORT_STYLES: {
  value: SupportStyle;
  label: string;
  description: string;
}[] = [
    { value: "reactive", label: "Reactive", description: "Wait for issues" },
    { value: "proactive", label: "Proactive", description: "Ahead of problems" },
    {
      value: "empathetic",
      label: "Empathetic",
      description: "Customer-first approach",
    },
  ];

// Base risk by industry
const BASE_RISK: Record<Industry, number> = {
  ecommerce: 15,
  saas: 8,
  services: 12,
  retail: 18,
  edtech: 10,
};

// Risk modifiers
const POLICY_MODIFIER: Record<PolicyStrictness, number> = {
  lenient: 10,
  moderate: 0,
  strict: -5,
};

const SUPPORT_MODIFIER: Record<SupportStyle, number> = {
  reactive: 8,
  proactive: -3,
  empathetic: -10,
};

// Causes and fixes based on factors
const CAUSES_BY_FACTOR = {
  slowResponse: {
    cause: "Slow first response time frustrates customers",
    fix: "Implement AI-powered instant responses",
  },
  lenientPolicy: {
    cause: "Lenient policy attracts opportunistic refund requests",
    fix: "Add verification steps without hurting legitimate claims",
  },
  reactiveSupport: {
    cause: "Reactive support leads to escalated complaints",
    fix: "Set up proactive outreach after purchase",
  },
  industryRisk: {
    cause: "High competition drives buyer's remorse",
    fix: "Strengthen post-purchase engagement",
  },
  noEmpathy: {
    cause: "Lack of empathy in responses triggers refunds",
    fix: "Train agents on empathetic communication",
  },
  expectations: {
    cause: "Misaligned product expectations",
    fix: "Improve product descriptions and demos",
  },
};

// Animated number component
const AnimatedNumber = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const start = displayValue;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * ease;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span className={className}>{displayValue.toFixed(0)}</span>;
};

// Circular Progress Component
const CircularProgress = ({
  score,
  size = 160,
  strokeWidth = 12,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score < 10) return "stroke-green-500";
    if (score < 20) return "stroke-yellow-500";
    if (score < 30) return "stroke-orange-500";
    return "stroke-red-500";
  };

  const getLabel = (score: number) => {
    if (score < 10) return "Low Risk";
    if (score < 20) return "Moderate";
    if (score < 30) return "High";
    return "Critical";
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={cn(
            "transition-all duration-1000 ease-out",
            getColor(score),
          )}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber
          value={score}
          className="text-4xl font-bold text-white"
        />
        <span className="text-lg text-white/80">%</span>
        <span className="text-xs text-white/50 mt-1">{getLabel(score)}</span>
      </div>
    </div>
  );
};

export const RefundRiskPredictor = () => {
  const { openDemoModal } = useDemoModal();
  const [industry, setIndustry] = useState<Industry>("ecommerce");
  const [avgResponseTime, setAvgResponseTime] = useState<number>(15);
  const [policyStrictness, setPolicyStrictness] =
    useState<PolicyStrictness>("moderate");
  const [supportStyle, setSupportStyle] = useState<SupportStyle>("reactive");

  const calculations = useMemo(() => {
    // Base risk from industry
    let riskScore = BASE_RISK[industry];

    // Response time modifier (5min = 0%, 60min = 15%)
    const responseTimeModifier = ((avgResponseTime - 5) / 55) * 15;
    riskScore += responseTimeModifier;

    // Policy modifier
    riskScore += POLICY_MODIFIER[policyStrictness];

    // Support style modifier
    riskScore += SUPPORT_MODIFIER[supportStyle];

    // Clamp between 0 and 50
    riskScore = Math.max(0, Math.min(50, riskScore));

    // Generate causes and fixes
    const causes: { cause: string; fix: string }[] = [];

    if (avgResponseTime > 15) {
      causes.push(CAUSES_BY_FACTOR.slowResponse);
    }
    if (policyStrictness === "lenient") {
      causes.push(CAUSES_BY_FACTOR.lenientPolicy);
    }
    if (supportStyle === "reactive") {
      causes.push(CAUSES_BY_FACTOR.reactiveSupport);
    }
    if (supportStyle !== "empathetic") {
      causes.push(CAUSES_BY_FACTOR.noEmpathy);
    }
    if (BASE_RISK[industry] >= 15) {
      causes.push(CAUSES_BY_FACTOR.industryRisk);
    }
    if (causes.length < 2) {
      causes.push(CAUSES_BY_FACTOR.expectations);
    }

    // Limit to top 3
    const topCauses = causes.slice(0, 3);

    return {
      riskScore: Math.round(riskScore),
      causes: topCauses,
    };
  }, [industry, avgResponseTime, policyStrictness, supportStyle]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-7xl mx-auto">
      {/* Left Column: Inputs */}
      <div className="lg:col-span-7 space-y-10">
        <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-6 md:p-8 space-y-8">
          {/* Industry Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              What industry are you in?
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind.value}
                  onClick={() => setIndustry(ind.value)}
                  className={cn(
                    "relative px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                    industry === ind.value
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border bg-background hover:border-primary/50 hover:bg-muted/50",
                  )}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          {/* Response Time Slider */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Avg. Response Time
              </Label>
              <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1">
                <Input
                  type="number"
                  value={avgResponseTime}
                  onChange={(e) =>
                    setAvgResponseTime(Number(e.target.value) || 5)
                  }
                  className="w-16 h-6 border-none p-0 text-right focus-visible:ring-0"
                  min={5}
                  max={60}
                  step={5}
                />
                <span className="text-sm text-muted-foreground">mins</span>
              </div>
            </div>
            <Slider
              value={[avgResponseTime]}
              min={5}
              max={60}
              step={5}
              onValueChange={(vals) => setAvgResponseTime(vals[0])}
              className="py-4"
            />
          </div>

          {/* Refund Policy Strictness */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Refund Policy Strictness
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {POLICY_OPTIONS.map((policy) => (
                <button
                  key={policy.value}
                  onClick={() => setPolicyStrictness(policy.value)}
                  className={cn(
                    "relative px-4 py-3 rounded-xl border text-left transition-all duration-200",
                    policyStrictness === policy.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:border-primary/50 hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "block text-sm font-medium",
                      policyStrictness === policy.value
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {policy.label}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {policy.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Support Style */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Support Style
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {SUPPORT_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setSupportStyle(style.value)}
                  className={cn(
                    "relative px-4 py-3 rounded-xl border text-left transition-all duration-200",
                    supportStyle === style.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:border-primary/50 hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "block text-sm font-medium",
                      supportStyle === style.value
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {style.label}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {style.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Methodology Note */}
        <div className="bg-muted/30 rounded-xl p-4 flex gap-3 text-sm text-muted-foreground">
          <Info className="w-5 h-5 shrink-0 text-primary/60 mt-0.5" />
          <div className="space-y-2">
            <p>
              <strong>How we calculate:</strong> Base risk varies by industry
              (8-18%). Response time, policy strictness, and support style each
              affect your score.
            </p>
            <p>
              <strong>Reduce risk:</strong> Empathetic, fast support can lower
              refund rates by up to 30%.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Results Dashboard */}
      <div className="lg:col-span-5 relative lg:sticky lg:top-24">
        <div className="bg-foreground text-background rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
          {/* Header */}
          <div className="p-6 md:p-8 bg-gradient-to-br from-white/10 to-transparent border-b border-white/10">
            <div className="flex items-center gap-2 text-primary-foreground/80 mb-4 text-sm font-medium uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Your Refund Risk Score
            </div>
            <div className="flex justify-center">
              <CircularProgress score={calculations.riskScore} />
            </div>
          </div>

          {/* Causes & Fixes */}
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                Top Causes
              </h3>
              <ul className="space-y-3">
                {calculations.causes.map((item, index) => (
                  <li
                    key={index}
                    className="text-sm text-white/80 pl-4 border-l-2 border-red-500/50"
                  >
                    {item.cause}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                CX Fixes
              </h3>
              <ul className="space-y-3">
                {calculations.causes.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-white/80"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    {item.fix}
                  </li>
                ))}
              </ul>
            </div>

            {/* Potential Savings */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-xs text-white/50 mb-1">
                Potential Risk Reduction
              </p>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-white">
                  Up to {Math.min(calculations.riskScore, 30)}%
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">
                With AI-powered empathetic support
              </p>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <Button
                onClick={openDemoModal}
                size="lg"
                className="w-full bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-medium h-12 rounded-xl text-base shadow-xl shadow-white/5"
              >
                Reduce Your Risk Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-center text-xs text-white/40 mt-3">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">

          <span>Join 500+ companies reducing refunds with MagicalCX</span>
        </div>
      </div>
    </div>
  );
};
