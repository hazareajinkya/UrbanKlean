"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useDemoModal } from "./demo-modal";

const checklistItems = [
  "No credit card required",
  "14 days free trial",
  "DIY or Guided setup",
  // "Remembers your customers",
  // "Fixes issues inside the chat",
  // "Weekly insights included",
];

export const CtaSection = () => {
  const { openDemoModal } = useDemoModal();
  return (
    <section className="section-container border py-24 md:py-32 bg-background overflow-hidden ">
      <div className="">
        <div className="bg-card border border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8 pt-6 pb-6 pl-6 pr-6 md:pt-8 md:pb-8 md:pl-8 md:pr-8 lg:pt-16 lg:pb-16 lg:pl-16 lg:pr-16">
              <div className="space-y-6">
                <h2 className="text-3xl leading-normal text-foreground md:text-4xl">
                  See your AI teammate in action now
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground max-w-xl">
                  Ready to make support faster, kinder, easier and help
                  customers feel good about choosing you? <br /> <br /> PS:
                  Sales improves too...
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Button
                  onClick={openDemoModal}
                  size="lg"
                  className="px-8 py-6 text-base rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  Book a Demo
                </Button>
              </div>

              <div className="space-y-3">
                {checklistItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-foreground shrink-0 mt-0.5 stroke-[1.5]" />
                    <p className="text-base text-foreground font-normal leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative h-full min-h-[500px] lg:min-h-[600px] pt-8 pl-0 md:pt-10 md:pl-10 lg:pt-12 lg:pl-12">
              <img
                // src={"/bg-hero-2.png"}
                src={"/cta-img.png"}
                alt="Customer support dashboard preview"
                className="w-full h-full object-cover object-left-top md:rounded-tl-md"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
