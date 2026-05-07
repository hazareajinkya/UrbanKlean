"use client";

import Link from "next/link";
import {
  Bell,
  BarChart3,
  Phone,
  PhoneIncoming,
  Smile,
  Meh,
  Frown,
  TrendingUp,
  TrendingDown,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Building2,
  MapPin,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

const MYHOME_ORB_LIGHT = "#cbd5e1";
const MYHOME_BRAND = "#475569";
const MYHOME_BRAND_MID = "#334155";
const RED = MYHOME_BRAND;
const RED_LIGHT = MYHOME_BRAND_MID;
const GREEN = MYHOME_BRAND;
const ACCENT_DARK_TEXT = "#1e293b";
const RED_MUTED = "#fca5a5";
const SLATE = "#94a3b8";
const BLUE = "#3b82f6";
const AMBER = "#f59e0b";
const PURPLE = "#7c3aed";
const ORANGE = "#ea580c";

const TAG_TRENDS = [
  { date: "Apr 28", site_visit_booked: 18, lead_qualified: 32, callback_requested: 12, price_hesitation: 8, competitor_mention: 4, feedback_positive: 22 },
  { date: "Apr 29", site_visit_booked: 24, lead_qualified: 41, callback_requested: 15, price_hesitation: 10, competitor_mention: 3, feedback_positive: 29 },
  { date: "Apr 30", site_visit_booked: 19, lead_qualified: 36, callback_requested: 11, price_hesitation: 7, competitor_mention: 5, feedback_positive: 24 },
  { date: "May 1", site_visit_booked: 31, lead_qualified: 54, callback_requested: 18, price_hesitation: 11, competitor_mention: 6, feedback_positive: 38 },
  { date: "May 2", site_visit_booked: 38, lead_qualified: 62, callback_requested: 22, price_hesitation: 9, competitor_mention: 4, feedback_positive: 47 },
  { date: "May 3", site_visit_booked: 44, lead_qualified: 71, callback_requested: 24, price_hesitation: 13, competitor_mention: 7, feedback_positive: 53 },
  { date: "May 4", site_visit_booked: 37, lead_qualified: 59, callback_requested: 19, price_hesitation: 10, competitor_mention: 5, feedback_positive: 44 },
];

const TOP_TAGS = [
  { name: "lead_qualified", count: 355 },
  { name: "site_visit_booked", count: 211 },
  { name: "feedback_positive", count: 257 },
  { name: "callback_requested", count: 121 },
  { name: "price_hesitation", count: 68 },
  { name: "3bhk_interest", count: 142 },
  { name: "kokapet_preferred", count: 98 },
  { name: "competitor_mention", count: 34 },
  { name: "nri_enquiry", count: 27 },
  { name: "home_loan_query", count: 89 },
];

const SENTIMENT = [
  { name: "Positive", value: 312, color: GREEN },
  { name: "Neutral", value: 118, color: SLATE },
  { name: "Negative", value: 39, color: RED_MUTED },
];

const LEAD_FUNNEL = [
  { stage: "Enquiries Received", count: 469, color: RED },
  { stage: "Engaged (2+ min)", count: 401, color: RED_LIGHT },
  { stage: "Lead Qualified", count: 355, color: AMBER },
  { stage: "Site Visit Booked", count: 211, color: PURPLE },
  { stage: "Site Visit Attended", count: 178, color: BLUE },
  { stage: "Booking / Token", count: 47, color: GREEN },
];

const PEAK_HOURS = [
  { hour: "7 AM", calls: 8 },
  { hour: "8 AM", calls: 21 },
  { hour: "9 AM", calls: 47 },
  { hour: "10 AM", calls: 68 },
  { hour: "11 AM", calls: 79 },
  { hour: "12 PM", calls: 61 },
  { hour: "1 PM", calls: 42 },
  { hour: "2 PM", calls: 31 },
  { hour: "3 PM", calls: 28 },
  { hour: "4 PM", calls: 38 },
  { hour: "5 PM", calls: 49 },
  { hour: "6 PM", calls: 57 },
  { hour: "7 PM", calls: 52 },
  { hour: "8 PM", calls: 33 },
  { hour: "9 PM", calls: 14 },
];

const PROJECT_INTEREST = [
  { name: "My Home Grava", value: 89, color: RED },
  { name: "My Home Nishada", value: 76, color: AMBER },
  { name: "My Home Akrida", value: 64, color: BLUE },
  { name: "My Home Vipina", value: 52, color: PURPLE },
  { name: "My Home Apas", value: 44, color: ORANGE },
  { name: "Others", value: 38, color: SLATE },
];

const BUDGET_RANGE = [
  { range: "< ₹80L", leads: 48, color: SLATE },
  { range: "₹80L–1.2Cr", leads: 87, color: BLUE },
  { range: "₹1.2–1.8Cr", leads: 112, color: AMBER },
  { range: "₹1.8–2.5Cr", leads: 76, color: ORANGE },
  { range: "> ₹2.5Cr", leads: 41, color: ACCENT_DARK_TEXT },
];

const TOP_GEOGRAPHIES = [
  { name: "Gachibowli / Hi-Tech City", enquiries: 118, change: +22 },
  { name: "Kondapur / Madhapur", enquiries: 97, change: +14 },
  { name: "Kukatpally / KPHB", enquiries: 74, change: +8 },
  { name: "Banjara Hills / Jubilee", enquiries: 62, change: +5 },
  { name: "Miyapur / Bachupally", enquiries: 54, change: +11 },
  { name: "Secunderabad / Ameerpet", enquiries: 41, change: -3 },
  { name: "NRI / International", enquiries: 23, change: +31 },
];

export default function MyHomeGroupAnalyticsPage() {
  const totalSentiment = SENTIMENT.reduce((sum, s) => sum + s.value, 0);
  const positivePct = Math.round((SENTIMENT[0].value / totalSentiment) * 100);
  const neutralPct = Math.round((SENTIMENT[1].value / totalSentiment) * 100);
  const negativePct = Math.round((SENTIMENT[2].value / totalSentiment) * 100);
  const peakHour = PEAK_HOURS.reduce((max, h) => (h.calls > max.calls ? h : max), PEAK_HOURS[0]);
  const bookingRate = Math.round((LEAD_FUNNEL[5].count / LEAD_FUNNEL[0].count) * 100);
  const visitRate = Math.round((LEAD_FUNNEL[3].count / LEAD_FUNNEL[0].count) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[#475569] flex items-center justify-center shadow-md">
              <span className="text-white font-black text-xs tracking-tight">MHG</span>
            </div>
            <div>
              <h1 className="text-base font-medium text-gray-900 tracking-wide">MY HOME GROUP</h1>
              <p className="text-xs text-gray-500">AI Analytics Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-gray-100 rounded-full p-0.5">
              <Link href="/demo/my-home-group" className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors">
                Voice Demo
              </Link>
              <Link href="/demo/my-home-group/triggers" className="px-3 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors">
                <Bell className="size-3" />
                Triggers
              </Link>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#475569] text-white flex items-center gap-1">
                <BarChart3 className="size-3" />
                Analytics
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 flex items-center gap-1.5">
              <Calendar className="size-3" />
              Last 7 days
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-6">
        {/* Hero KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard label="Total Enquiries" value="469" change="+23%" positive icon={Phone} color="text-[#475569]" bg="bg-[#475569]/25" />
          <KpiCard label="Site Visits Booked" value="211" change={`${visitRate}% of enquiries`} positive icon={Building2} color="text-amber-600" bg="bg-amber-50" />
          <KpiCard label="Bookings / Token" value="47" change={`${bookingRate}% conversion`} positive icon={CheckCircle2} color="text-[#475569]" bg="bg-[#475569]/25" />
          <KpiCard label="Avg Response Time" value="< 2 min" change="−23 min vs human team" positive icon={Clock} color="text-blue-600" bg="bg-blue-50" />
          <KpiCard label="Missed Enquiries" value="0" change="vs ~94 missed last month" positive icon={AlertCircle} color="text-purple-600" bg="bg-purple-50" />
        </div>

        {/* Tag Trends + Top Tags */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="7-Day Conversation Tag Trends" subtitle="How lead quality is evolving">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={TAG_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
                <Line type="monotone" dataKey="lead_qualified" stroke={RED} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="site_visit_booked" stroke={PURPLE} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="feedback_positive" stroke={GREEN} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="callback_requested" stroke={AMBER} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="price_hesitation" stroke={ORANGE} strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Conversation Tags" subtitle="Auto-extracted by AI from each call">
            <div className="space-y-2">
              {TOP_TAGS.map(tag => {
                const max = TOP_TAGS[0].count;
                const pct = (tag.count / max) * 100;
                return (
                  <div key={tag.name} className="flex items-center gap-3 group">
                    <span className="text-xs text-gray-600 w-44 truncate font-medium">{tag.name}</span>
                    <div className="flex-1 h-6 bg-gray-50 rounded-md overflow-hidden relative">
                      <div
                        className="h-full bg-[#475569] rounded-md transition-all duration-700 group-hover:bg-[#334155]"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-700 tabular-nums">
                        {tag.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* Sentiment + Lead Funnel + Project Interest */}
        <div className="grid lg:grid-cols-3 gap-6">
          <ChartCard title="Sentiment Analysis" subtitle="Detected from voice tone & content">
            <div className="flex items-center justify-center mb-3">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={SENTIMENT} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={3}>
                    {SENTIMENT.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <SentimentRow icon={Smile} label="Positive" pct={positivePct} count={SENTIMENT[0].value} color={GREEN} bg="bg-[#475569]/25" />
              <SentimentRow icon={Meh} label="Neutral" pct={neutralPct} count={SENTIMENT[1].value} color={SLATE} bg="bg-slate-50" />
              <SentimentRow icon={Frown} label="Negative" pct={negativePct} count={SENTIMENT[2].value} color={RED_MUTED} bg="bg-red-50" />
            </div>
          </ChartCard>

          <ChartCard title="Lead Funnel" subtitle="Enquiry → Token booking">
            <div className="space-y-2">
              {LEAD_FUNNEL.map((stage, i) => {
                const max = LEAD_FUNNEL[0].count;
                const pct = (stage.count / max) * 100;
                const dropOff = i > 0 ? LEAD_FUNNEL[i - 1].count - stage.count : 0;
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="tabular-nums">
                        {stage.count.toLocaleString("en-IN")}
                        {dropOff > 0 && <span className="text-gray-400 ml-2">−{dropOff}</span>}
                      </span>
                    </div>
                    <div className="h-7 bg-gray-50 rounded-md overflow-hidden">
                      <div
                        className="h-full rounded-md transition-all duration-700 flex items-center justify-end pr-3 text-xs font-medium text-white"
                        style={{ width: `${pct}%`, backgroundColor: stage.color }}
                      >
                        {Math.round(pct)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500 mb-1">Enquiry → Booking rate</p>
              <p className="text-2xl font-medium text-[#475569] tabular-nums">{bookingRate}%</p>
            </div>
          </ChartCard>

          <ChartCard title="Project Interest" subtitle="Which projects are getting enquiries">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={PROJECT_INTEREST} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {PROJECT_INTEREST.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {PROJECT_INTEREST.map(p => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-gray-700 truncate">{p.name}</span>
                  </div>
                  <span className="text-gray-500 tabular-nums shrink-0 ml-2">{p.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Peak Hours + Budget Range */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard title="Peak Enquiry Hours" subtitle={`Busiest at ${peakHour.hour} (${peakHour.calls} calls)`}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={PEAK_HOURS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} cursor={{ fill: "rgba(154, 230, 0, 0.28)" }} />
                  <Bar dataKey="calls" radius={[6, 6, 0, 0]}>
                    {PEAK_HOURS.map(entry => (
                      <Cell key={entry.hour} fill={entry.calls > 60 ? GREEN : entry.calls > 35 ? AMBER : MYHOME_ORB_LIGHT} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ backgroundColor: RED }} />Peak (60+)</div>
                <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ backgroundColor: AMBER }} />Busy (35+)</div>
                <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ backgroundColor: MYHOME_ORB_LIGHT }} />Normal</div>
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Budget Distribution" subtitle="What buyers are willing to invest">
            <div className="space-y-3 mt-2">
              {BUDGET_RANGE.map(b => {
                const max = Math.max(...BUDGET_RANGE.map(x => x.leads));
                const pct = (b.leads / max) * 100;
                return (
                  <div key={b.range}>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span className="font-medium">{b.range}</span>
                      <span className="tabular-nums">{b.leads} leads</span>
                    </div>
                    <div className="h-6 bg-gray-50 rounded-md overflow-hidden">
                      <div className="h-full rounded-md transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: b.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* Geography + AI Insights */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard title="Top Buyer Geographies" subtitle="Where enquiries are coming from">
              <div className="space-y-2">
                {TOP_GEOGRAPHIES.map(g => {
                  const max = TOP_GEOGRAPHIES[0].enquiries;
                  const pct = (g.enquiries / max) * 100;
                  return (
                    <div key={g.name} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-64 truncate flex items-center gap-1.5">
                        <MapPin className="size-3 text-[#475569] shrink-0" />
                        {g.name}
                      </span>
                      <div className="flex-1 h-7 bg-gray-50 rounded-md overflow-hidden relative">
                        <div className="h-full bg-gradient-to-r from-[#475569] to-[#cbd5e1] rounded-md transition-all duration-700" style={{ width: `${pct}%` }} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-700 tabular-nums">{g.enquiries}</span>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium tabular-nums w-14 text-center shrink-0",
                        g.change > 0 ? "bg-[#475569]/25 text-[#1e293b]" : "bg-red-50 text-red-700"
                      )}>
                        {g.change > 0 ? `+${g.change}%` : `${g.change}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>

          <ChartCard title="AI Insights" subtitle="Auto-generated takeaways" badge={<Sparkles className="size-3.5" />}>
            <div className="space-y-3">
              <InsightCard icon={TrendingUp} color="text-[#475569]" bg="bg-[#475569]/25" text="Enquiries up 23% week-on-week — Grava driving the most interest. Recommend increasing visit slots." />
              <InsightCard icon={Users} color="text-amber-600" bg="bg-amber-50" text="NRI enquiries grew 31% — highest in 6 months. Suggests opportunity for NRI-specific outreach." />
              <InsightCard icon={AlertCircle} color="text-orange-600" bg="bg-orange-50" text="Price hesitation tag up — 68 mentions this week. Consider sharing home loan calculator in follow-up." />
              <InsightCard icon={Clock} color="text-[#475569]" bg="bg-[#475569]/25" text="Evening 5–7 PM peak rising. AI handled 158 calls in this slot. Human team previously missed ~40/day." />
              <InsightCard icon={PhoneIncoming} color="text-blue-600" bg="bg-blue-50" text="Smart triggers added 29 outbound visits booked — 13.7% of total, no human dials." />
            </div>
          </ChartCard>
        </div>

        {/* Impact strip */}
        <div className="bg-[#475569] rounded-3xl p-6 text-white grid grid-cols-2 lg:grid-cols-4 gap-6">
          <ImpactStat label="Enquiries Never Missed" value="469" sub="vs ~94 missed by human team" />
          <ImpactStat label="Pipeline Unlocked" value="₹94.2 Cr" sub="from proactive outbound calls" />
          <ImpactStat label="Avg Response Time" value="< 2 min" sub="vs 24+ hrs before AI" />
          <ImpactStat label="NRI Leads Handled" value="23" sub="Across 6 countries · No time-zone friction" />
        </div>
      </main>
    </div>
  );
}

const KpiCard = ({
  label, value, change, positive, icon: Icon, color, bg,
}: {
  label: string; value: string; change: string; positive: boolean;
  icon: React.ComponentType<{ className?: string }>; color: string; bg: string;
}) => (
  <div className="bg-white rounded-2xl shadow-sm p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-gray-500">{label}</span>
      <div className={cn("size-7 rounded-lg flex items-center justify-center", bg)}>
        <Icon className={cn("size-3.5", color)} />
      </div>
    </div>
    <p className="text-2xl font-medium text-gray-800 tabular-nums">{value}</p>
    <p className={cn("text-xs mt-1 flex items-center gap-1", positive ? "text-[#475569]" : "text-red-600")}>
      {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {change}
    </p>
  </div>
);

const ChartCard = ({
  title, subtitle, badge, children,
}: {
  title: string; subtitle?: string; badge?: React.ReactNode; children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl shadow-sm p-5">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2">
          {title}
          {badge && <span className="text-[#475569]">{badge}</span>}
        </h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const SentimentRow = ({
  icon: Icon, label, pct, count, color, bg,
}: {
  icon: LucideIcon; label: string; pct: number; count: number; color: string; bg: string;
}) => (
  <div className="flex items-center gap-3">
    <div className={cn("size-8 rounded-full flex items-center justify-center shrink-0", bg)}>
      <Icon className="size-4" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-700 font-medium">{label}</span>
        <span className="text-xs font-medium text-gray-800 tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
    <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{count}</span>
  </div>
);

const InsightCard = ({
  icon: Icon, color, bg, text,
}: {
  icon: React.ComponentType<{ className?: string }>; color: string; bg: string; text: string;
}) => (
  <div className="rounded-xl border border-gray-100 p-3 flex gap-3 hover:border-[#475569]/25 transition-all">
    <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", bg)}>
      <Icon className={cn("size-4", color)} />
    </div>
    <p className="text-xs text-gray-700 leading-relaxed">{text}</p>
  </div>
);

const ImpactStat = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div>
    <p className="text-xs text-white/80 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-2xl font-medium tabular-nums">{value}</p>
    <p className="text-xs text-white/80 mt-1">{sub}</p>
  </div>
);
