import type { Metadata } from "next";
import {
  Bodoni_Moda,
  Inter,
  STIX_Two_Text,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { ClientProvider } from "./client-provider";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import { coreConf } from "@/lib/utils/conf";

import { WidgetScript } from "@/components/widget-script";

const stixTwoText = STIX_Two_Text({
  subsets: ["latin"],
  variable: "--font-stix-two-text",
  style: "italic",
});

const playfairItalic = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-italic",
  style: "italic",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bodona = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
});
// const playfair = Playfair_Display({
//   subsets: ["latin"],
//   variable: "--font-playfair",
// });

const playfair = STIX_Two_Text({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: "italic",
});
const gtmId = "GTM-M2R4PW7N";

export const metadata: Metadata = {
  metadataBase: coreConf.baseUrl ? new URL(coreConf.baseUrl) : undefined,
  title: "MagicalCX | Empathy-First AI for magical customer service",
  description:
    "MagicalCX is an empathy-first AI platform that transforms customer service into a growth engine",
  openGraph: {
    title: "MagicalCX | Empathy-First AI for magical customer service",
    description:
      "MagicalCX is an empathy-first AI platform that transforms customer service into a growth engine",
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
        className={` ${inter.variable} ${stixTwoText.variable} ${playfair.variable} ${playfairItalic.variable} ${bodona.variable} font-sans antialiased`}
      >
        {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
        <ClientProvider>{children}</ClientProvider>
        <WidgetScript />
        <Script
          id="datafast-queue"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "window.datafast=window.datafast||function(){(window.datafast.q=window.datafast.q||[]).push(arguments)};",
          }}
        />
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
