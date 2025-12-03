"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <div className="section-container border-x flex flex-col items-center justify-center w-full pt-20 sm:pt-16 md:pt-24 pb-5 md:pb-10 gap-6 sm:gap-8 md:gap-10">
      <div className="flex flex-col items-center text-center mt-8 sm:mt-12 md:mt-18">
        <h1 className="text-3xl leading-normal md:text-4xl mb-4 px-4">
          From "How can I help?" to "It's already done."
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto px-4">
          The world's first AI that makes superior customer experience simple
          and scalable, while increasing profits and lowering costs.
        </p>

        <div className="flex justify-center w-full mt-6 sm:mt-8">
          <Button
            asChild
            size="lg"
            className="px-8 py-6 text-base rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 hover:shadow-lg active:scale-100"
            aria-label="Book a Demo"
          >
            <Link
              href="https://calendly.com/echorift-ai"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={0}
              aria-label="Book a Demo"
            >
              Book a Demo
            </Link>
          </Button>
        </div>
      </div>
      <div
        className="flex items-center aspect-[1.58] justify-center w-full animate-fade-in p-4  md:p-16"
        style={{
          background: "linear-gradient(0deg, #f7fafc 0%, #e5ecec 100%)",
        }}
        aria-label="Customer support dashboard preview background"
        tabIndex={-1}
      >
        <img
          src={"/bg-hero-2.png"}
          alt="Customer support dashboard preview"
          className="w-full md:shadow-xl max-w-7xl h-auto transition-all duration-300 mx-auto rounded-sm md:rounded-md"
          loading="lazy"
        />
      </div>
    </div>
  );
};
