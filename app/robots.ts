import { MetadataRoute } from "next";
import { coreConf } from "@/lib/utils/conf";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = coreConf.baseUrl || process.env.NEXTAUTH_URL || "";

  const disallowedPaths = [
    "/api/",
    "/admin",
    "/workspaces",
    "/checkout/success",
    "/chat",
    "/accept-invite",
    "/share",
    "/widget-test",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowedPaths,
      },
      // AI crawlers - explicitly allow for GEO (AI citations)
      { userAgent: "GPTBot", allow: "/", disallow: disallowedPaths },
      { userAgent: "ChatGPT-User", allow: "/", disallow: disallowedPaths },
      { userAgent: "Claude-Web", allow: "/", disallow: disallowedPaths },
      { userAgent: "PerplexityBot", allow: "/", disallow: disallowedPaths },
      { userAgent: "Applebot-Extended", allow: "/", disallow: disallowedPaths },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
