import { clsx, type ClassValue } from "clsx";

import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleError(error: Error) {
  console.log("error: ", error);
  toast.error(error.message);
}

export function formatDate(date: string) {
  return format(new Date(date), "dd MMM yyyy");
}

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
