import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProvider } from "./client-provider";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Magical CX - Conversational AI for magical customer experience",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientProvider>{children}</ClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
