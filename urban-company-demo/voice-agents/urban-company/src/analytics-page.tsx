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
  Languages,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
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

// Monochrome palette — black, white, grays
const PRI = "#1a1a1a";
const PRI2 = "#555555";
const PRI3 = "#333333";
const GREEN = "#525252";
const RED = "#9ca3af";
const SLATE = "#6b7280";
const BLUE = "#374151";
const PINK = "#6b7280";
const VIOLET = "#4b5563";

// 7-day tag trend data (Urban Company scale)
const TAG_TRENDS = [
  { date: "Apr 21", booking_completed: 98, callback_requested: 41, out_of_area: 18, refund_request: 8, complaint: 11, feedback_positive: 89 },
  { date: "Apr 22", booking_completed: 117, callback_requested: 52, out_of_area: 22, refund_request: 11, complaint: 9, feedback_positive: 108 },
  { date: "Apr 23", booking_completed: 89, callback_requested: 38, out_of_area: 16, refund_request: 7, complaint: 14, feedback_positive: 82 },
  { date: "Apr 24", booking_completed: 148, callback_requested: 61, out_of_area: 28, refund_request: 13, complaint: 10, feedback_positive: 136 },
  { date: "Apr 25", booking_completed: 162, callback_requested: 69, out_of_area: 24, refund_request: 9, complaint: 12, feedback_positive: 149 },
  { date: "Apr 26", booking_completed: 194, callback_requested: 78, out_of_area: 31, refund_request: 11, complaint: 13, feedback_positive: 181 },
  { date: "Apr 27", booking_completed: 178, callback_requested: 64, out_of_area: 27, refund_request: 9, complaint: 11, feedback_positive: 164 },
];

const TOP_TAGS = [
  { name: "booking_completed", count: 986 },
  { name: "feedback_positive", count: 909 },
  { name: "callback_requested", count: 403 },
  { name: "out_of_area", count: 166 },
  { name: "complaint", count: 80 },
  { name: "refund_request", count: 68 },
  { name: "language_hindi", count: 61 },
  { name: "vip_customer", count: 48 },
  { name: "after_hours", count: 37 },
  { name: "competitor_mention", count: 14 },
];

const SENTIMENT = [
  { name: "Positive", value: 1089, color: GREEN },
  { name: "Neutral", value: 341, color: SLATE },
  { name: "Negative", value: 97, color: RED },
];

const LEAD_FUNNEL = [
  { stage: "Calls Received", count: 1527, color: PRI },
  { stage: "Engaged", count: 1348, color: PRI2 },
  { stage: "Quoted", count: 1189, color: "#8b5cf6" },
  { stage: "Confirmed", count: 986, color: GREEN },
  { stage: "Paid", count: 928, color: "#6ee7b7" },
];

const PEAK_HOURS = [
  { hour: "6 AM", calls: 8 },
  { hour: "7 AM", calls: 24 },
  { hour: "8 AM", calls: 71 },
  { hour: "9 AM", calls: 138 },
  { hour: "10 AM", calls: 182 },
  { hour: "11 AM", calls: 201 },
  { hour: "12 PM", calls: 163 },
  { hour: "1 PM", calls: 122 },
  { hour: "2 PM", calls: 89 },
  { hour: "3 PM", calls: 64 },
  { hour: "4 PM", calls: 78 },
  { hour: "5 PM", calls: 97 },
  { hour: "6 PM", calls: 114 },
  { hour: "7 PM", calls: 88 },
  { hour: "8 PM", calls: 51 },
  { hour: "9 PM", calls: 26 },
];

const SERVICE_MIX = [
  { name: "Home Cleaning", value: 412, color: PRI },
  { name: "Salon at Home", value: 318, color: PRI2 },
  { name: "AC Service", value: 184, color: BLUE },
  { name: "Appliance Repair", value: 112, color: VIOLET },
  { name: "Painting", value: 58, color: PINK },
  { name: "Pest Control", value: 31, color: GREEN },
];

const SOCIETIES = [
  { name: "My Home Mangala, Kondapur", bookings: 201, change: +18 },
  { name: "Aparna Cyber Zone, Gachibowli", bookings: 174, change: +12 },
  { name: "Sumadhura Horizon, Kondapur", bookings: 148, change: +29 },
  { name: "Prestige Ivy League, Kokapet", bookings: 132, change: +7 },
  { name: "GHR Titania, Gachibowli", bookings: 109, change: -5 },
  { name: "My Home Bhooja, Hi-Tech City", bookings: 94, change: +21 },
  { name: "Aparna Sarovar, Nallagandla", bookings: 87, change: +11 },
];

const LANGUAGES = [
  { name: "English", value: 894, color: PRI },
  { name: "Hindi", value: 412, color: PRI2 },
  { name: "Telugu", value: 178, color: BLUE },
  { name: "Tamil", value: 38, color: PINK },
  { name: "Kannada", value: 22, color: GREEN },
];

export default function UrbanCompanyAnalyticsPage() {
  const totalSentiment = SENTIMENT.reduce((sum, s) => sum + s.value, 0);
  const positivePct = Math.round((SENTIMENT[0].value / totalSentiment) * 100);
  const neutralPct = Math.round((SENTIMENT[1].value / totalSentiment) * 100);
  const negativePct = Math.round((SENTIMENT[2].value / totalSentiment) * 100);

  const peakHour = PEAK_HOURS.reduce((max, h) => (h.calls > max.calls ? h : max), PEAK_HOURS[0]);
  const conversionRate = Math.round((LEAD_FUNNEL[4].count / LEAD_FUNNEL[0].count) * 100);

  const tooltipStyle = {
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.1)",
    backgroundColor: "#111111",
    color: "#f9fafb",
    fontSize: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-black border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <span className="text-black font-black text-sm tracking-tight">UC</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">URBAN COMPANY</h1>
              <p className="text-xs text-white/40">AI Analytics Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white/[0.08] rounded-full p-0.5">
              <Link href="/demo/urban-company" className="px-3 py-1 rounded-full text-xs font-medium text-white/50 hover:text-white transition-colors">Voice Demo</Link>
              <Link href="/demo/urban-company/triggers" className="px-3 py-1 rounded-full text-xs font-medium text-white/50 hover:text-white flex items-center gap-1 transition-colors">
                <Bell className="size-3" />Triggers
              </Link>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-black flex items-center gap-1">
                <BarChart3 className="size-3" />Analytics
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.08] text-white/60 flex items-center gap-1.5">
              <Calendar className="size-3" />Last 7 days
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-6">
        {/* Hero KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard label="Total Calls" value="1,527" change="+22%" positive icon={Phone} color="text-white" bg="bg-white/10" />
          <KpiCard label="Bookings" value="928" change={`${conversionRate}% conversion`} positive icon={CheckCircle2} color="text-white" bg="bg-white/10" />
          <KpiCard label="Revenue" value="₹11.4L" change="+₹1.8L vs last week" positive icon={IndianRupee} color="text-white" bg="bg-white/10" />
          <KpiCard label="Avg Call Time" value="2:06" change="−22s vs human" positive icon={Clock} color="text-white" bg="bg-white/10" />
          <KpiCard label="Lost / Missed" value="0" change="vs ~142 last week" positive icon={AlertCircle} color="text-white" bg="bg-white/10" />
        </div>

        {/* Tag Trends + Top Tags */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="7-Day Tag Trends" subtitle="How conversation tags are evolving">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={TAG_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: "#9ca3af" }} iconType="circle" />
                <Line type="monotone" dataKey="booking_completed" stroke="#ffffff" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="feedback_positive" stroke="#9ca3af" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="callback_requested" stroke="#6b7280" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="out_of_area" stroke="#4b5563" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="complaint" stroke="#374151" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Conversation Tags" subtitle="Auto-extracted by AI from each call">
            <div className="space-y-2">
              {TOP_TAGS.map((tag) => {
                const max = TOP_TAGS[0].count;
                const pct = (tag.count / max) * 100;
                return (
                  <div key={tag.name} className="flex items-center gap-3 group">
                    <span className="text-xs text-white/40 w-44 truncate font-medium">{tag.name}</span>
                    <div className="flex-1 h-6 bg-white/[0.06] rounded-md overflow-hidden relative">
                      <div className="h-full bg-white/80 rounded-md transition-all duration-700 group-hover:bg-white" style={{ width: `${pct}%` }} />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-black/70 tabular-nums">{tag.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* Sentiment + Lead Funnel + Language */}
        <div className="grid lg:grid-cols-3 gap-6">
          <ChartCard title="Sentiment Analysis" subtitle="Detected from voice tone & content">
            <div className="flex items-center justify-center mb-3">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={SENTIMENT} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={3}>
                    {SENTIMENT.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <SentimentRow icon={Smile} label="Positive" pct={positivePct} count={SENTIMENT[0].value} color="#9ca3af" bg="bg-white/10" />
              <SentimentRow icon={Meh} label="Neutral" pct={neutralPct} count={SENTIMENT[1].value} color="#6b7280" bg="bg-white/[0.06]" />
              <SentimentRow icon={Frown} label="Negative" pct={negativePct} count={SENTIMENT[2].value} color="#374151" bg="bg-white/[0.04]" />
            </div>
          </ChartCard>

          <ChartCard title="Lead Funnel" subtitle="Call → confirmed booking">
            <div className="space-y-2">
              {LEAD_FUNNEL.map((stage, i) => {
                const max = LEAD_FUNNEL[0].count;
                const pct = (stage.count / max) * 100;
                const dropOff = i > 0 ? LEAD_FUNNEL[i - 1].count - stage.count : 0;
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                      <span className="font-medium text-white/60">{stage.stage}</span>
                      <span className="tabular-nums">
                        {stage.count.toLocaleString("en-IN")}
                        {dropOff > 0 && <span className="text-white/20 ml-2">−{dropOff}</span>}
                      </span>
                    </div>
                    <div className="h-8 bg-white/[0.06] rounded-md overflow-hidden">
                      <div className="h-full rounded-md transition-all duration-700 flex items-center justify-end pr-3 text-xs font-medium text-black"
                        style={{ width: `${pct}%`, backgroundColor: stage.color === PRI ? "#ffffff" : stage.color }}>
                        {Math.round(pct)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.08] text-center">
              <p className="text-xs text-white/30 mb-1">Overall conversion</p>
              <p className="text-2xl font-medium text-white tabular-nums">{conversionRate}%</p>
            </div>
          </ChartCard>

          <ChartCard title="Language Usage" subtitle="What customers prefer to speak in">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={LANGUAGES} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                  label={({ name, percent }: { name: string; percent: number }) => percent > 0.05 ? `${name}` : ""}
                  labelLine={false}>
                  {LANGUAGES.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {LANGUAGES.map((lang) => (
                <div key={lang.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                    <span className="text-white/50">{lang.name}</span>
                  </div>
                  <span className="text-white/30 tabular-nums">{lang.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Peak Hours + Service Mix */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard title="Peak Hours" subtitle={`Busiest at ${peakHour.hour} (${peakHour.calls} calls)`}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={PEAK_HOURS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="calls" radius={[6, 6, 0, 0]}>
                    {PEAK_HOURS.map((entry) => (
                      <Cell key={entry.hour} fill={entry.calls > 120 ? "#ffffff" : entry.calls > 60 ? "#9ca3af" : "rgba(255,255,255,0.2)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 text-xs text-white/30 mt-2 pt-3 border-t border-white/[0.08]">
                <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-white" />Peak (120+)</div>
                <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-gray-400" />Busy (60+)</div>
                <div className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-white/20" />Normal</div>
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Service Mix" subtitle="What customers booked">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={SERVICE_MIX} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {SERVICE_MIX.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {SERVICE_MIX.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-white/50 truncate">{s.name}</span>
                  </div>
                  <span className="text-white/30 tabular-nums shrink-0 ml-2">{s.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Society heatmap + AI Insights */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard title="Top Societies" subtitle="Where bookings are coming from">
              <div className="space-y-2">
                {SOCIETIES.map((s) => {
                  const max = SOCIETIES[0].bookings;
                  const pct = (s.bookings / max) * 100;
                  return (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="text-sm text-white/50 w-64 truncate">{s.name}</span>
                      <div className="flex-1 h-7 bg-white/[0.06] rounded-md overflow-hidden relative">
                        <div className="h-full bg-white/80 rounded-md transition-all duration-700" style={{ width: `${pct}%` }} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-black/70 tabular-nums">{s.bookings}</span>
                      </div>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium tabular-nums w-14 text-center shrink-0",
                        s.change > 0 ? "bg-white/15 text-white/80" : "bg-white/[0.06] text-white/40")}>
                        {s.change > 0 ? `+${s.change}%` : `${s.change}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>

          <ChartCard title="AI Insights" subtitle="Auto-generated takeaways" badge={<Sparkles className="size-3.5" />}>
            <div className="space-y-3">
              <InsightCard icon={TrendingUp} color="text-white/70" bg="bg-white/10"
                text="Bookings up 22% week-over-week; Sumadhura Horizon leading with +29% growth." />
              <InsightCard icon={Languages} color="text-white/70" bg="bg-white/10"
                text="Hindi requests up 41% — 27% of customers prefer a regional language." />
              <InsightCard icon={AlertCircle} color="text-white/60" bg="bg-white/[0.06]"
                text="GHR Titania dropping (−5%). 31 callers requested service — strong expansion signal." />
              <InsightCard icon={Clock} color="text-white/70" bg="bg-white/10"
                text="11 AM peak: AI handled all 201 calls flawlessly. Previous capacity was 40/hr." />
              <InsightCard icon={PhoneIncoming} color="text-white/70" bg="bg-white/10"
                text="Smart Triggers added 97 outbound bookings — 10.5% incremental revenue this week." />
            </div>
          </ChartCard>
        </div>

        {/* Footer impact strip */}
        <div className="bg-white rounded-3xl p-6 text-black grid grid-cols-2 lg:grid-cols-4 gap-6">
          <ImpactStat label="Calls Never Missed" value="1,527" sub="vs ~1,340 handled by humans last week" />
          <ImpactStat label="Revenue Recovered" value="₹1.8L" sub="from off-hours & peak-time leakage" />
          <ImpactStat label="Customer Wait Time" value="0s" sub="vs 4.8 min average earlier" />
          <ImpactStat label="Languages Spoken" value="5+" sub="EN · HI · TE · TA · KN" />
        </div>
      </main>
    </div>
  );
}

const KpiCard = ({ label, value, change, positive, icon: Icon, color, bg }: {
  label: string; value: string; change: string; positive: boolean;
  icon: React.ComponentType<{ className?: string }>; color: string; bg: string;
}) => (
  <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-white/40">{label}</span>
      <div className={cn("size-7 rounded-lg flex items-center justify-center", bg)}>
        <Icon className={cn("size-3.5", color)} />
      </div>
    </div>
    <p className="text-2xl font-medium text-white tabular-nums">{value}</p>
    <p className={cn("text-xs mt-1 flex items-center gap-1", positive ? "text-white/60" : "text-white/30")}>
      {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {change}
    </p>
  </div>
);

const ChartCard = ({ title, subtitle, badge, children }: {
  title: string; subtitle?: string; badge?: React.ReactNode; children: React.ReactNode;
}) => (
  <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-5">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          {title}{badge && <span className="text-white/60">{badge}</span>}
        </h3>
        {subtitle && <p className="text-xs text-white/30 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const SentimentRow = ({ icon: Icon, label, pct, count, color, bg }: {
  icon: LucideIcon; label: string; pct: number; count: number; color: string; bg: string;
}) => (
  <div className="flex items-center gap-3">
    <div className={cn("size-8 rounded-full flex items-center justify-center shrink-0", bg)}>
      <Icon className="size-4" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50 font-medium">{label}</span>
        <span className="text-xs font-medium text-white tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
    <span className="text-xs text-white/30 tabular-nums w-10 text-right">{count}</span>
  </div>
);

const InsightCard = ({ icon: Icon, color, bg, text }: {
  icon: React.ComponentType<{ className?: string }>; color: string; bg: string; text: string;
}) => (
  <div className="rounded-xl border border-white/[0.08] p-3 flex gap-3 hover:border-white/20 transition-all">
    <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", bg)}>
      <Icon className={cn("size-4", color)} />
    </div>
    <p className="text-xs text-white/40 leading-relaxed">{text}</p>
  </div>
);

const ImpactStat = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div>
    <p className="text-xs text-black/50 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-2xl font-medium tabular-nums text-black">{value}</p>
    <p className="text-xs text-black/50 mt-1">{sub}</p>
  </div>
);
