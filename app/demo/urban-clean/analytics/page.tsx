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

const PURPLE = "#6b21a8";
const YELLOW = "#facc15";
const GREEN = "#16a34a";
const RED = "#ef4444";
const SLATE = "#94a3b8";
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const ORANGE = "#f97316";

// 7-day tag trend data
const TAG_TRENDS = [
  { date: "Apr 21", booking_completed: 42, callback_requested: 18, out_of_area: 9, refund_request: 4, complaint: 6, feedback_positive: 38 },
  { date: "Apr 22", booking_completed: 51, callback_requested: 22, out_of_area: 11, refund_request: 5, complaint: 4, feedback_positive: 47 },
  { date: "Apr 23", booking_completed: 38, callback_requested: 16, out_of_area: 8, refund_request: 3, complaint: 8, feedback_positive: 35 },
  { date: "Apr 24", booking_completed: 64, callback_requested: 28, out_of_area: 14, refund_request: 6, complaint: 5, feedback_positive: 58 },
  { date: "Apr 25", booking_completed: 72, callback_requested: 31, out_of_area: 12, refund_request: 4, complaint: 7, feedback_positive: 67 },
  { date: "Apr 26", booking_completed: 89, callback_requested: 35, out_of_area: 15, refund_request: 5, complaint: 6, feedback_positive: 82 },
  { date: "Apr 27", booking_completed: 78, callback_requested: 29, out_of_area: 13, refund_request: 4, complaint: 5, feedback_positive: 71 },
];

// Top tags
const TOP_TAGS = [
  { name: "booking_completed", count: 434 },
  { name: "feedback_positive", count: 398 },
  { name: "callback_requested", count: 179 },
  { name: "out_of_area", count: 82 },
  { name: "complaint", count: 41 },
  { name: "refund_request", count: 31 },
  { name: "language_telugu", count: 28 },
  { name: "vip_customer", count: 22 },
  { name: "after_hours", count: 19 },
  { name: "competitor_mention", count: 7 },
];

// Sentiment
const SENTIMENT = [
  { name: "Positive", value: 487, color: GREEN },
  { name: "Neutral", value: 158, color: SLATE },
  { name: "Negative", value: 49, color: RED },
];

// Lead funnel
const LEAD_FUNNEL = [
  { stage: "Calls Received", count: 694, color: PURPLE },
  { stage: "Engaged", count: 612, color: "#7e22ce" },
  { stage: "Quoted", count: 521, color: "#a855f7" },
  { stage: "Confirmed", count: 434, color: YELLOW },
  { stage: "Paid", count: 408, color: GREEN },
];

// Peak hours heatmap
const PEAK_HOURS = [
  { hour: "6 AM", calls: 4 },
  { hour: "7 AM", calls: 12 },
  { hour: "8 AM", calls: 38 },
  { hour: "9 AM", calls: 62 },
  { hour: "10 AM", calls: 81 },
  { hour: "11 AM", calls: 89 },
  { hour: "12 PM", calls: 71 },
  { hour: "1 PM", calls: 54 },
  { hour: "2 PM", calls: 38 },
  { hour: "3 PM", calls: 27 },
  { hour: "4 PM", calls: 31 },
  { hour: "5 PM", calls: 42 },
  { hour: "6 PM", calls: 49 },
  { hour: "7 PM", calls: 38 },
  { hour: "8 PM", calls: 22 },
  { hour: "9 PM", calls: 11 },
];

// Service distribution
const SERVICE_MIX = [
  { name: "Bathroom Cleaning", value: 187, color: PURPLE },
  { name: "Deep Cleaning", value: 142, color: YELLOW },
  { name: "Sofa Cleaning", value: 89, color: BLUE },
  { name: "Kitchen Cleaning", value: 64, color: PINK },
  { name: "Full Home", value: 41, color: ORANGE },
  { name: "AC Service", value: 34, color: GREEN },
];

// Society heatmap
const SOCIETIES = [
  { name: "My Home Mangala, Kondapur", bookings: 89, change: +12 },
  { name: "Aparna Cyber Zone, Gachibowli", bookings: 76, change: +8 },
  { name: "Sumadhura Horizon, Kondapur", bookings: 64, change: +21 },
  { name: "Prestige Ivy League, Kokapet", bookings: 58, change: +5 },
  { name: "GHR Titania, Gachibowli", bookings: 47, change: -3 },
  { name: "My Home Bhooja, Hi-Tech", bookings: 41, change: +14 },
  { name: "Aparna Sarovar, Nallagandla", bookings: 38, change: +9 },
];

// Language usage
const LANGUAGES = [
  { name: "English", value: 412, color: PURPLE },
  { name: "Hindi", value: 156, color: YELLOW },
  { name: "Telugu", value: 98, color: BLUE },
  { name: "Tamil", value: 18, color: PINK },
  { name: "Kannada", value: 10, color: GREEN },
];

export default function AnalyticsPage() {
  const totalSentiment = SENTIMENT.reduce((sum, s) => sum + s.value, 0);
  const positivePct = Math.round((SENTIMENT[0].value / totalSentiment) * 100);
  const neutralPct = Math.round((SENTIMENT[1].value / totalSentiment) * 100);
  const negativePct = Math.round((SENTIMENT[2].value / totalSentiment) * 100);

  const peakHour = PEAK_HOURS.reduce((max, h) => (h.calls > max.calls ? h : max), PEAK_HOURS[0]);
  const conversionRate = Math.round((LEAD_FUNNEL[4].count / LEAD_FUNNEL[0].count) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#6b21a8] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-[#facc15] flex items-center justify-center shadow-md">
              <span className="text-[#6b21a8] font-black text-sm">UK</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">URBAN KLEAN</h1>
              <p className="text-xs text-white/80">AI Analytics Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white/10 rounded-full p-0.5">
              <Link
                href="/demo/urban-clean"
                className="px-3 py-1 rounded-full text-xs font-medium text-white/70 hover:text-white"
              >
                Voice Demo
              </Link>
              <Link
                href="/demo/urban-clean/triggers"
                className="px-3 py-1 rounded-full text-xs font-medium text-white/70 hover:text-white flex items-center gap-1"
              >
                <Bell className="size-3" />
                Triggers
              </Link>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#facc15] text-[#6b21a8] flex items-center gap-1">
                <BarChart3 className="size-3" />
                Analytics
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 flex items-center gap-1.5">
              <Calendar className="size-3" />
              Last 7 days
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-6">
        {/* Hero KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard
            label="Total Calls"
            value="694"
            change="+18%"
            positive
            icon={Phone}
            color="text-[#6b21a8]"
            bg="bg-purple-50"
          />
          <KpiCard
            label="Bookings"
            value="408"
            change={`${conversionRate}% conversion`}
            positive
            icon={CheckCircle2}
            color="text-green-600"
            bg="bg-green-50"
          />
          <KpiCard
            label="Revenue"
            value="₹4.82L"
            change="+₹62K vs last week"
            positive
            icon={IndianRupee}
            color="text-yellow-600"
            bg="bg-yellow-50"
          />
          <KpiCard
            label="Avg Call Time"
            value="2:14"
            change="−18s vs human"
            positive
            icon={Clock}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <KpiCard
            label="Lost / Missed"
            value="0"
            change="vs ~89 last week"
            positive
            icon={AlertCircle}
            color="text-pink-600"
            bg="bg-pink-50"
          />
        </div>

        {/* Tag Trends + Top Tags */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="7-Day Tag Trends" subtitle="How conversation tags are evolving">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={TAG_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
                <Line type="monotone" dataKey="booking_completed" stroke={PURPLE} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="feedback_positive" stroke={GREEN} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="callback_requested" stroke={YELLOW} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="out_of_area" stroke={ORANGE} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="complaint" stroke={RED} strokeWidth={2} dot={{ r: 3 }} />
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
                    <span className="text-xs text-gray-600 w-44 truncate font-medium">{tag.name}</span>
                    <div className="flex-1 h-6 bg-gray-50 rounded-md overflow-hidden relative">
                      <div
                        className="h-full bg-[#6b21a8] rounded-md transition-all duration-700 group-hover:bg-[#7e22ce]"
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

        {/* Sentiment + Lead Funnel + Language */}
        <div className="grid lg:grid-cols-3 gap-6">
          <ChartCard title="Sentiment Analysis" subtitle="Detected from voice tone & content">
            <div className="flex items-center justify-center mb-3">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={SENTIMENT}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {SENTIMENT.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <SentimentRow
                icon={Smile}
                label="Positive"
                pct={positivePct}
                count={SENTIMENT[0].value}
                color={GREEN}
                bg="bg-green-50"
              />
              <SentimentRow
                icon={Meh}
                label="Neutral"
                pct={neutralPct}
                count={SENTIMENT[1].value}
                color={SLATE}
                bg="bg-slate-50"
              />
              <SentimentRow
                icon={Frown}
                label="Negative"
                pct={negativePct}
                count={SENTIMENT[2].value}
                color={RED}
                bg="bg-red-50"
              />
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
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="tabular-nums">
                        {stage.count.toLocaleString("en-IN")}
                        {dropOff > 0 && (
                          <span className="text-gray-400 ml-2">−{dropOff}</span>
                        )}
                      </span>
                    </div>
                    <div className="h-8 bg-gray-50 rounded-md overflow-hidden">
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
              <p className="text-xs text-gray-500 mb-1">Overall conversion</p>
              <p className="text-2xl font-semibold text-[#6b21a8] tabular-nums">{conversionRate}%</p>
            </div>
          </ChartCard>

          <ChartCard title="Language Usage" subtitle="What customers prefer to speak in">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={LANGUAGES}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }: { name: string; percent: number }) =>
                    percent > 0.05 ? `${name}` : ""
                  }
                  labelLine={false}
                >
                  {LANGUAGES.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {LANGUAGES.map((lang) => (
                <div key={lang.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                    <span className="text-gray-700">{lang.name}</span>
                  </div>
                  <span className="text-gray-500 tabular-nums">{lang.value}</span>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    interval={1}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    cursor={{ fill: "rgba(107, 33, 168, 0.08)" }}
                  />
                  <Bar dataKey="calls" radius={[6, 6, 0, 0]}>
                    {PEAK_HOURS.map((entry) => (
                      <Cell
                        key={entry.hour}
                        fill={entry.calls > 60 ? YELLOW : entry.calls > 30 ? PURPLE : "#c4b5fd"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm" style={{ backgroundColor: YELLOW }} />
                  Peak (60+)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm" style={{ backgroundColor: PURPLE }} />
                  Busy (30+)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-violet-300" />
                  Normal
                </div>
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Service Mix" subtitle="What customers booked">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={SERVICE_MIX}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {SERVICE_MIX.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {SERVICE_MIX.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-gray-700 truncate">{s.name}</span>
                  </div>
                  <span className="text-gray-500 tabular-nums shrink-0 ml-2">{s.value}</span>
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
                      <span className="text-sm text-gray-700 w-64 truncate">{s.name}</span>
                      <div className="flex-1 h-7 bg-gray-50 rounded-md overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-[#6b21a8] to-[#a855f7] rounded-md transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-700 tabular-nums">
                          {s.bookings}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium tabular-nums w-14 text-center shrink-0",
                          s.change > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        )}
                      >
                        {s.change > 0 ? `+${s.change}%` : `${s.change}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>

          <ChartCard
            title="AI Insights"
            subtitle="Auto-generated takeaways"
            badge={<Sparkles className="size-3.5" />}
          >
            <div className="space-y-3">
              <InsightCard
                icon={TrendingUp}
                color="text-green-600"
                bg="bg-green-50"
                text="Bookings are up 18% week-over-week, driven by Sumadhura Horizon (+21%)."
              />
              <InsightCard
                icon={Languages}
                color="text-yellow-600"
                bg="bg-yellow-50"
                text="Hindi requests grew 34% — 22% of customers prefer non-English."
              />
              <InsightCard
                icon={AlertCircle}
                color="text-pink-600"
                bg="bg-pink-50"
                text="GHR Titania is dropping (−3%). 14 callers requested service — consider expansion."
              />
              <InsightCard
                icon={Clock}
                color="text-purple-600"
                bg="bg-purple-50"
                text="11 AM peak: AI handled all 89 calls. Last month we lost ~12 calls/day at this time."
              />
              <InsightCard
                icon={PhoneIncoming}
                color="text-blue-600"
                bg="bg-blue-50"
                text="Smart Triggers added 47 outbound bookings — 11.5% incremental revenue."
              />
            </div>
          </ChartCard>
        </div>

        {/* Footer impact strip */}
        <div className="bg-gradient-to-r from-[#6b21a8] to-[#7e22ce] rounded-3xl p-6 text-white grid grid-cols-2 lg:grid-cols-4 gap-6">
          <ImpactStat label="Calls Never Missed" value="694" sub="vs ~605 handled by humans last week" />
          <ImpactStat label="Revenue Recovered" value="₹62,400" sub="from off-hours & peak-time leakage" />
          <ImpactStat label="Customer Wait Time" value="0s" sub="vs 4.2 min average earlier" />
          <ImpactStat label="Languages Spoken" value="5+" sub="EN · HI · TE · TA · KN" />
        </div>
      </main>
    </div>
  );
}

const KpiCard = ({
  label,
  value,
  change,
  positive,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) => (
  <div className="bg-white rounded-2xl shadow-sm p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-gray-500">{label}</span>
      <div className={cn("size-7 rounded-lg flex items-center justify-center", bg)}>
        <Icon className={cn("size-3.5", color)} />
      </div>
    </div>
    <p className="text-2xl font-semibold text-gray-800 tabular-nums">{value}</p>
    <p
      className={cn(
        "text-xs mt-1 flex items-center gap-1",
        positive ? "text-green-600" : "text-red-600"
      )}
    >
      {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {change}
    </p>
  </div>
);

const ChartCard = ({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl shadow-sm p-5">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          {title}
          {badge && <span className="text-[#facc15]">{badge}</span>}
        </h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const SentimentRow = ({
  icon: Icon,
  label,
  pct,
  count,
  color,
  bg,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  pct: number;
  count: number;
  color: string;
  bg: string;
}) => (
  <div className="flex items-center gap-3">
    <div className={cn("size-8 rounded-full flex items-center justify-center shrink-0", bg)}>
      <Icon className="size-4" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-700 font-medium">{label}</span>
        <span className="text-xs font-semibold text-gray-800 tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
    <span className="text-xs text-gray-500 tabular-nums w-10 text-right">{count}</span>
  </div>
);

const InsightCard = ({
  icon: Icon,
  color,
  bg,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  text: string;
}) => (
  <div className="rounded-xl border border-gray-100 p-3 flex gap-3 hover:border-purple-200 transition-all">
    <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", bg)}>
      <Icon className={cn("size-4", color)} />
    </div>
    <p className="text-xs text-gray-700 leading-relaxed">{text}</p>
  </div>
);

const ImpactStat = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div>
    <p className="text-xs text-white/70 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-2xl font-semibold tabular-nums">{value}</p>
    <p className="text-xs text-white/60 mt-1">{sub}</p>
  </div>
);
