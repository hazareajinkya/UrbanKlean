"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  BarChart3,
  Phone,
  PhoneIncoming,
  CheckCircle2,
  XCircle,
  Building2,
  Globe,
  RefreshCw,
  Calendar,
  TrendingUp,
  IndianRupee,
  Sparkles,
  Clock,
  Zap,
  Users,
  MapPin,
  Star,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SignalSource = "housing" | "website" | "crm_followup" | "pattern" | "event";

type Signal = {
  id: string;
  source: SignalSource;
  customerName: string;
  project: string;
  trigger: string;
  detail: string;
  suggestedAction: string;
  estimatedValue: number;
  timestamp: string;
};

type Outcome = "pending" | "calling" | "converted" | "declined";

type CallEvent = {
  id: string;
  signal: Signal;
  outcome: Outcome;
  pitch: string;
  customerReply?: string;
};

const SIGNAL_META: Record<SignalSource, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}> = {
  housing: { label: "Housing.com / 99Acres", icon: Globe, color: "text-blue-400", bg: "bg-blue-950/50" },
  website: { label: "My Home Website", icon: Building2, color: "text-[#1e293b]", bg: "bg-[#475569]/25" },
  crm_followup: { label: "CRM Follow-up", icon: RefreshCw, color: "text-purple-400", bg: "bg-purple-950/50" },
  pattern: { label: "Engagement Pattern", icon: Star, color: "text-amber-400", bg: "bg-amber-950/40" },
  event: { label: "Expo / Event", icon: Calendar, color: "text-[#1e293b]", bg: "bg-[#475569]/25" },
};

const SIGNAL_TEMPLATES: Omit<Signal, "id" | "timestamp">[] = [
  {
    source: "housing",
    customerName: "Rajesh Iyer",
    project: "My Home Grava",
    trigger: "Viewed Grava listing 4 times this week",
    detail: "Mon 9 AM, Wed 11 PM, Thu 2 PM, Fri 8 AM — same device",
    suggestedAction: "Outbound call — offer exclusive site visit",
    estimatedValue: 25000000,
  },
  {
    source: "website",
    customerName: "Neha Sharma",
    project: "My Home Akrida",
    trigger: "Downloaded brochure but didn't submit enquiry",
    detail: "Downloaded at 11:32 PM — 8 min on pricing page",
    suggestedAction: "Warm outbound call with EMI offer",
    estimatedValue: 8500000,
  },
  {
    source: "crm_followup",
    customerName: "Sanjay Gupta",
    project: "My Home Nishada",
    trigger: "No response for 5 days after site visit",
    detail: "Visited last Sunday · Marked Interested · Silent since",
    suggestedAction: "Nurture call — share payment plan details",
    estimatedValue: 18000000,
  },
  {
    source: "pattern",
    customerName: "Divya Reddy",
    project: "My Home Vipina",
    trigger: "Enquired same time last 3 months — price check",
    detail: "Monthly re-engagement pattern detected",
    suggestedAction: "Call with new launch offer before month end",
    estimatedValue: 7500000,
  },
  {
    source: "event",
    customerName: "Kiran Mehta",
    project: "My Home Apas",
    trigger: "Attended Hyderabad Property Expo, scanned QR",
    detail: "Kokapet · 3 BHK · Lead form submitted at expo stall",
    suggestedAction: "Immediate follow-up while interest is fresh",
    estimatedValue: 15000000,
  },
  {
    source: "housing",
    customerName: "Arjun Patel",
    project: "My Home 99",
    trigger: "Added to shortlist on 99acres, then removed",
    detail: "Shortlisted Mon · Removed Wed · Suggests price hesitation",
    suggestedAction: "Call with flexible payment plan offer",
    estimatedValue: 22000000,
  },
  {
    source: "website",
    customerName: "Meera Krishnan",
    project: "My Home Udyan",
    trigger: "Spent 22 minutes on virtual tour",
    detail: "Saturday 10 PM · 22 min tour · 3 BHK units focused",
    suggestedAction: "Outbound with personalised 3BHK walkthrough",
    estimatedValue: 9500000,
  },
  {
    source: "crm_followup",
    customerName: "Vijay Kumar",
    project: "My Home Avali",
    trigger: "Price enquiry 30 days ago — re-engage",
    detail: "Was comparing with 2 other projects · Decision window closing",
    suggestedAction: "Call with current offers + competitive positioning",
    estimatedValue: 12000000,
  },
];

const PITCHES: Record<SignalSource, (s: Signal) => string> = {
  housing: (s) => `Hi ${s.customerName.split(" ")[0]}! I noticed you've been exploring ${s.project} — a fantastic choice! I'd love to arrange an exclusive site visit for you this weekend. We have a special early-bird offer available only this month. Do you have 2 minutes?`,
  website: (s) => `Hi ${s.customerName.split(" ")[0]}! I saw you downloaded the ${s.project} brochure. I'm Priya from My Home Group — happy to walk you through the payment options and answer any questions. Shall I take 5 minutes?`,
  crm_followup: (s) => `Hi ${s.customerName.split(" ")[0]}! This is Priya from My Home Group. You visited ${s.project} recently and we'd love to help you move forward. I have a detailed payment plan ready — would you like me to share it?`,
  pattern: (s) => `Hi ${s.customerName.split(" ")[0]}! Priya here from My Home Group. I have some exciting news about ${s.project} — we just launched a limited early-bird offer with 2% launch discount. Given your interest, I wanted you to be among the first to know!`,
  event: (s) => `Hi ${s.customerName.split(" ")[0]}! This is Priya from My Home Group, so glad you visited our stall at the expo! I can arrange a private site visit at ${s.project} at your convenience — shall we set something up for this weekend?`,
};

const REPLIES: { positive: string[]; negative: string[] } = {
  positive: [
    "Yes, I'd love a site visit!",
    "That sounds great, please go ahead.",
    "Yes, this weekend works.",
    "Perfect, send me the details.",
    "Yes, I was just thinking about calling you.",
  ],
  negative: [
    "Not right now, maybe next month.",
    "I'm still comparing options.",
    "Please call me later this week.",
  ],
};

const formatCrore = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  return `₹${(n / 100000).toFixed(0)} L`;
};

export default function MyHomeGroupTriggersPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [callEvents, setCallEvents] = useState<CallEvent[]>([]);
  const [stats, setStats] = useState({ triggered: 0, converted: 0, pipeline: 0 });
  const [isLive, setIsLive] = useState(true);
  const templateIndexRef = useRef(0);

  useEffect(() => {
    if (!isLive) return;

    const emitSignal = () => {
      const template = SIGNAL_TEMPLATES[templateIndexRef.current % SIGNAL_TEMPLATES.length];
      templateIndexRef.current += 1;

      const signal: Signal = {
        ...template,
        id: `sig-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };

      setSignals(prev => [signal, ...prev].slice(0, 6));
      setStats(prev => ({ ...prev, triggered: prev.triggered + 1 }));

      setTimeout(() => {
        const callEvent: CallEvent = {
          id: `call-${signal.id}`,
          signal,
          outcome: "calling",
          pitch: PITCHES[signal.source](signal),
        };
        setCallEvents(prev => [callEvent, ...prev].slice(0, 5));

        setTimeout(() => {
          const willConvert = Math.random() > 0.3;
          const reply = willConvert
            ? REPLIES.positive[Math.floor(Math.random() * REPLIES.positive.length)]
            : REPLIES.negative[Math.floor(Math.random() * REPLIES.negative.length)];

          setCallEvents(prev =>
            prev.map(c =>
              c.id === callEvent.id
                ? { ...c, outcome: willConvert ? "converted" : "declined", customerReply: reply }
                : c
            )
          );

          if (willConvert) {
            setStats(prev => ({
              ...prev,
              converted: prev.converted + 1,
              pipeline: prev.pipeline + signal.estimatedValue,
            }));
          }
        }, 3500);
      }, 1200);
    };

    const initialTimeout = setTimeout(emitSignal, 600);
    const interval = setInterval(emitSignal, 5500);
    return () => { clearTimeout(initialTimeout); clearInterval(interval); };
  }, [isLive]);

  const conversionRate = stats.triggered > 0 ? Math.round((stats.converted / stats.triggered) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white/95 border-b border-slate-200 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[#475569] flex items-center justify-center shadow-md">
              <span className="text-white font-black text-xs tracking-tight">MHG</span>
            </div>
            <div>
              <h1 className="text-base font-medium text-gray-900 tracking-wide">MY HOME GROUP</h1>
              <p className="text-xs text-gray-500">Smart Triggers · Proactive AI</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-gray-100 rounded-full p-0.5">
              <Link href="/demo/my-home-group" className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors">
                Voice Demo
              </Link>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#475569] text-white flex items-center gap-1">
                <Bell className="size-3" />
                Triggers
              </span>
              <Link href="/demo/my-home-group/analytics" className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors">
                <BarChart3 className="size-3" />
                Analytics
              </Link>
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all",
                isLive ? "bg-[#475569] text-white" : "bg-gray-100 text-gray-500 hover:text-gray-800"
              )}
            >
              <span className={cn("size-1.5 rounded-full", isLive ? "bg-slate-50 animate-pulse" : "bg-gray-400")} />
              {isLive ? "Live" : "Paused"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-6">
        {/* Hero strip */}
        <div className="bg-white rounded-3xl shadow-sm p-6 flex items-start justify-between gap-6 flex-wrap">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-5 text-[#475569]" />
              <h2 className="text-xl font-medium text-gray-800">Convert leads before they go cold</h2>
            </div>
            <p className="text-gray-500 text-sm">
              Real estate enquiries go cold within 48 hours. My Home Group's AI voice agent detects intent signals from Housing.com, 99Acres, website behaviour, and CRM patterns — then proactively calls leads at the right moment to drive site visit bookings.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 min-w-[420px]">
            <StatCard label="Signals Today" value={stats.triggered.toString()} icon={Zap} color="text-[#475569]" bg="bg-[#475569]/20" />
            <StatCard label="Visits Booked" value={stats.converted.toString()} sublabel={`${conversionRate}% rate`} icon={TrendingUp} color="text-[#475569]" bg="bg-[#475569]/20" />
            <StatCard label="Pipeline" value={formatCrore(stats.pipeline)} icon={IndianRupee} color="text-amber-600" bg="bg-amber-50" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Signal Feed */}
          <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-800">Lead Signals</h3>
                <p className="text-xs text-gray-500">Live from connected platforms</p>
              </div>
              <span className="size-2 rounded-full bg-[#475569] animate-pulse" />
            </div>
            <div className="p-4 space-y-3 min-h-[420px]">
              {signals.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  <Bell className="size-10 mx-auto mb-3 text-gray-300" />
                  Waiting for signals...
                </div>
              )}
              {signals.map(signal => {
                const meta = SIGNAL_META[signal.source];
                const Icon = meta.icon;
                return (
                  <div
                    key={signal.id}
                    className="rounded-2xl border border-gray-100 p-3 hover:border-[#475569]/25 transition-all animate-in fade-in slide-in-from-top-2 duration-500"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0", meta.bg)}>
                        <Icon className={cn("size-4", meta.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500">{meta.label}</span>
                          <span className="text-xs text-gray-400">{signal.timestamp}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 leading-tight">{signal.trigger}</p>
                        <p className="text-xs text-gray-500 mt-1">{signal.detail}</p>
                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-600 truncate flex items-center gap-1">
                            <Users className="size-3" />
                            {signal.customerName.split(" ")[0]}
                            <span className="text-gray-400">· {signal.project}</span>
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#475569]/20 text-[#475569] font-medium shrink-0">
                            {formatCrore(signal.estimatedValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Trigger Rules */}
          <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-base font-medium text-gray-800">Trigger Rules</h3>
              <p className="text-xs text-gray-500">Active automation workflows</p>
            </div>
            <div className="p-4 space-y-3">
              <RuleCard
                icon={Globe}
                color="text-blue-500"
                bg="bg-blue-50"
                title="Portal Re-visit Detected"
                description="If same lead views listing 3+ times on Housing.com or 99acres → call within 2 hours"
                fired={signals.filter(s => s.source === "housing").length}
              />
              <RuleCard
                icon={Building2}
                color="text-[#475569]"
                bg="bg-[#475569]/20"
                title="Website Brochure Download"
                description="If brochure downloaded without enquiry → call within 30 min with EMI offer"
                fired={signals.filter(s => s.source === "website").length}
              />
              <RuleCard
                icon={RefreshCw}
                color="text-purple-500"
                bg="bg-purple-50"
                title="Post-Visit Silence (5 days)"
                description="If lead visited site but no response → nurture call with payment plan details"
                fired={signals.filter(s => s.source === "crm_followup").length}
              />
              <RuleCard
                icon={Star}
                color="text-amber-500"
                bg="bg-amber-50"
                title="Monthly Re-engagement Pattern"
                description="If lead re-enquires every month → time outbound call to catch before competitor does"
                fired={signals.filter(s => s.source === "pattern").length}
              />
              <RuleCard
                icon={Calendar}
                color="text-[#475569]"
                bg="bg-[#475569]/20"
                title="Expo / Event Lead"
                description="If QR scanned at property expo → immediate follow-up while interest is peak"
                fired={signals.filter(s => s.source === "event").length}
              />
              <button className="w-full p-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#475569]/30 hover:text-[#475569] transition-all text-sm flex items-center justify-center gap-2">
                <Sparkles className="size-4" />
                Add custom trigger
              </button>
            </div>
          </section>

          {/* Outbound AI Calls */}
          <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="text-base font-medium text-gray-800">Outbound AI Calls</h3>
              <p className="text-xs text-gray-500">Live conversion pipeline</p>
            </div>
            <div className="p-4 space-y-3 min-h-[420px]">
              {callEvents.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  <Phone className="size-10 mx-auto mb-3 text-gray-300" />
                  No active calls yet
                </div>
              )}
              {callEvents.map(call => <CallCard key={call.id} call={call} />)}
            </div>
          </section>
        </div>

        {/* Why this matters */}
        <div className="bg-[#475569] rounded-3xl p-6 text-white flex items-center justify-between gap-6 flex-wrap">
          <div className="max-w-xl">
            <h3 className="text-lg font-medium mb-1">Why real estate needs proactive AI</h3>
            <p className="text-sm text-white/85">
              70% of real estate leads go cold within 24 hours if not followed up. Human sales teams can't call every lead instantly — especially at night or on weekends. AI Voice ensures every lead gets a personal, knowledgeable call within minutes of showing intent.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-xs flex items-center gap-1.5">
              <Clock className="size-3" /> Responds in &lt;2 min
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-xs flex items-center gap-1.5">
              <MapPin className="size-3" /> Knows all projects
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-xs flex items-center gap-1.5">
              <FileText className="size-3" /> Books site visits
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium flex items-center gap-1.5">
              <TrendingUp className="size-3" /> Converts at {conversionRate}%
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

const StatCard = ({
  label,
  value,
  sublabel,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) => (
  <div className="rounded-2xl border border-gray-100 p-3">
    <div className="flex items-center gap-2 mb-1">
      <div className={cn("size-7 rounded-lg flex items-center justify-center", bg)}>
        <Icon className={cn("size-3.5", color)} />
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
    <p className="text-xl font-medium text-gray-800 tabular-nums">{value}</p>
    {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
  </div>
);

const RuleCard = ({
  icon: Icon,
  color,
  bg,
  title,
  description,
  fired,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  title: string;
  description: string;
  fired: number;
}) => (
  <div className="rounded-2xl border border-gray-100 p-3">
    <div className="flex items-start gap-3">
      <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0", bg)}>
        <Icon className={cn("size-4", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
          {fired > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-[#475569]/20 text-[#475569] font-medium tabular-nums">{fired}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 leading-snug">{description}</p>
      </div>
    </div>
  </div>
);

const CallCard = ({ call }: { call: CallEvent }) => {
  const isCalling = call.outcome === "calling";
  const isConverted = call.outcome === "converted";
  const isDeclined = call.outcome === "declined";

  return (
    <div className="rounded-2xl border border-gray-100 p-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-start gap-3 mb-2">
        <div className={cn(
          "size-9 rounded-xl flex items-center justify-center shrink-0",
          isCalling && "bg-[#475569]/20",
          isConverted && "bg-[#475569]/20",
          isDeclined && "bg-gray-100"
        )}>
          {isCalling && <PhoneIncoming className="size-4 text-[#475569] animate-pulse" />}
          {isConverted && <CheckCircle2 className="size-4 text-[#475569]" />}
          {isDeclined && <XCircle className="size-4 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-medium text-gray-800 truncate">{call.signal.customerName}</p>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              isCalling && "bg-[#475569]/20 text-[#475569]",
              isConverted && "bg-[#475569]/20 text-[#1e293b]",
              isDeclined && "bg-gray-100 text-gray-500"
            )}>
              {isCalling && "Calling..."}
              {isConverted && "Visit Booked"}
              {isDeclined && "Not now"}
            </span>
          </div>
          <p className="text-xs text-gray-500">{call.signal.project}</p>
        </div>
      </div>
      <div className="text-xs text-gray-600 bg-[#475569]/20 rounded-xl p-2 italic">
        &ldquo;{call.pitch}&rdquo;
      </div>
      {call.customerReply && (
        <div className={cn(
          "text-xs mt-2 rounded-xl p-2 italic",
          isConverted ? "bg-[#475569]/20 text-[#1e293b]" : "bg-gray-50 text-gray-500"
        )}>
          <span className="font-medium not-italic">{call.signal.customerName.split(" ")[0]}: </span>
          &ldquo;{call.customerReply}&rdquo;
        </div>
      )}
      {isConverted && (
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-gray-500">Pipeline added</span>
          <span className="font-medium text-[#475569]">+{formatCrore(call.signal.estimatedValue)}</span>
        </div>
      )}
    </div>
  );
};
