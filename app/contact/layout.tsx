import type { Metadata } from "next";
import { coreConf } from "@/lib/utils/conf";

export const metadata: Metadata = {
  title: "Contact Us | MagicalCX",
  description:
    "Book a demo or ask a question. We’ll help you set up empathy-first AI support that feels human and performs.",
  openGraph: {
    title: "Contact Us | MagicalCX",
    description:
      "Book a demo or ask a question. We’ll help you set up empathy-first AI support that feels human and performs.",
    url: `${coreConf.baseUrl}/contact`,
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/contact`,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
