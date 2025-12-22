"use client";

import { Button } from "@/components/ui/button";
import { useDemoModal } from "./demo-modal";

export const HeroSection = () => {
  const { openDemoModal } = useDemoModal();

  return (
    <div className="section-container border-x flex flex-col items-center justify-center w-full pt-20 sm:pt-16 md:pt-24 pb-5 md:pb-10 gap-6 sm:gap-8 md:gap-10">
      <div className="flex flex-col items-center text-center mt-8 sm:mt-12 md:mt-18">
        <h1 className="text-3xl leading-normal md:text-4xl mb-4 px-4">
          From "How can I help?" to "It's already done."
          {/* Handle 10x more support without hiring 10x more people. */}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto px-4">
          The world's first AI that makes superior customer experience simple
          and scalable, while increasing profits and lowering costs.
        </p>

        <div className="flex justify-center w-full mt-6 sm:mt-8">
          <Button
            onClick={openDemoModal}
            size="lg"
            className="px-8 py-6 text-base rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 hover:shadow-lg active:scale-100"
            aria-label="Book a Demo"
          >
            Book a Demo
          </Button>
        </div>
      </div>
      <div
        className="relative flex items-center aspect-[1.58] justify-center w-full animate-fade-in p-4 md:p-6"
        style={{
          background: "linear-gradient(0deg, #f7fafc 0%, #e5ecec 100%)",
        }}
        aria-label="Customer support dashboard preview background"
        tabIndex={-1}
      >
        <iframe
          src="https://player.mux.com/h701pwXlrvWkXBSD5fq021e43bQzLjUHZ5KKTpjm55ywU?accent-color=%23050505"
          style={{ width: "100%", border: "none", aspectRatio: "16/9" }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          className="rounded-xl shadow-l"
        ></iframe>
      </div>
    </div>
  );
};
