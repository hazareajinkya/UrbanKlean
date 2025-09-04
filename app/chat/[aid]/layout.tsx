"use client";

import { useAgent } from "@/lib/hooks/agent/use-agent";
import { useSession } from "@/lib/hooks/session/use-session";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { aid } = useParams() as { aid: string };
  const { agent, isLoading, error } = useAgent(aid);

  if (isLoading) {
    return (
      <div className="h-screen">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error loading agent</div>
        </div>
      </div>
    );
  }

  return <div className="h-screen">{children}</div>;
}
