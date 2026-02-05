"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SharePage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const onTrialStart = () => {
    router.push(`/pricing`);
  };

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20 pb-8 sm:pt-24 sm:pb-16 border-x section-container section-content-padding w-full flex flex-col justify-center">
        {/* Mobile: Compact header above iframe */}
        <div className="lg:hidden text-center mb-4 px-2">
          <h1 className="text-2xl sm:text-3xl tracking-tight mb-2">
            Try it live
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Chat with this AI agent built on Magical CX
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-24 items-center max-w-6xl mx-auto w-full">
          {/* Left Column: Text & CTA - Hidden on mobile, shown on desktop */}

          {/* Center/Right Column: Mobile Frame */}
          <div className="flex justify-center lg:justify-end w-full">
            <div className="relative">
              {/* Glow effect - smaller on mobile */}
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-60" />
              <div className="relative bg-gray-900 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-2xl">
                <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden">
                  <iframe
                    src={`/chat/${id}`}
                    className="w-[355px] h-[647px] border-0 max-w-full"
                    title="Magical CX"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-start text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl tracking-tight">
                Experience the future of customer support.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
                You're viewing a live AI agent built with Magical CX. Start your
                14 day trial and create your own intelligent support experience.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="px-8 py-6 text-lg rounded-full group"
                onClick={onTrialStart}
              >
                <Zap className="h-5 w-5 mr-2" />
                Start 14 Day Trial
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="flex gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>14 day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: CTA section below iframe */}
        <div className="lg:hidden mt-6 px-2">
          <div className="bg-muted/50 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-lg sm:text-xl">Want your own AI agent?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Start your 14 day trial and create intelligent support
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                size="lg"
                className="px-6 py-5 text-base rounded-full group"
                onClick={onTrialStart}
              >
                <Zap className="h-4 w-4 mr-2" />
                Start 14 Day Trial
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>14 day free trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>No credit card</span>
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
