import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Urban Company — AI Demo",
  description: "Voice AI booking demo for Urban Company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
