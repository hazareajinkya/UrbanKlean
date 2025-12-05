"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/clients/query-client";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { DemoModalProvider } from "@/components/landing/demo-modal";

interface ClientProviderProps {
  children: React.ReactNode;
}

export const ClientProvider = ({ children }: ClientProviderProps) => {
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
