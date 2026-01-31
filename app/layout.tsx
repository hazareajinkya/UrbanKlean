import type { Metadata } from "next";
import { Bodoni_Moda, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClientProvider } from "./client-provider";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { coreConf } from "@/lib/utils/conf";
import { WidgetScript } from "@/components/widget-script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bodona = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: coreConf.baseUrl ? new URL(coreConf.baseUrl) : undefined,
  title: "MagicalCX | Empathy-First AI for magical customer experience",
  description:
    "MagicalCX is an empathy-first AI platform that transforms customer experience into a growth engine",
  openGraph: {
    title: "MagicalCX | Empathy-First AI for magical customer experience",
    description:
      "MagicalCX is an empathy-first AI platform that transforms customer experience into a growth engine",
    url: coreConf.baseUrl,
    type: "website",
  },
  alternates: {
    canonical: coreConf.baseUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${inter.variable} ${playfair.variable} ${bodona.variable} font-sans antialiased`}
      >
        <ClientProvider>{children}</ClientProvider>
        <Analytics />
        <WidgetScript />
        <Script
          defer
          data-website-id="dfid_Y7xkducRuPS0Flwujh232"
          data-domain="magicalcx.com"
          src="https://datafa.st/js/script.js"
        />
      </body>
    </html>
  );
}
