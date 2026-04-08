import { clsx, type ClassValue } from "clsx";

import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { NextRequest } from "next/server";
import { collection, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "./clients/firebase";
import { IPerson } from "./types/person";
import { IAction, IActionInput } from "./types/actions";
import { tool, ToolSet } from "ai";
import z from "zod";
import { executeAPIAction } from "./utils/api-actions-utils";
import { v4 } from "uuid";
import axios from "axios";
import { WHITELISTED_EMAILS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleError(error: Error) {
  console.log("error: ", error);
  toast.error(error.message);
}

export const copyShareUrl = async (aid: string): Promise<boolean> => {
  const url = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/share/${aid}`;
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard");
    return true;
  } catch {
    toast.error("Failed to copy");
    return false;
  }
};

export function formatDate(date?: string) {
  if (!date) return "";
  return format(new Date(date), "dd MMM yyyy");
}

export function getNextMonthFirstDay() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

export const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function formatTime(date?: string) {
  if (!date) return "";
  return format(new Date(date), "hh:mm a");
}
export function formatDateTime(date?: string) {
  if (!date) return "";
  return format(new Date(date), "dd MMM yyyy hh:mm a");
}

export function formatAgentTime(date?: string) {
  if (!date) return "";
  const inputDate = new Date(date);
  const now = new Date();

  const msDifference = now.getTime() - inputDate.getTime();
  const msInDay = 24 * 60 * 60 * 1000;

  if (msDifference > msInDay) {
    return format(inputDate, "dd MMM yy");
  }
  return format(inputDate, "hh:mm a");
}

export const formatHistoryDateTime = (date?: string) => {
  if (!date) return "";
  const now = new Date();
  const givenDate = new Date(date);

  // Remove seconds/milliseconds for accurate same-day handling
  now.setSeconds(0, 0);
  givenDate.setSeconds(0, 0);

  const isToday =
    now.getFullYear() === givenDate.getFullYear() &&
    now.getMonth() === givenDate.getMonth() &&
    now.getDate() === givenDate.getDate();

  if (isToday) {
    return `Today, ${format(givenDate, "hh:mm a")}`;
  }

  // If yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    yesterday.getFullYear() === givenDate.getFullYear() &&
    yesterday.getMonth() === givenDate.getMonth() &&
    yesterday.getDate() === givenDate.getDate()
  ) {
    return `Yesterday, ${format(givenDate, "hh:mm a")}`;
  }

  // Otherwise, normal formatting
  return format(givenDate, "dd MMM yy hh:mm a");
};

export const getwid = () => {
  return window.location.pathname.split("/")[2] as string;
};

export const getaid = () => {
  return window.location.pathname.split("/")[4] as string;
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getContrastingColor = (hexColor: string) => {
  // Remove the hash if present
  const hex = hexColor.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance using the relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? "#000000" : "#ffffff";
};

class Latency {
  private startTime: number = 0;
  private endTime: number = 0;

  start(): void {
    this.startTime = performance.now();
  }

  end(): number {
    this.endTime = performance.now();
    console.log("latency: ", this.getLatency());
    console.log("formatted: ", this.getFormattedLatency());

    return this.getLatency();
  }

  getLatency(): number {
    return this.endTime - this.startTime;
  }

  getFormattedLatency(): string {
    const latency = this.getLatency();
    return latency < 1000
      ? `${latency.toFixed(2)}ms`
      : `${(latency / 1000).toFixed(2)}s`;
  }

  reset(): void {
    this.startTime = 0;
    this.endTime = 0;
  }
}

export const latency = new Latency();

export const normEmail = (e?: string) =>
  e ? e.trim().toLowerCase() : undefined;
export const normPhone = (p?: string) =>
  p ? p.replace(/[^\d+]/g, "").replace(/^00/, "+") : undefined;
export const normWord = (s: string) => s.trim().toLowerCase(); // for tags/interests
export const normNote = (s: string) => s.trim();

export const getProtocol = (req: NextRequest) => {
  const isLocalhost = req.nextUrl.origin.includes("localhost");
  const protocol = isLocalhost ? "http:" : "https:";
  return protocol;
};

// Helper function to delete collections
export const deleteCollection = async (path: string) => {
  const snap = await getDocs(collection(db, path));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
};

export const validateDomain = (domain: string): boolean => {
  if (!domain) return true;
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};
export const normalizeDomain = (value: string) => {
  if (!value) return "";
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";

  try {
    const candidate = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
    const url = new URL(candidate);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return trimmed
      .replace(/^(https?:\/\/)/, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0];
  }
};

export const checkRecentlyActive = (
  lastActivity: string,
  hour: number,
): boolean => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(lastActivity).getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < hour;
};

export const isMac = (): boolean => {
  if (typeof window === "undefined") return false;
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
};

const getInputSchema = (inputs: IActionInput[]) =>
  inputs.reduce((acc: Record<string, z.ZodTypeAny>, input) => {
    if (!input.key) return acc;
    const schema =
      input.type === "object"
        ? z.object(getInputSchema(input.children || [])).passthrough()
        : input.type === "number"
          ? z.coerce.number()
          : input.type === "boolean"
            ? z.coerce.boolean()
            : input.type === "url"
              ? z.string().url()
              : z.string();
    acc[input.key] = input.required
      ? schema.describe(input.description || "")
      : schema.describe(input.description || "").optional();
    return acc;
  }, {});

export const generateForwardingEmail = () => {
  const prefix = "magical";
  const id = v4().replace(/-/g, "").slice(0, 6); // short, clean
  return `${prefix}+${id}@magicalcx-mail.com`;
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export const formatPhone = (phone?: string) => {
  if (!phone) return "";

  return phone;
};

export const getPrimaryEmail = (person: IPerson) => {
  return person.emails?.[0] || "";
};

export const getPrimaryPhone = (person: IPerson) => {
  return person.phones?.[0] || "";
};

export const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
};

export const fromSlug = (slug: string) => {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

// Blocked personal email domains (prevent spam signups)
export const BLOCKED_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "yahoo.co.in",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "yandex.com",
  "mail.com",
  "gmx.com",
  "gmx.net",
  "inbox.com",
  "fastmail.com",
  "tutanota.com",
  "rediffmail.com",
];

// Blocked major company domains (prevent test/spam signups)
export const BLOCKED_COMPANY_DOMAINS = [
  "google.com",
  "amazon.com",
  "microsoft.com",
  "youtube.com",
  "apple.com",
  "instagram.com",
  "tiktok.com",
  "bytedance.com",
  "paypal.com",
  "stripe.com",
  "shopify.com",
  "tesla.com",
  "nvidia.com",
  "samsung.com",
  "alibaba.com",
  "tencent.com",
  "baidu.com",
  "facebook.com",
  "meta.com",
  "netflix.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "uber.com",
  "airbnb.com",
  "salesforce.com",
  "oracle.com",
  "ibm.com",
  "intel.com",
  "adobe.com",
  "spotify.com",
  "snap.com",
];

export const isBlockedEmailDomain = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return BLOCKED_EMAIL_DOMAINS.includes(domain);
};

export const isBlockedCompanyDomain = (domain: string): boolean => {
  const normalized = normalizeDomain(domain).toLowerCase();
  if (!normalized) return false;
  return BLOCKED_COMPANY_DOMAINS.some(
    (blocked) => normalized === blocked || normalized.endsWith(`.${blocked}`),
  );
};

export const getEmotionIcon = (
  sentiment: "positive" | "negative" | "neutral",
) => {
  switch (sentiment) {
    case "positive":
      return "😊";
    case "negative":
      return "😞";
    case "neutral":
      return "🙂";
  }
};

export const normIp = (ip: string): string => {
  if (ip.startsWith("::ffff:")) {
    return ip.replace("::ffff:", "");
  }
  // Remove IPv6 loopback mapping (::1)
  if (ip === "::1") {
    return "127.0.0.1";
  }
  return ip;
};

export const getClientIpFromApi = async (): Promise<string | undefined> => {
  try {
    const response = await axios.get("/api/client-ip", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      return undefined;
    }

    const data = response.data;

    if (data.success && data.data?.ip) {
      return data.data.ip;
    }

    return undefined;
  } catch (error) {
    console.error("Failed to fetch client IP:", error);
    return undefined;
  }
};
export const getClientIp = (req: Request | { headers: Headers }): string => {
  // Check x-forwarded-for (most common, contains comma-separated list)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP from the comma-separated list (original client IP)
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return normIp(firstIp);
  }

  // Check x-real-ip (direct client IP)
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return normIp(realIp);

  // Check cf-connecting-ip (Cloudflare)
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return normIp(cfIp);

  // Check x-vercel-forwarded-for (Vercel-specific)
  const vercelIp = req.headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    const firstVercelIp = vercelIp.split(",")[0]?.trim();
    if (firstVercelIp) return normIp(firstVercelIp);
  }

  // If there is no ip use vercel ip function

  return "unknown";
};

export const generateToken = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const part1 = Array.from({ length: 4 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
  const part2 = Array.from({ length: 4 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
  return `${part1}-${part2}`;
};

export const stripUndefined = <T extends object>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  ) as T;

export const exportUsageData = (
  usageData: {
    createdAt: string;
    eventType: string;
    metadata?: { model?: string; tokenUsage?: number };
    amount: number;
    aid?: string | null;
    sessionId?: string | null;
  }[],
  dateRange?: { from?: Date; to?: Date },
) => {
  if (!usageData?.length) return;
  const toCsvField = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;
  const headers = [
    "Date",
    "Event Type",
    "Model",
    "Token Usage",
    "Amount",
    "Agent ID",
    "Session ID",
  ];
  const csvContent = [
    headers.map(toCsvField).join(","),
    ...usageData.map((u) =>
      [
        formatDateTime(u.createdAt),
        u.eventType,
        u.metadata?.model || "N/A",
        u.metadata?.tokenUsage?.toLocaleString() || "0",
        u.amount,
        u.aid ?? "",
        u.sessionId ?? "",
      ]
        .map(toCsvField)
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const dateStr = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "yyyy-MM-dd")}-to-${format(dateRange.to, "yyyy-MM-dd")}`
      : format(dateRange.from, "yyyy-MM-dd")
    : "all_time";
  link.setAttribute("download", `usage-history-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const IsWhitelistedEmail = (email?: string): boolean => {
  if (!email) return false;
  return WHITELISTED_EMAILS.includes(email);
};
