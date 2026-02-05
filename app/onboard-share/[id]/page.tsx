"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { useDemoModal } from "@/components/landing/demo-modal";
import { useRouter } from "next/navigation";

export default function SharePage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const { openDemoModal } = useDemoModal();
  const onTrialStart = () => router.push(`/pricing`);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20 pb-8 sm:pt-24 sm:pb-16 border-x section-container section-content-padding w-full flex flex-col justify-center">
        {/* Mobile: Compact header above iframe */}
        <div className="lg:hidden text-center mb-4 px-2">
          <h1 className="text-2xl sm:text-3xl mb-2">
            Meet your AI customer experience agent
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            You&apos;re testing a free demo agent trained only on your public
            website. It&apos;s a preview.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-24 items-center max-w-6xl mx-auto w-full">
          {/* Left Column: Text & CTA - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex flex-col items-start text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-4xl leading-normal">
                Meet your AI customer experience agent
              </h1>
              <p className="text-base sm:text-base text-muted-foreground max-w-xl leading-relaxed">
                You&apos;re testing a free demo agent trained only on your
                public website. It&apos;s a preview. The full MagicalCX setup
                adds your policies + integrations + memory, so it feels human
                and performs 10x better in real customer conversations.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg rounded-full group"
                  onClick={onTrialStart}
                >
                  Start 14‑Day Trial
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg rounded-full"
                  onClick={openDemoModal}
                >
                  Talk to Us
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
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>

          {/* Right Column: iframe */}
          <div className="flex justify-center lg:justify-end w-full">
            <div className="relative">
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
        </div>

        {/* Mobile: CTA section below iframe */}
        <div className="lg:hidden mt-6 px-2">
          <div className="bg-muted/50 rounded-2xl p-2 sm:p-6 space-y-4">
            <div className="text-balance text-center space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                You&apos;re testing a free demo agent trained only on your
                public website. It&apos;s a preview. The full MagicalCX setup
                adds your policies + integrations + memory, so it feels human
                and performs 10x better in real customer conversations.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full py-5 text-base rounded-full group"
                onClick={onTrialStart}
              >
                Start 14‑Day Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full py-5 text-base rounded-full"
                onClick={openDemoModal}
              >
                Talk to Us
              </Button>
              <p className="text-xs text-center sm:text-left text-muted-foreground">
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
