import { Metadata } from "next";
import { cache } from "react";
import agentService from "@/lib/services/agent-service";
import { coreConf } from "@/lib/utils/conf";

const getAgentCached = cache(async (id: string) => agentService.fetchAgent(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgentCached(id);
  const name = agent?.customization?.name ?? "AI Chat";
  const baseUrl = coreConf.baseUrl || "";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Magical CX";
  const url = `${baseUrl}/share/${id}`;
  const title = name;
  const description = `Try our ${name} chatbot built with MagicalCX AI – experience instant, intelligent responses in action.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
