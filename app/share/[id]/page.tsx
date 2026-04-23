"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import AgentPreviewTabs from "@/components/agent/agent-preview-tabs";
import { Button } from "@/components/ui/button";
import { useAgent } from "@/lib/hooks/agent/use-agent";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function SharePage() {
  const params = useParams();
  const id = (Array.isArray(params.id) ? params.id[0] : params.id) as string;
  const { agent } = useAgent(id);
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20 pb-8 sm:pt-24 sm:pb-16 border-x section-container section-content-padding w-full flex flex-col justify-center">
        {/* Mobile: Compact header above iframe */}
        <div className="lg:hidden text-center mb-4 px-2">
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight leading-relaxed mb-2">
            You can build AI Agents like this in 5 minutes
          </h1>
          <p className="text-sm text-muted-foreground font-normal max-w-xs mx-auto leading-relaxed">
            Chat with this AI agent built on Magical CX
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-24 items-center max-w-6xl mx-auto w-full">
          {/* Left Column: Text & CTA - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex flex-col items-start text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-4xl font-normal tracking-tight leading-relaxed">
                You can build AI Agents like this in 5 minutes
              </h1>
              <p className="text-base sm:text-base text-muted-foreground font-normal max-w-lg leading-relaxed">
                You're viewing a live AI agent built with MagicalCX. Want to
                create your own intelligent support experience that converts
                visitors into customers?
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg rounded-full font-medium group"
                  asChild
                >
                  <Link href="/onboarding" className="flex items-center gap-2">
                    Build My AI Agent
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg rounded-full font-medium"
                  asChild
                >
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
              <p className="text-sm mt-4 text-muted-foreground">
                Enjoy 40+ features of MagicalCX for Free for 14 days
              </p>
            </div>

            <div className="flex gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full border border-emerald-500/70 bg-emerald-500/20 shadow-sm flex items-center justify-center">
                  <Check
                    className="w-3 h-3 text-emerald-600"
                    strokeWidth={2.5}
                  />
                </span>
                <span>14 days free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full border border-emerald-500/70 bg-emerald-500/20 shadow-sm flex items-center justify-center">
                  <Check
                    className="w-3 h-3 text-emerald-600"
                    strokeWidth={2.5}
                  />
                </span>
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full border border-emerald-500/70 bg-emerald-500/20 shadow-sm flex items-center justify-center">
                  <Check
                    className="w-3 h-3 text-emerald-600"
                    strokeWidth={2.5}
                  />
                </span>
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>

          {/* Center/Right Column: Mobile Frame */}
          <div className="flex justify-center lg:justify-end w-full">
            <AgentPreviewTabs
              aid={id}
              wid={agent?.wid ?? id}
              botName={agent?.customization.name ?? "AI Agent"}
              vapiAssistantId={agent?.settings?.vapiAssistantId ?? ""}
            />
          </div>
        </div>

        {/* Mobile: CTA section below iframe */}
        <div className="lg:hidden mt-6 px-2">
          <div className="bg-muted/50 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground font-normal leading-relaxed">
                Create intelligent AIagents that converts visitors into
                customers
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full py-5 text-base rounded-full font-medium group"
                asChild
              >
                <Link href="/onboarding" className="flex items-center gap-2">
                  Build My AI Agent
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full py-5 text-base rounded-full font-medium"
                asChild
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Enjoy 40+ features of MagicalCX for Free for 14 days
              </p>
            </div>

            <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 w-4 h-4 rounded-full border border-emerald-500/70 bg-emerald-500/20 shadow-sm flex items-center justify-center">
                  <Check
                    className="w-2 h-2 text-emerald-600"
                    strokeWidth={2.5}
                  />
                </span>
                <span>14 days free trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 w-4 h-4 rounded-full border border-emerald-500/70 bg-emerald-500/20 shadow-sm flex items-center justify-center">
                  <Check
                    className="w-2 h-2 text-emerald-600"
                    strokeWidth={2.5}
                  />
                </span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 w-4 h-4 rounded-full border border-emerald-500/70 bg-emerald-500/20 shadow-sm flex items-center justify-center">
                  <Check
                    className="w-2 h-2 text-emerald-600"
                    strokeWidth={2.5}
                  />
                </span>
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="bg-background dark">
        <Footer />
      </div>
    </div>
  );
}
