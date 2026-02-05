"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/clients/query-client";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { DemoModalProvider } from "@/components/landing/demo-modal";
import { useEffect } from "react";

interface ClientProviderProps {
  children: React.ReactNode;
}

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
            {children}
            <Toaster position="top-right" richColors />
          </DemoModalProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </SessionProvider>
  );
};
