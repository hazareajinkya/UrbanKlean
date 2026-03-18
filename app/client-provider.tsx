"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/clients/query-client";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { DemoModalProvider } from "@/components/landing/demo-modal";
import { useEffect, Suspense } from "react";
import { useFirebaseAnalytics } from "@/lib/hooks/analytics/use-firebase-analytics";
1;
interface ClientProviderProps {
  children: React.ReactNode;
}

const AnalyticsTracker = () => {
  useFirebaseAnalytics();
  return null;
};

export const ClientProvider = ({ children }: ClientProviderProps) => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const visitKey = "mcx_has_visited";
    if (localStorage.getItem(visitKey)) return;
    localStorage.clear();
    localStorage.setItem(visitKey, "true");
  }, []);
  return (
    <SessionProvider>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <DemoModalProvider>
            <Suspense fallback={null}>
              <AnalyticsTracker />
            </Suspense>
            {children}
            <Toaster position="top-right" richColors />
          </DemoModalProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </SessionProvider>
  );
};
