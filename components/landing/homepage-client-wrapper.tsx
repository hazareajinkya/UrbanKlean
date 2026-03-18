"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { LifetimeBanner } from "@/components/landing/lifetime-banner";
import { HeroSection } from "@/components/landing/hero-section";
import { OldNewWay } from "@/components/landing/old-new-way";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { WhyChooseUs } from "@/components/landing/why-choose-us";
import { Footer } from "@/components/landing/footer";
import { CtaSection } from "@/components/landing/cta-section";
import { AskAiSection } from "@/components/landing/ask-ai-section";
import { FaqSection } from "@/components/landing/faq-section";
import { cn } from "@/lib/utils";
import datafastService from "@/lib/services/datafast-service";

export const HomepageClientWrapper = () => {
  const whyRef = useRef(null);
  const ctaRef = useRef(null);
  const [bannerVisible, setBannerVisible] = useState(false);

  const { scrollYProgress: whyRefProgress } = useScroll({
    target: whyRef,
    offset: ["start start", "end start"],
  });

  const { scrollYProgress: ctaRefProgress } = useScroll({
    target: ctaRef,
    offset: ["start start", "end start"],
  });

  useEffect(() => {
    datafastService.trackGoal("home_viewed");
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <LifetimeBanner
          onVisibilityChange={setBannerVisible}
          whyRefProgress={whyRefProgress}
          ctaRefProgress={ctaRefProgress}
        />
        <Navbar
          whyRefProgress={whyRefProgress}
          ctaRefProgress={ctaRefProgress}
          inFixedContainer
        />
      </div>
      <div className={cn("pt-10", bannerVisible && "pt-20")}>
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
          <AskAiSection />
          <Footer />
        </div>
      </div>
    </>
  );
};
