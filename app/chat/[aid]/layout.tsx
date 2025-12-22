"use client";

import { useAgent } from "@/lib/hooks/agent/use-agent";
import { useParams } from "next/navigation";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { aid } = useParams() as { aid: string };
  const { agent, isLoading, error } = useAgent(aid);

  if (isLoading) {
    return <ChatLoader />;
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

const ChatLoader = () => {
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Chat Header Shimmer */}
      <div className="px-4 pr-2 py-3 bg-gray-200 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Bot icon shimmer */}
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
            {/* Agent name shimmer */}
            <div className="h-3 bg-gray-300 rounded animate-pulse w-32"></div>
          </div>
        </div>
      </div>

      <div className="flex-1"></div>
      {/* Chat Input Shimmer */}
      <div className="px-3 pb-0 pt-3">
        <div className="flex items-end gap-3">
          <div className="flex-1 border-1 relative rounded-lg">
            <div className="flex items-end gap-2 p-1 h-10">
              {/* Textarea shimmer */}
              <div className="w-full flex-1 relative">
                <div className="h-0 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Send button shimmer */}
              {/* <div className="flex-shrink-0">
                  <div className="md:w-10 md:h-10 w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Powered by section shimmer */}
      <div className="py-4 text-center flex justify-center items-center gap-0">
        <div className="h-2 bg-gray-200 rounded animate-pulse w-32"></div>
      </div>
    </div>
  );
};
