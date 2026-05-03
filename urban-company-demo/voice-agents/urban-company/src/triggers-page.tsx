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
  Pizza,
  ShoppingBag,
  Building2,
  Calendar,
  RefreshCw,
  PartyPopper,
  Users,
  TrendingUp,
  IndianRupee,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SignalSource = "zomato" | "blinkit" | "mygate" | "pattern" | "calendar";

type Signal = {
  id: string;
  source: SignalSource;
  customerName: string;
  society: string;
  trigger: string;
  detail: string;
  suggestedService: string;
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
  zomato: { label: "Zomato", icon: Pizza, color: "text-red-500", bg: "bg-red-50" },
  blinkit: { label: "Blinkit", icon: ShoppingBag, color: "text-yellow-600", bg: "bg-yellow-50" },
  mygate: { label: "MyGate", icon: Building2, color: "text-blue-500", bg: "bg-blue-50" },
  pattern: { label: "Booking Pattern", icon: RefreshCw, color: "text-[#7c3aed]", bg: "bg-purple-50" },
  calendar: { label: "Calendar", icon: Calendar, color: "text-green-600", bg: "bg-green-50" },
};

const SIGNAL_TEMPLATES: Omit<Signal, "id" | "timestamp">[] = [
  {
    source: "zomato",
    customerName: "Ajinkya Sharma",
    society: "My Home Mangala, Kondapur",
    trigger: "3 late-night Zomato orders this week",
    detail: "Party detected · Sat 11:42 PM, Sun 1:15 AM, Tue 12:30 AM",
    suggestedService: "Home Deep Cleaning",
    estimatedValue: 1499,
  },
  {
    source: "mygate",
    customerName: "Divya Reddy",
    society: "Aparna Cyber Zone, Gachibowli",
    trigger: "Maid not entered society for 4 days",
    detail: "Last entry: Wed 6:14 PM · No re-entry since",
    suggestedService: "Home Cleaning — 2 Rooms",
    estimatedValue: 1298,
  },
  {
    source: "blinkit",
    customerName: "Rohan Verma",
    society: "Sumadhura Horizon, Kondapur",
    trigger: "Bulk non-veg + groceries ordered",
    detail: "Mutton 1kg, chicken 500g, masalas · 5 days ago",
    suggestedService: "Kitchen Deep Clean + Fridge",
    estimatedValue: 1399,
  },
  {
    source: "pattern",
    customerName: "Sneha Patel",
    society: "Prestige Ivy League, Kokapet",
    trigger: "Monthly AC service due",
    detail: "Last 3 months: 1st of every month · Today is the 2nd",
    suggestedService: "AC Service · 2 units",
    estimatedValue: 798,
  },
  {
    source: "calendar",
    customerName: "Karthik Iyer",
    society: "GHR Titania, Gachibowli",
    trigger: "Anniversary tomorrow",
    detail: "Calendar match · 5th anniversary detected",
    suggestedService: "Salon at Home + Full Home Cleaning",
    estimatedValue: 2799,
  },
  {
    source: "zomato",
    customerName: "Anjali Menon",
    society: "Nallagandla Heights",
    trigger: "Weekend house party detected",
    detail: "12 plates ordered · cocktails · Sat 9 PM",
    suggestedService: "Post-Party Home Cleaning",
    estimatedValue: 1999,
  },
  {
    source: "mygate",
    customerName: "Vivek Kapoor",
    society: "Aparna Sarovar, Nallagandla",
    trigger: "Guest visitor surge",
    detail: "8 visitors logged in last 48 hours",
    suggestedService: "Sofa & Carpet Cleaning",
    estimatedValue: 1799,
  },
  {
    source: "pattern",
    customerName: "Meera Krishnan",
    society: "My Home Bhooja, Hi-Tech",
    trigger: "Salon at Home due",
    detail: "Last booked: 28 days ago · typically monthly",
    suggestedService: "Salon at Home — Threading + Wax",
    estimatedValue: 999,
  },
];

const PITCHES: Record<SignalSource, (s: Signal) => string> = {
  zomato: (s) => `Hi ${s.customerName.split(" ")[0]}! Looks like you had a busy weekend with friends. Want me to book a ${s.suggestedService.toLowerCase()} for tomorrow morning? As a UC member you get 15% off!`,
  blinkit: (s) => `Hi ${s.customerName.split(" ")[0]}! Noticed you stocked up on non-veg last week. Should I book a ${s.suggestedService.toLowerCase()} this weekend?`,
  mygate: (s) => `Hi ${s.customerName.split(" ")[0]}! Saw your maid hasn't been by in a few days. Want me to book an Urban Company home cleaning today? Same time as usual?`,
  pattern: (s) => `Hi ${s.customerName.split(" ")[0]}! Your monthly ${s.suggestedService.toLowerCase()} is due. Want to book it now with your loyalty discount applied? Just say yes!`,
  calendar: (s) => `Hi ${s.customerName.split(" ")[0]}! Big day tomorrow! Want me to book a ${s.suggestedService.toLowerCase()} today so everything is perfect for the celebration?`,
};

const REPLIES: { positive: string[]; negative: string[] } = {
  positive: [
    "Yes, please go ahead!",
    "Perfect, book it.",
    "Wow, you read my mind. Yes.",
    "Sure, that works.",
    "Yes, send the payment link.",
  ],
  negative: [
    "Not today, maybe next week.",
    "Already handled it, thanks.",
    "I'll think about it.",
  ],
};

export default function UrbanCompanyTriggersPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [callEvents, setCallEvents] = useState<CallEvent[]>([]);
  const [stats, setStats] = useState({ triggered: 0, converted: 0, revenue: 0 });
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
          const willConvert = Math.random() > 0.25;
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
            setStats(prev => ({ ...prev, converted: prev.converted + 1, revenue: prev.revenue + signal.estimatedValue }));
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a0033] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[#4c1d95] flex items-center justify-center shadow-lg shadow-[#4c1d95]/40">
              <span className="text-white font-black text-sm tracking-tight">UC</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">URBAN COMPANY</h1>
              <p className="text-xs text-white/50">Smart Triggers · Proactive AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white/[0.08] rounded-full p-0.5">
              <Link href="/demo/urban-company" className="px-3 py-1 rounded-full text-xs font-medium text-white/50 hover:text-white transition-colors">Voice Demo</Link>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#4c1d95] text-white flex items-center gap-1">
                <Bell className="size-3" />Triggers
              </span>
              <Link href="/demo/urban-company/analytics" className="px-3 py-1 rounded-full text-xs font-medium text-white/50 hover:text-white flex items-center gap-1 transition-colors">
                <BarChart3 className="size-3" />Analytics
              </Link>
            </div>
            <button onClick={() => setIsLive(!isLive)}
              className={cn("px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all",
                isLive ? "bg-[#4c1d95] text-white" : "bg-white/[0.08] text-white/50 hover:text-white")}>
              <span className={cn("size-1.5 rounded-full", isLive ? "bg-white animate-pulse" : "bg-white/50")} />
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
              <Sparkles className="size-5 text-[#7c3aed]" />
              <h2 className="text-xl font-medium text-gray-800">Be part of your customer&apos;s daily life</h2>
            </div>
            <p className="text-gray-500 text-sm">
              Don&apos;t wait for customers to call. Connected signals from Zomato, Blinkit, MyGate and behavioural patterns trigger proactive outbound AI calls — turning everyday moments into bookings.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 min-w-[420px]">
            <StatCard label="Signals Today" value={stats.triggered.toString()} icon={Zap} color="text-[#7c3aed]" bg="bg-purple-50" />
            <StatCard label="Converted" value={stats.converted.toString()} sublabel={`${conversionRate}% rate`} icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
            <StatCard label="Revenue" value={`₹${stats.revenue.toLocaleString("en-IN")}`} icon={IndianRupee} color="text-[#4c1d95]" bg="bg-purple-50" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Signal Feed */}
          <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-800">Customer Signals</h3>
                <p className="text-xs text-gray-500">Live from connected platforms</p>
              </div>
              <span className="size-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="p-4 space-y-3 min-h-[420px]">
              {signals.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  <Bell className="size-10 mx-auto mb-3 text-gray-300" />
                  Waiting for signals...
                </div>
              )}
              {signals.map((signal) => {
                const meta = SIGNAL_META[signal.source];
                const Icon = meta.icon;
                return (
                  <div key={signal.id} className="rounded-2xl border border-gray-100 p-3 hover:border-purple-200 transition-all animate-in fade-in slide-in-from-top-2 duration-500">
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
                          <span className="text-xs text-gray-600 truncate">
                            <Users className="size-3 inline mr-1" />{signal.customerName.split(" ")[0]}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">₹{signal.estimatedValue}</span>
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
              <RuleCard icon={Pizza} color="text-red-500" bg="bg-red-50" title="Late-Night Order Pattern"
                description="If 3+ Zomato orders after 11 PM in a week → suggest home deep cleaning"
                fired={signals.filter(s => s.source === "zomato").length} />
              <RuleCard icon={Building2} color="text-blue-500" bg="bg-blue-50" title="Maid Absence"
                description="If maid not entered society for 3+ days via MyGate → offer UC home cleaning"
                fired={signals.filter(s => s.source === "mygate").length} />
              <RuleCard icon={ShoppingBag} color="text-yellow-600" bg="bg-yellow-50" title="Bulk Grocery Detection"
                description="If non-veg + groceries ordered via Blinkit → suggest kitchen deep clean"
                fired={signals.filter(s => s.source === "blinkit").length} />
              <RuleCard icon={RefreshCw} color="text-[#7c3aed]" bg="bg-purple-50" title="Repeat Booking Pattern"
                description="If monthly service is due based on history → auto-suggest with loyalty discount"
                fired={signals.filter(s => s.source === "pattern").length} />
              <RuleCard icon={Calendar} color="text-green-600" bg="bg-green-50" title="Calendar Events"
                description="Birthday / anniversary detected → suggest salon at home or full cleaning"
                fired={signals.filter(s => s.source === "calendar").length} />
              <button className="w-full p-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-purple-200 hover:text-[#7c3aed] transition-all text-sm flex items-center justify-center gap-2">
                <Sparkles className="size-4" />Add custom trigger
              </button>
            </div>
          </section>

          {/* Outbound AI Calls */}
          <section className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-800">Outbound AI Calls</h3>
                <p className="text-xs text-gray-500">Live conversion pipeline</p>
              </div>
            </div>
            <div className="p-4 space-y-3 min-h-[420px]">
              {callEvents.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  <Phone className="size-10 mx-auto mb-3 text-gray-300" />No active calls yet
                </div>
              )}
              {callEvents.map(call => <CallCard key={call.id} call={call} />)}
            </div>
          </section>
        </div>

        {/* Footer strip */}
        <div className="bg-[#1a0033] rounded-3xl p-6 text-white flex items-center justify-between gap-6 flex-wrap">
          <div className="max-w-xl">
            <h3 className="text-lg font-medium mb-1">Why this matters</h3>
            <p className="text-sm text-white/70">Most service businesses lose leads to peak-hour congestion or off-hours. Smart Triggers turn passive customers into active bookings — without a single human dial.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs flex items-center gap-1.5"><Clock className="size-3" /> Runs 24×7</span>
            <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs flex items-center gap-1.5"><PartyPopper className="size-3" /> No human required</span>
            <span className="px-3 py-1.5 rounded-full bg-[#4c1d95] text-white text-xs font-medium flex items-center gap-1.5">
              <TrendingUp className="size-3" /> Converts at {conversionRate}%
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

const StatCard = ({ label, value, sublabel, icon: Icon, color, bg }: {
  label: string; value: string; sublabel?: string;
  icon: React.ComponentType<{ className?: string }>; color: string; bg: string;
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

const RuleCard = ({ icon: Icon, color, bg, title, description, fired }: {
  icon: React.ComponentType<{ className?: string }>; color: string; bg: string;
  title: string; description: string; fired: number;
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
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium tabular-nums">{fired}</span>
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
        <div className={cn("size-9 rounded-xl flex items-center justify-center shrink-0",
          isCalling && "bg-purple-50", isConverted && "bg-green-50", isDeclined && "bg-gray-100")}>
          {isCalling && <PhoneIncoming className="size-4 text-[#7c3aed] animate-pulse" />}
          {isConverted && <CheckCircle2 className="size-4 text-green-600" />}
          {isDeclined && <XCircle className="size-4 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-medium text-gray-800 truncate">{call.signal.customerName}</p>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
              isCalling && "bg-purple-100 text-purple-700",
              isConverted && "bg-green-100 text-green-700",
              isDeclined && "bg-gray-100 text-gray-500")}>
              {isCalling && "Calling..."}{isConverted && "Booked"}{isDeclined && "Passed"}
            </span>
          </div>
          <p className="text-xs text-gray-500">{call.signal.suggestedService}</p>
        </div>
      </div>
      <div className="text-xs text-gray-600 bg-purple-50 rounded-xl p-2 italic">&ldquo;{call.pitch}&rdquo;</div>
      {call.customerReply && (
        <div className={cn("text-xs mt-2 rounded-xl p-2 italic",
          isConverted ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500")}>
          <span className="font-medium not-italic">{call.signal.customerName.split(" ")[0]}: </span>
          &ldquo;{call.customerReply}&rdquo;
        </div>
      )}
      {isConverted && (
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-gray-500">Booking confirmed</span>
          <span className="font-medium text-green-600">+₹{call.signal.estimatedValue}</span>
        </div>
      )}
    </div>
  );
};
