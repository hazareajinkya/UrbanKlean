import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProvider } from "./client-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Supercx - Conversation AI for magical customer experience",
  description:
    "Transform your customer support with Supercx's AI-powered conversation platform. Deliver magical customer experiences through intelligent automation, seamless integrations, and personalized interactions that delight your customers and boost satisfaction.",
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
      </body>
    </html>
  );
}
