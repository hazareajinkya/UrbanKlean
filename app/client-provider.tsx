"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/clients/query-client";
import { SessionProvider } from "next-auth/react";

interface ClientProviderProps {
  children: React.ReactNode;
}

export const ClientProvider = ({ children }: ClientProviderProps) => {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </SessionProvider>
  );
};
