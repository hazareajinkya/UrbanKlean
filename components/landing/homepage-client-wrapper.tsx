"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { OldNewWay } from "@/components/landing/old-new-way";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { WhyChooseUs } from "@/components/landing/why-choose-us";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";
import { FaqSection } from "@/components/landing/faq-section";

export const HomepageClientWrapper = () => {
  const whyRef = useRef(null);
  const ctaRef = useRef(null);

  const { scrollYProgress: whyRefProgress } = useScroll({
    target: whyRef,
    offset: ["start start", "end start"],
  });

  const { scrollYProgress: ctaRefProgress } = useScroll({
    target: ctaRef,
    offset: ["start start", "end start"],
  });

  return (
    <>
      <Navbar whyRefProgress={whyRefProgress} ctaRefProgress={ctaRefProgress} />
      <HeroSection />
      <OldNewWay />
      <FeaturesSection />
      <div className="bg-background dark" ref={whyRef}>
        <WhyChooseUs />
      </div>
      <HowItWorks />
      <FaqSection />
      <div className="bg-background dark" ref={ctaRef}>
        <CtaSection />
        <Footer />
      </div>
    </>
  );
};
