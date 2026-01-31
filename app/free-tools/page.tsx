import type { Metadata } from "next";
import Link from "next/link";
import { coreConf } from "@/lib/utils/conf";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";
import {
  Calculator,
  FileText,
  Scale,
  MessageSquare,
  ShieldAlert,
  Heart,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Customer Support Tools & Calculators | MagicalCX",
  description:
    "Free tools to optimize your customer support operations. ROI calculators, policy generators, tone checkers, and quality graders.",
  keywords: [
    "free customer support tools",
    "support calculators",
    "CX tools free",
    "customer service tools",
    "support ROI calculator",
    "tone checker",
    "response grader",
  ],
  openGraph: {
    title: "Free Customer Support Tools & Calculators | MagicalCX",
    description:
      "Free tools to optimize your customer support operations. ROI calculators, policy generators, tone checkers, and quality graders.",
    url: `${coreConf.baseUrl}/free-tools`,
    type: "website",
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/free-tools`,
  },
};

const TOOLS = [
  {
    title: "Support Policy Generator",
    description:
      "Generate professional support policies, refund terms, and escalation rules with AI.",
    href: "/free-tools/customer-support-and-refund-policy-generator",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Support Cost Calculator",
    description:
      "Calculate your true support costs and identify savings opportunities.",
    href: "/free-tools/customer-support-cost-calculator",
    icon: Calculator,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "AI vs Human ROI",
    description:
      "Compare the costs and ROI of implementing AI support vs hiring generated agents.",
    href: "/free-tools/ai-vs-human-support-roi-calculator",
    icon: Scale,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Response Quality Grader",
    description:
      "Grade your support responses for empathy, clarity, and effectiveness.",
    href: "/free-tools/customer-support-response-grader",
    icon: MessageSquare,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Refund Risk Predictor",
    description: "Assess the risk level of refund requests to prevent fraud.",
    href: "/free-tools/refund-risk-predictor",
    icon: ShieldAlert,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    title: "Tone & Empathy Checker",
    description:
      "Analyze customer messages to detect sentiment and suggest empathetic responses.",
    href: "/free-tools/customer-support-tone-checker",
    icon: Heart,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
];

export default function ToolsHubPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="section-container px-6 py-20 md:py-32 border-x">
          <div className="max-w-3xl mx-auto text-center mb-20 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl section-heading font-serif tracking-tight">
              Free CX tools for{" "}
              <span className="italic text-primary">support leaders</span>
            </h1>
            <p className="section-subheadline leading-relaxed text-muted-foreground">
              Free CX tools to cut support costs, improve response quality, and
              reduce refunds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative bg-card hover:bg-muted/50 border rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${tool.bg} ${tool.color}`}
                >
                  <tool.icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {tool.title}
                </h3>
                <p className="text-muted-foreground mb-6 line-clamp-2">
                  {tool.description}
                </p>

                <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Try Tool <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <div className="bg-background dark">
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}
