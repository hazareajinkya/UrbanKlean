"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useDemoModal } from "@/components/landing/demo-modal";
import {
  TrendingDown,
  Users,
  Ticket,
  Clock,
  ArrowRight,
  Info,
  DollarSign,
  Zap,
  Shield,
  Sparkles,
  Target,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Country = "US" | "India" | "EU";

// Fully loaded monthly salaries by region (same as cost calculator)
const FULLY_LOADED_COSTS: Record<Country, { amount: number; symbol: string }> =
  {
    US: { amount: 4012, symbol: "$" },
    India: { amount: 24050, symbol: "₹" },
    EU: { amount: 3900, symbol: "€" },
  };

// MagicalCX pricing: $199 per 1k tickets (US), €166 per 1k tickets (EU), ₹9,999 per 1k tickets (India)
const MAGICALCX_PRICE_PER_1K_TICKETS: Record<Country, number> = {
  US: 199,
  EU: 166,
  India: 9999,
};

// Constants based on industry data
const AGENT_WORK_MINUTES_PER_MONTH = 9600; // 160 hours × 60 minutes
const DEFAULT_OCCUPANCY = 0.75; // 75% occupancy (accounts for shrinkage, breaks, meetings)
const MESSAGES_PER_TICKET = 5; // Fixed product decision
const DEFAULT_AHT = 8.5; // Default average handle time in minutes
const DEFAULT_FIRST_RESPONSE_TIME = 12; // Default first response time in minutes
const DEFAULT_REFUND_RATE = 7.5; // percentage
const DEFAULT_AOV_BY_COUNTRY: Record<Country, number> = {
  US: 145,
  EU: 130,
  India: 2750,
};
const AOV_MAX_BY_COUNTRY: Record<Country, number> = {
  US: 1000,
  EU: 1000,
  India: 20000,
};

// ROI-specific constants
const REFUND_REDUCTION_RATE = 0.3; // 30% reduction in refunds with faster, better responses
const AI_RESPONSE_TIME_MINUTES = 10 / 60; // Near-instant AI response (~10 seconds)
const RESOLUTION_TIME_REDUCTION = 0.4; // 40% faster resolution with AI assistance

// Animated number component
const AnimatedNumber = ({
  value,
  prefix = "",
  suffix = "",
  className,
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
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
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * ease;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

// Progress Bar Component for Comparisons
const ComparisonBar = ({
  label,
  valueHuman,
  valueAI,
  formatValue,
  unit = "",
  inverse = false, // if true, lower is better (e.g. cost, time)
}: {
  label: string;
  valueHuman: number;
  valueAI: number;
  formatValue: (v: number) => string;
  unit?: string;
  inverse?: boolean;
}) => {
  const max = Math.max(valueHuman, valueAI);
  const humanPercent = max > 0 ? (valueHuman / max) * 100 : 0;
  const aiPercent = max > 0 ? (valueAI / max) * 100 : 0;

  const isBetter = inverse ? valueAI < valueHuman : valueAI > valueHuman;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-white/60 mb-1">
        <span>{label}</span>
      </div>

      {/* Human Bar */}
      <div className="relative h-8 w-full bg-white/5 rounded-lg overflow-hidden flex items-center px-3 group">
        <div
          className="absolute top-0 left-0 h-full bg-white/10 transition-all duration-700 ease-out"
          style={{ width: `${humanPercent}%` }}
        />
        <div className="relative z-10 flex justify-between w-full text-xs">
          <span className="text-white/50 font-medium">Human Only</span>
          <span className="text-white/70 font-mono">
            {formatValue(valueHuman)}
            {unit}
          </span>
        </div>
      </div>

      {/* AI Bar */}
      <div className="relative h-8 w-full bg-white/5 rounded-lg overflow-hidden flex items-center px-3">
        <div
          className={cn(
            "absolute top-0 left-0 h-full transition-all duration-700 ease-out",
            isBetter ? "bg-primary/20" : "bg-white/10",
          )}
          style={{ width: `${aiPercent}%` }}
        />
        <div
          className={cn(
            "absolute top-0 left-0 h-full w-1 transition-all duration-700 ease-out",
            isBetter ? "bg-primary" : "bg-white/20",
          )}
        />
        <div className="relative z-10 flex justify-between w-full text-xs">
          <span
            className={cn(
              "font-medium flex items-center gap-1.5",
              isBetter ? "text-primary-foreground" : "text-white/50",
            )}
          >
            {isBetter && (
              <Zap className="w-3 h-3 fill-primary-foreground text-primary-foreground" />
            )}
            With MagicalCX
          </span>
          <span
            className={cn(
              "font-mono font-bold",
              isBetter ? "text-white" : "text-white/70",
            )}
          >
            {formatValue(valueAI)}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

export const AIHumanROICalculator = () => {
  const { openDemoModal } = useDemoModal();
  const [country, setCountry] = useState<Country>("US");
  const [ticketsPerMonth, setTicketsPerMonth] = useState<number>(5000);
  const [avgResolutionTime, setAvgResolutionTime] =
    useState<number>(DEFAULT_AHT);
  const [avgFirstResponseTime, setAvgFirstResponseTime] = useState<number>(
    DEFAULT_FIRST_RESPONSE_TIME,
  ); // minutes
  const [manualAgents, setManualAgents] = useState<number | null>(null);
  const [refundRate, setRefundRate] = useState<number>(DEFAULT_REFUND_RATE);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(
    DEFAULT_AOV_BY_COUNTRY.US,
  );

  useEffect(() => {
    setAvgOrderValue(DEFAULT_AOV_BY_COUNTRY[country]);
  }, [country]);

  const calculations = useMemo(() => {
    const { amount: fullyLoadedSalary, symbol } = FULLY_LOADED_COSTS[country];
    const pricePerBucket = MAGICALCX_PRICE_PER_1K_TICKETS[country];

    // Effective agent work minutes (with occupancy/shrinkage)
    const effectiveAgentMinutes =
      AGENT_WORK_MINUTES_PER_MONTH * DEFAULT_OCCUPANCY;

    // 1. Total human work required
    const totalHumanMinutes = ticketsPerMonth * avgResolutionTime;

    // 2. Recommended agents (derived from capacity)
    const recommendedAgents = Math.ceil(
      totalHumanMinutes / effectiveAgentMinutes,
    );

    // 3. Agents to use for cost calculation (manual override or recommended)
    const agentsForCost =
      manualAgents !== null ? manualAgents : recommendedAgents;

    // 4. Human fully-loaded monthly cost
    const humanMonthlyCost = agentsForCost * fullyLoadedSalary;

    // 5. Human cost per ticket
    const humanCostPerTicket =
      ticketsPerMonth > 0 ? humanMonthlyCost / ticketsPerMonth : 0;

    // 6. Total messages for MagicalCX
    const totalMessages = ticketsPerMonth * MESSAGES_PER_TICKET;

    // 7. MagicalCX monthly cost (bucketed by 1k tickets)
    const ticketBuckets = Math.ceil(ticketsPerMonth / 1000);
    const magicalCxCost = ticketBuckets * pricePerBucket;

    // 8. MagicalCX cost per ticket
    const magicalCxCostPerTicket =
      ticketsPerMonth > 0 ? magicalCxCost / ticketsPerMonth : 0;

    // 9. Per-message cost for transparency
    const perMessageCost =
      totalMessages > 0 ? magicalCxCost / totalMessages : 0;

    // 10. Savings on operational cost
    const costSavings = humanMonthlyCost - magicalCxCost;
    const savingsPercentage =
      humanMonthlyCost > 0 ? (costSavings / humanMonthlyCost) * 100 : 0;

    // === ROI-specific calculations ===

    // Response time improvement
    const humanFirstResponseTime = avgFirstResponseTime; // minutes
    const aiFirstResponseTime = AI_RESPONSE_TIME_MINUTES; // 1 minute (near-instant)

    // Resolution time improvement (40% faster with AI)
    const humanResolutionTime = avgResolutionTime;
    const aiResolutionTime =
      avgResolutionTime * (1 - RESOLUTION_TIME_REDUCTION);

    // Refund cost calculations
    const humanRefundCost =
      ticketsPerMonth * (refundRate / 100) * avgOrderValue;
    const aiRefundRate = refundRate * (1 - REFUND_REDUCTION_RATE); // 30% fewer refunds
    const aiRefundCost = ticketsPerMonth * (aiRefundRate / 100) * avgOrderValue;
    const refundSavings = humanRefundCost - aiRefundCost;

    // Total savings (operational + refund savings)
    const totalSavings = costSavings + refundSavings;

    // ROI calculation: (Total Savings) / MagicalCX Cost * 100
    const roiPercentage =
      magicalCxCost > 0 ? (totalSavings / magicalCxCost) * 100 : 0;

    // Time savings calculations
    const responseTimeSavingsTotal =
      ((humanFirstResponseTime - aiFirstResponseTime) * ticketsPerMonth) / 60; // hours
    const resolutionTimeSavingsTotal =
      ((humanResolutionTime - aiResolutionTime) * ticketsPerMonth) / 60; // hours
    const totalTimeSavingsHours =
      responseTimeSavingsTotal + resolutionTimeSavingsTotal;

    // Manual override status
    const hasManualOverride = manualAgents !== null;
    const isOverstaffed = hasManualOverride && manualAgents > recommendedAgents;
    const isUnderstaffed =
      hasManualOverride && manualAgents < recommendedAgents;
    const extraAgents = isOverstaffed ? manualAgents - recommendedAgents : 0;
    const shortAgents = isUnderstaffed ? recommendedAgents - manualAgents : 0;

    // Breakeven calculation
    let breakevenTickets = 0;
    for (let t = 100; t <= 100000; t += 100) {
      const humanCost =
        Math.ceil((t * avgResolutionTime) / effectiveAgentMinutes) *
        fullyLoadedSalary;
      const refundCostHuman = t * (refundRate / 100) * avgOrderValue;
      const totalHuman = humanCost + refundCostHuman;

      const magicalCost = Math.ceil(t / 1000) * pricePerBucket;
      const refundCostAI = t * (aiRefundRate / 100) * avgOrderValue;
      const totalAI = magicalCost + refundCostAI;

      if (totalAI >= totalHuman) {
        breakevenTickets = t;
        break;
      }
    }
    if (breakevenTickets === 0) breakevenTickets = 100000;

    return {
      // Agents
      recommendedAgents,
      agentsForCost,
      hasManualOverride,
      isOverstaffed,
      isUnderstaffed,
      extraAgents,
      shortAgents,

      // Human costs
      humanMonthlyCost,
      humanCostPerTicket,
      humanFirstResponseTime,
      humanResolutionTime,
      humanRefundCost,

      // MagicalCX
      totalMessages,
      ticketBuckets,
      magicalCxCost,
      magicalCxCostPerTicket,
      perMessageCost,
      aiFirstResponseTime,
      aiResolutionTime,
      aiRefundCost,
      aiRefundRate,

      // Savings
      costSavings,
      savingsPercentage,
      refundSavings,
      totalSavings,
      roiPercentage,
      totalTimeSavingsHours,

      // Breakeven
      breakevenTickets,

      // Currency
      symbol,
      pricePerBucket,
    };
  }, [
    country,
    ticketsPerMonth,
    avgResolutionTime,
    avgFirstResponseTime,
    manualAgents,
    refundRate,
    avgOrderValue,
  ]);

  const { symbol } = calculations;

  // Display agents (manual or recommended)
  const displayAgents =
    manualAgents !== null ? manualAgents : calculations.recommendedAgents;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-7xl mx-auto">
      {/* Left Column: Inputs */}
      <div className="lg:col-span-7 space-y-10">
        <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-6 md:p-8 space-y-8">
          {/* Country Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Where is your team located?
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {(["US", "EU", "India"] as Country[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCountry(c)}
                  className={cn(
                    "relative px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer",
                    country === c
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border bg-background hover:border-primary/50 hover:bg-muted/50",
                  )}
                >
                  {c === "US" && (
                    <>
                      <span className="text-lg">🇺🇸</span>
                      <span>United States</span>
                    </>
                  )}
                  {c === "EU" && (
                    <>
                      <span className="text-lg">🇪🇺</span>
                      <span>Europe</span>
                    </>
                  )}
                  {c === "India" && (
                    <>
                      <span className="text-lg">🇮🇳</span>
                      <span>India</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets Slider */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center gap-2">
                <Ticket className="w-4 h-4 text-primary" />
                Monthly Tickets
              </Label>
              <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1">
                <Input
                  type="number"
                  value={ticketsPerMonth}
                  onChange={(e) =>
                    setTicketsPerMonth(Number(e.target.value) || 0)
                  }
                  className="w-20 h-6 border-none p-0 text-right focus-visible:ring-0"
                />
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
            </div>
            <Slider
              value={[ticketsPerMonth]}
              min={100}
              max={30000}
              step={100}
              onValueChange={(vals) => setTicketsPerMonth(vals[0])}
              className="py-4"
            />
          </div>

          {/* First Response Time (in minutes) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Avg. First Response Time
              </Label>
              <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1">
                <Input
                  type="number"
                  value={avgFirstResponseTime}
                  onChange={(e) =>
                    setAvgFirstResponseTime(Number(e.target.value) || 1)
                  }
                  className="w-16 h-6 border-none p-0 text-right focus-visible:ring-0"
                />
                <span className="text-sm text-muted-foreground">mins</span>
              </div>
            </div>
            <Slider
              value={[avgFirstResponseTime]}
              min={1}
              max={30}
              step={1}
              onValueChange={(vals) => setAvgFirstResponseTime(vals[0])}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground">
              Benchmark: ~12 mins median first response time (internet industry)
            </p>
          </div>

          {/* Resolution Time */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Avg. Handle Time (AHT)
              </Label>
              <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1">
                <Input
                  type="number"
                  value={avgResolutionTime}
                  onChange={(e) =>
                    setAvgResolutionTime(Number(e.target.value) || 1)
                  }
                  className="w-16 h-6 border-none p-0 text-right focus-visible:ring-0"
                />
                <span className="text-sm text-muted-foreground">mins</span>
              </div>
            </div>
            <Slider
              value={[avgResolutionTime]}
              min={1}
              max={30}
              step={1}
              onValueChange={(vals) => setAvgResolutionTime(vals[0])}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground">
              Industry average: 3-5 min (live chat), 8-12 min (email/complex
              tickets)
            </p>
          </div>

          {/* Recommended Agents Display */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  Recommended Team Size
                </span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {calculations.recommendedAgents}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {ticketsPerMonth.toLocaleString()} tickets ×{" "}
              {avgResolutionTime} min AHT ÷{" "}
              {(
                AGENT_WORK_MINUTES_PER_MONTH * DEFAULT_OCCUPANCY
              ).toLocaleString()}{" "}
              effective mins/agent
            </p>
          </div>

          {/* Manual Override Slider */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Your Current Team Size
              </Label>
              <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1">
                <Input
                  type="number"
                  value={displayAgents}
                  onChange={(e) => setManualAgents(Number(e.target.value) || 1)}
                  className="w-16 h-6 border-none p-0 text-right focus-visible:ring-0"
                />
                <span className="text-sm text-muted-foreground">agents</span>
              </div>
            </div>
            <Slider
              value={[displayAgents]}
              min={1}
              max={30}
              step={1}
              onValueChange={(vals) => setManualAgents(vals[0])}
              className="py-4"
            />

            {/* Overstaffed badge */}
            {calculations.isOverstaffed && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-3 py-2 rounded-lg">
                <Plus className="w-4 h-4" />
                <span>
                  You've added {calculations.extraAgents} extra agent
                  {calculations.extraAgents > 1 ? "s" : ""} — cost impact shown
                  below
                </span>
              </div>
            )}

            {/* Understaffed warning */}
            {calculations.isUnderstaffed && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  Understaffed by {calculations.shortAgents} agent
                  {calculations.shortAgents > 1 ? "s" : ""} — expect backlog or
                  SLA breaches
                </span>
              </div>
            )}
          </div>

          {/* Refund Rate */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Current Refund Rate
              </Label>
              <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1">
                <Input
                  type="number"
                  value={refundRate}
                  onChange={(e) => setRefundRate(Number(e.target.value) || 0)}
                  className="w-16 h-6 border-none p-0 text-right focus-visible:ring-0"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <Slider
              value={[refundRate]}
              min={0}
              max={20}
              step={0.5}
              onValueChange={(vals) => setRefundRate(vals[0])}
              className="py-4"
            />
          </div>

          {/* Average Order Value */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Average Order Value
              </Label>
              <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1">
                <Input
                  type="number"
                  value={avgOrderValue}
                  onChange={(e) =>
                    setAvgOrderValue(Number(e.target.value) || 0)
                  }
                  className="w-20 h-6 border-none p-0 text-right focus-visible:ring-0"
                />
                <span className="text-sm text-muted-foreground">{symbol}</span>
              </div>
            </div>
            <Slider
              value={[avgOrderValue]}
              min={10}
              max={AOV_MAX_BY_COUNTRY[country]}
              step={5}
              onValueChange={(vals) => setAvgOrderValue(vals[0])}
              className="py-4"
            />
          </div>
        </div>

        {/* Methodology Note */}
        <div className="bg-muted/30 rounded-xl p-4 flex gap-3 text-sm text-muted-foreground">
          <Info className="w-5 h-5 shrink-0 text-primary/60 mt-0.5" />
          <div className="space-y-2">
            <p>
              <strong>Calculation methodology:</strong> Uses fully loaded
              monthly costs (salary + ~30% overhead) with 75% occupancy rate.
            </p>
            <p>
              <strong>MagicalCX pricing:</strong> {symbol}
              {calculations.pricePerBucket.toLocaleString()} per 1,000 tickets.
              AI responds in ~1 min, resolves{" "}
              {(RESOLUTION_TIME_REDUCTION * 100).toFixed(0)}% faster, and
              reduces refunds by {(REFUND_REDUCTION_RATE * 100).toFixed(0)}%.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Results Dashboard */}
      <div className="lg:col-span-5 relative lg:sticky lg:top-24">
        <div className="bg-foreground text-background rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
          {/* Header */}
          <div className="p-6 md:p-8 bg-gradient-to-br from-white/10 to-transparent border-b border-white/10">
            <div className="flex items-center gap-2 text-primary-foreground/80 mb-2 text-sm font-medium uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Total Monthly Impact
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <AnimatedNumber
                value={Math.max(0, calculations.totalSavings)}
                prefix={symbol}
                className="text-5xl md:text-6xl font-serif font-medium tracking-tight"
              />
              <span className="text-xl text-white/60 font-serif">/mo</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/20 text-primary-foreground text-sm font-medium">
              <span className="font-bold">
                {isFinite(calculations.roiPercentage) &&
                calculations.roiPercentage > 0
                  ? calculations.roiPercentage.toFixed(0)
                  : 0}
                % ROI
              </span>
              <span className="w-1 h-1 rounded-full bg-primary-foreground/30" />
              <span>
                {isFinite(calculations.roiPercentage) &&
                calculations.roiPercentage > 0
                  ? (calculations.roiPercentage / 100).toFixed(1)
                  : 0}
                x Multiplier
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Comparison Bars */}
            <div className="space-y-6">
              <ComparisonBar
                label="Monthly Operational Cost"
                valueHuman={calculations.humanMonthlyCost}
                valueAI={calculations.magicalCxCost}
                formatValue={(v) => `${symbol}${v.toLocaleString()}`}
                inverse={true}
              />

              <ComparisonBar
                label="First Response Time"
                valueHuman={calculations.humanFirstResponseTime}
                valueAI={calculations.aiFirstResponseTime}
                formatValue={(v) =>
                  v < 1 ? `${Math.round(v * 60)} secs` : `${v.toFixed(0)} mins`
                }
                unit=""
                inverse={true}
              />

              <ComparisonBar
                label="Avg. Resolution Time"
                valueHuman={calculations.humanResolutionTime}
                valueAI={calculations.aiResolutionTime}
                formatValue={(v) => v.toFixed(0)}
                unit=" mins"
                inverse={true}
              />

              <ComparisonBar
                label="Refunds & Returns Cost"
                valueHuman={calculations.humanRefundCost}
                valueAI={calculations.aiRefundCost}
                formatValue={(v) => `${symbol}${v.toLocaleString()}`}
                inverse={true}
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-white/50 mb-1">Time Saved</p>
                <p className="text-2xl font-bold text-white flex items-center gap-2">
                  {Math.round(
                    calculations.totalTimeSavingsHours,
                  ).toLocaleString()}
                  <span className="text-sm font-normal text-white/50">
                    hrs/mo
                  </span>
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-white/50 mb-1">Cost Per Ticket</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-white">
                    {symbol}
                    {calculations.magicalCxCostPerTicket.toFixed(2)}
                  </p>
                  <p className="text-sm text-white/40 line-through">
                    {symbol}
                    {calculations.humanCostPerTicket.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-xs text-white/50 mb-3">Pricing Breakdown</p>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-5 mb-2">
                  <div></div>
                  <p className="text-xs text-white/60 font-medium">Human</p>
                  <p className="text-xs text-white/60 font-medium">MagicalCX</p>
                </div>
                <div className="grid grid-cols-3 gap-5 items-center">
                  <span className="text-white/70">Total Tickets</span>
                  <span className="text-white font-medium">
                    {ticketsPerMonth.toLocaleString()}
                  </span>
                  <span className="text-white font-medium">
                    {ticketsPerMonth.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-5 items-center">
                  <span className="text-white/70">Team size</span>
                  <span className="text-white font-medium">
                    {calculations.agentsForCost}
                  </span>
                  <span className="text-white font-medium">0</span>
                </div>
                <div className="grid grid-cols-3 gap-5 items-center">
                  <span className="text-white/70">Per-Ticket Cost</span>
                  <span className="text-white font-medium">
                    {symbol}
                    {calculations.humanCostPerTicket.toFixed(2)}
                  </span>
                  <span className="text-white font-medium">
                    {symbol}
                    {calculations.magicalCxCostPerTicket.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-5 items-center pt-2 border-t border-white/10">
                  <span className="text-white/70">Total Cost</span>
                  <span className="text-white font-bold">
                    {symbol}
                    {calculations.humanMonthlyCost.toLocaleString()}
                  </span>
                  <span className="text-white font-bold">
                    {symbol}
                    {calculations.magicalCxCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Savings Breakdown */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-xs text-white/50 mb-3">Savings Breakdown</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Operational Savings</span>
                  <span className="text-white font-medium">
                    {symbol}
                    {Math.max(0, calculations.costSavings).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Refund Savings</span>
                  <span className="text-white font-medium">
                    {symbol}
                    {Math.max(0, calculations.refundSavings).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-white/70">Total Savings</span>
                  <span className="text-white font-bold">
                    {symbol}
                    {Math.max(0, calculations.totalSavings).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-4 pt-2">
              <Button
                onClick={openDemoModal}
                size="lg"
                className="w-full bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-medium h-12 rounded-xl text-base shadow-xl shadow-white/5"
              >
                Start Saving Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-center text-xs text-white/40">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Join 500+ companies saving with MagicalCX</span>
        </div>
      </div>
    </div>
  );
};
