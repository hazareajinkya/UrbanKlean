"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { useDemoModal } from "@/components/landing/demo-modal";

export default function ContactPage() {
  const { openDemoModal } = useDemoModal();

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 sm:pt-24 sm:pb-16 border-x section-container section-content-padding w-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center max-w-6xl mx-auto w-full">
          {/* Left Column: Text & CTA */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-medium tracking-tight">
                Let's make magic happen.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                Ready to transform your customer experience? Book a demo to see
                how Magical CX can help you sell more, keep more, and spend
                less.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                onClick={openDemoModal}
                size="lg"
                className="px-8 py-6 text-lg rounded-full w-full sm:w-auto font-medium"
              >
                Book a Demo
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg rounded-full w-full sm:w-auto font-medium"
                asChild
              >
                <a href="mailto:support@magicalcx.com">Contact Support</a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Prefer email? Reach us at{" "}
              <a
                href="mailto:support@magicalcx.com"
                className="underline hover:text-foreground transition-colors"
              >
                support@magicalcx.com
              </a>
            </p>
          </div>

          {/* Right Column: Mobile Frame */}
          <div className="flex justify-center lg:justify-end w-full">
            <div className="bg-gray-900 p-2 rounded-2xl shadow-2xl max-w-full">
              <div className="bg-white rounded-xl overflow-hidden">
                <iframe
                  src={`https://www.magicalcx.com/chat/c0e54882-04fc-489e-975b-e2b7edbf2adf`}
                  className="w-[355px] h-[647px] border-0 max-w-full"
                  title={`Magical CX`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                />
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
