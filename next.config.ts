import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source:
          "/((?!api|_next/static|_next/image|favicon.ico|opengraph-image.png|sitemap.xml|robots.txt).*)",
        headers: [
          {
            key: "Link",
            value:
              '</llms.txt>; rel="llms-txt", </llms-full.txt>; rel="llms-full-txt"',
          },
          { key: "X-Llms-Txt", value: "/llms.txt" },
        ],
      },
      {
        source: "/:path*.md",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  allowedDevOrigins: ["magicalcx.ratcat.in"],
  experimental: {},
  reactStrictMode: false,
  devIndicators: false,
};

export default nextConfig;
