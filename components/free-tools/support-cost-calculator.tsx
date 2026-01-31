"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDemoModal } from "@/components/landing/demo-modal";
import {
  TrendingDown,
  Users,
  Ticket,
  Clock,
  Sparkles,
  ArrowRight,
  Calculator,
  Info,
  AlertTriangle,
  Plus,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Country = "US" | "India" | "EU";

// Fully loaded monthly salaries by region
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
const OVERHEAD_RATE = 0.3; // 30% overhead already factored into fully loaded costs
const DEFAULT_AHT = 8.5; // Default average handle time in minutes

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

export const SupportCostCalculator = () => {
  const { openDemoModal } = useDemoModal();
  const [country, setCountry] = useState<Country>("US");
  const [ticketsPerMonth, setTicketsPerMonth] = useState<number>(5000);
  const [avgResolutionTime, setAvgResolutionTime] =
    useState<number>(DEFAULT_AHT);
  const [manualAgents, setManualAgents] = useState<number | null>(null);

  const calculations = useMemo(() => {
    const { amount: fullyLoadedSalary, symbol } = FULLY_LOADED_COSTS[country];

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

    // 6. Total messages for MagicalCX (for display purposes)
    const totalMessages = ticketsPerMonth * MESSAGES_PER_TICKET;

    // 7. MagicalCX monthly cost (bucketed by 1k tickets for all regions)
    const ticketBuckets = Math.ceil(ticketsPerMonth / 1000);
    const pricePerBucket = MAGICALCX_PRICE_PER_1K_TICKETS[country];
    const magicalCxCost = ticketBuckets * pricePerBucket;

    // 8. MagicalCX cost per ticket
    const magicalCxCostPerTicket =
      ticketsPerMonth > 0 ? magicalCxCost / ticketsPerMonth : 0;

    // 9. Implied per-message cost for transparency
    const perMessageCost =
      totalMessages > 0 ? magicalCxCost / totalMessages : 0;

    // 10. Savings
    const savingsAmount = humanMonthlyCost - magicalCxCost;
    const savingsPercentage =
      humanMonthlyCost > 0 ? (savingsAmount / humanMonthlyCost) * 100 : 0;

    // 11. Breakeven tickets calculation
    let breakevenTickets = 0;
    for (let t = 100; t <= 100000; t += 100) {
      const humanCost =
        Math.ceil((t * avgResolutionTime) / effectiveAgentMinutes) *
        fullyLoadedSalary;
      const magicalCost =
        Math.ceil(t / 1000) * MAGICALCX_PRICE_PER_1K_TICKETS[country];
      if (magicalCost >= humanCost) {
        breakevenTickets = t;
        break;
      }
    }
    // If MagicalCX is always cheaper, set to max
    if (breakevenTickets === 0) {
      breakevenTickets = 100000;
    }

    // Manual override status
    const hasManualOverride = manualAgents !== null;
    const isOverstaffed = hasManualOverride && manualAgents > recommendedAgents;
    const isUnderstaffed =
      hasManualOverride && manualAgents < recommendedAgents;
    const extraAgents = isOverstaffed ? manualAgents - recommendedAgents : 0;
    const shortAgents = isUnderstaffed ? recommendedAgents - manualAgents : 0;

    return {
      // Inputs
      effectiveAgentMinutes,
      totalHumanMinutes,

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

      // MagicalCX
      totalMessages,
      ticketBuckets,
      pricePerBucket,
      magicalCxCost,
      magicalCxCostPerTicket,
      perMessageCost,

      // Savings
      savingsAmount,
      savingsPercentage,

      // Breakeven
      breakevenTickets,

      // Currency
      symbol,
    };
  }, [country, ticketsPerMonth, avgResolutionTime, manualAgents]);

  const { symbol } = calculations;

  // Initialize manual agents to recommended when it changes significantly
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
                  min={100}
                  max={30000}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setTicketsPerMonth(Math.min(30000, Math.max(100, val)));
                  }}
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

          {/* Resolution Time */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
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
              Industry average: 6-9 min (most channels), 8-12 min (email/complex
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
              Calc: {ticketsPerMonth.toLocaleString()} × {avgResolutionTime} ={" "}
              {(ticketsPerMonth * avgResolutionTime).toLocaleString()} mins, ÷{" "}
              {(
                AGENT_WORK_MINUTES_PER_MONTH * DEFAULT_OCCUPANCY
              ).toLocaleString()}{" "}
              mins per agent
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
              max={100}
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
        </div>

        {/* Methodology Note */}
        <div className="bg-muted/30 rounded-xl p-4 flex gap-3 text-sm text-muted-foreground">
          <Info className="w-5 h-5 shrink-0 text-primary/60 mt-0.5" />
          <div className="space-y-2">
            <p>
              <strong>Calculation methodology:</strong> Uses fully loaded
              monthly costs (salary + ~30% overhead) with 75% occupancy rate
              (accounts for breaks, meetings, training).
            </p>
            <p>
              <strong>MagicalCX pricing:</strong> {symbol}
              {calculations.pricePerBucket.toLocaleString()} per 1,000 tickets
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
              Projected Savings
            </div>
            <div className="flex items-baseline gap-1">
              <AnimatedNumber
                value={Math.max(0, calculations.savingsAmount)}
                prefix={symbol}
                className="text-5xl md:text-6xl font-serif font-medium tracking-tight"
              />
              <span className="text-xl text-white/60 font-serif">/mo</span>
            </div>
            {calculations.savingsAmount > 0 ? (
              <p className="text-primary-foreground/70 mt-2">
                You could save{" "}
                <span className="text-white font-bold">
                  {calculations.savingsPercentage.toFixed(0)}%
                </span>{" "}
                on support costs
              </p>
            ) : (
              <p className="text-amber-400/80 mt-2">
                At this volume, human support may be more cost-effective
              </p>
            )}
          </div>

          {/* Breakdown */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Visual Bar Comparison */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Human Team Cost</span>
                  <span className="text-white font-medium">
                    {symbol}
                    {calculations.humanMonthlyCost.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white/40 w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-foreground">
                    With MagicalCX
                  </span>
                  <span className="text-primary-foreground font-bold">
                    {symbol}
                    {calculations.magicalCxCost.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/40 transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.max(
                        1,
                        Math.min(
                          100,
                          calculations.humanMonthlyCost > 0
                            ? (calculations.magicalCxCost /
                                calculations.humanMonthlyCost) *
                                100
                            : 100,
                        ),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 3 KPI Tiles */}
            <div className="grid grid-cols-2 gap-3">
              {/* Agents Needed */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-white/50 mb-1">Agents Needed</p>
                <p className="text-2xl font-medium text-white flex items-center gap-2">
                  {calculations.agentsForCost}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  Recommended: {calculations.recommendedAgents}
                </p>
              </div>

              {/* Cost per Ticket */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-white/50 mb-1">Cost per Ticket</p>
                <p className="text-2xl font-medium text-white flex items-center gap-2">
                  {symbol}
                  {calculations.humanCostPerTicket.toFixed(2)}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  MagicalCX: {symbol}
                  {calculations.magicalCxCostPerTicket.toFixed(2)}
                  <TrendingDown className="w-3 h-3 inline-block ml-1" />
                </p>
              </div>

              {/* Monthly Cost Comparison */}
              <div className="col-span-2 bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-white/50 mb-2">
                  Monthly Cost Comparison
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40">Human Team</p>
                    <p className="text-lg font-medium text-white/70">
                      {symbol}
                      {calculations.humanMonthlyCost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">MagicalCX</p>
                    <p className="text-lg font-medium text-white">
                      {symbol}
                      {calculations.magicalCxCost.toLocaleString()}
                    </p>
                  </div>
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

            {/* Breakeven Info */}
            {calculations.breakevenTickets < 100000 && (
              <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                <p className="text-xs text-amber-400/80 mb-1">
                  Breakeven Point
                </p>
                <p className="text-sm text-white/80">
                  At{" "}
                  <span className="font-bold text-amber-400">
                    {calculations.breakevenTickets.toLocaleString()}
                  </span>{" "}
                  tickets/month, MagicalCX costs equal human support costs.
                </p>
              </div>
            )}

            <div className="pt-2">
              <Button
                onClick={openDemoModal}
                size="lg"
                className="w-full bg-white text-black hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 font-medium h-12 rounded-xl text-base"
              >
                Start Saving Today
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-center text-xs text-white/40 mt-3">
                No credit card required • 14-day free trial
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
