import { clsx, type ClassValue } from "clsx";

import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { NextRequest } from "next/server";
import { collection, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "./clients/firebase";
import { IPerson } from "./types/person";
import { IAction } from "./types/actions";
import { tool, ToolSet } from "ai";
import z from "zod";
import { executeAPIAction } from "./utils/api-actions-utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleError(error: Error) {
  console.log("error: ", error);
  toast.error(error.message);
}

export function formatDate(date?: string) {
  if (!date) return "";
  return format(new Date(date), "dd MMM yyyy");
}

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

export const getRandomAvatar = (num?: number) => {
  const randomNumber = num ?? Math.floor(Math.random() * 16) + 1;
  return `https://firebasestorage.googleapis.com/v0/b/algotify-972f2.firebasestorage.app/o/face-avatar-2%2Favatar-${randomNumber}.png?alt=media&token=607149f6-5e3d-439d-aa3d-da34219143e9`;
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
  hour: number
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

export const getCustomTools = (actions: IAction[]): ToolSet => {
  return actions.reduce((acc, action) => {
    acc[action.slug] = tool({
      name: action.name,
      description: action.description,
      inputSchema: z.object({
        ...action.inputs.reduce((acc: Record<string, any>, input) => {
          acc[input.key] = z.string().describe(input.description || "");
          return acc;
        }, {} as Record<string, any>),
      }),
      execute: async (params) => {
        return executeAPIAction(action, params);
      },
    });
    return acc;
  }, {} as ToolSet);
};
