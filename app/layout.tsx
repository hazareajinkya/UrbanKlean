import type { Metadata } from "next";
import { Bodoni_Moda, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClientProvider } from "./client-provider";
import { Analytics } from "@vercel/analytics/next";

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
  title: "MagicalCX - Conversational AI for magical customer experience",
  description:
    "MagicalCX.ai is in the business of making your business successful and profitable—by improving your customers’ experience. We help you sell more, keep more, and spend less. We make your operations simpler, your teams more efficient, and your brand feel warm, effortless, and magical.",

  // "Transform your customer support with Magical CX's AI-powered conversation platform. Deliver magical customer experiences through intelligent automation, seamless integrations, and personalized interactions that delight your customers and boost satisfaction.",
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
      </body>
    </html>
  );
}
