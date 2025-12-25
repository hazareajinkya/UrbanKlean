import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { AboutHero } from "@/components/about/about-hero";
import { AboutMission } from "@/components/about/about-mission";
import { AboutValues } from "@/components/about/about-values";
import { AboutPhilosophy } from "@/components/about/about-philosophy";
import { AboutAudience } from "@/components/about/about-audience";
import { AboutStory } from "@/components/about/about-story";
import { CtaSection } from "@/components/landing/cta-section";
import { coreConf } from "@/lib/utils/conf";

export const metadata: Metadata = {
  title: "About Us | MagicalCX",
  description:
    "We built MagicalCX because customer care should feel human—simple, honest, and kind—while improving sales, revenue, costs, margins, and LTV.",
  openGraph: {
    title: "About Us | MagicalCX",
    description:
      "Why we built MagicalCX: customer care should feel human—simple, honest, and kind—while driving measurable business outcomes.",
    url: `${coreConf.baseUrl}/about`,
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <AboutHero />
      <AboutMission />
      <AboutValues />

      <AboutPhilosophy />
      <AboutAudience />
      <AboutStory />

      <section className="border-t section-container section-content-padding border-x border-b py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-primary text-sm mb-4 block uppercase tracking-wider">
            Where We&apos;re Going
          </span>
          <h2 className="text-3xl md:text-4xl leading-normal mb-8 text-foreground">
            Our Goal
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              To make customer experience feel{" "}
              <span className="text-foreground font-medium">
                respectful, clear, and human again
              </span>{" "}
              — even at scale.
            </p>
            <p>
              We want to set the standard for how businesses communicate,
              resolve issues, and build trust in a world increasingly run by{" "}
              <i>machines.</i>
            </p>
          </div>
        </div>
      </section>

      <div className="bg-background dark ">
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}
