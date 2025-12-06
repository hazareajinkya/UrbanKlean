"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { useScroll } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "welcome", title: "1. Welcome" },
  { id: "what-you-get", title: "2. What You're Getting" },
  { id: "agreement", title: "3. What You Agree To" },
  { id: "billing", title: "4. Billing & Plans" },
  { id: "data-privacy", title: "5. Your Data & Privacy" },
  { id: "uptime", title: "6. Uptime & Availability" },
  { id: "ai-limitations", title: "7. AI Limitations" },
  { id: "ending-account", title: "8. Ending Your Account" },
  { id: "updates", title: "9. Updates to These Terms" },
  { id: "help", title: "10. If You Need Help" },
];

export default function PoliciesPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [activeSection, setActiveSection] = useState("welcome");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -35% 0px" }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans" ref={containerRef}>
      <Navbar scrollYProgress={scrollYProgress} />

      <main className="w-full pt-20 md:pt-24 border-b bg-muted/5">
        <div className="section-container border-x min-h-screen">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
            {/* Sidebar Navigation */}
            <aside className="hidden md:block sticky top-24 self-start h-[calc(100vh-6rem)] overflow-y-auto py-12 px-6 border-r">
              <div className="mb-8">
                <h1 className="font-semibold text-lg mb-2">Policies</h1>
                <p className="text-sm text-muted-foreground">
                  Human-first terms for MagicalCX.
                </p>
              </div>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "block w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                      activeSection === section.id
                        ? "bg-primary/5 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="px-6 py-12 md:py-20 md:px-12 lg:px-16 max-w-4xl">
              <div className="mb-12 md:mb-16">
                <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
                  Terms of Service
                </h1>
                <p className="text-xl text-muted-foreground font-light">
                  (Human Version)
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  Last updated:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="space-y-16 md:space-y-24">
                {/* 1. Welcome */}
                <section id="welcome" className="scroll-mt-32">
                  <h2 className="text-2xl font-semibold mb-6">
                    1. Welcome to MagicalCX
                  </h2>
                  <div className="prose prose-lg dark:prose-invert text-muted-foreground">
                    <p className="text-foreground font-medium mb-4">
                      Thanks for choosing MagicalCX.
                    </p>
                    <p>
                      We built this platform because customer support shouldn’t
                      feel like punishment — for brands or their customers.
                    </p>
                    <p>
                      These terms explain what you can expect from us, and what
                      we expect from you.
                    </p>
                    <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/50 text-base">
                      Nothing sneaky. Nothing buried. Just clarity.
                    </div>
                  </div>
                </section>

                {/* 2. What You Get */}
                <section id="what-you-get" className="scroll-mt-32">
                  <h2 className="text-2xl font-semibold mb-6">
                    2. What You’re Getting
                  </h2>
                  <div className="prose prose-lg dark:prose-invert text-muted-foreground space-y-4">
                    <p className="text-foreground">
                      MagicalCX gives your brand AI team members that:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 marker:text-primary">
                      <li>
                        Handle support across WhatsApp, Instagram, Facebook,
                        email, web chat
                      </li>
                      <li>
                        Understand context like orders, returns, schedules,
                        carts, and past messages
                      </li>
                      <li>Talk simply, clearly, and respectfully</li>
                      <li>Solve problems inside a single conversation</li>
                      <li>Reduce your support workload</li>
                      <li>Increase sales by removing friction</li>
                    </ul>
                    <p className="mt-6 italic">
                      We work hard to keep the platform stable, secure, and easy
                      to love.
                    </p>
                  </div>
                </section>

                {/* 3. Agreement */}
                <section id="agreement" className="scroll-mt-32">
                  <h2 className="text-2xl font-semibold mb-6">
                    3. What You Agree To
                  </h2>
                  <div className="prose prose-lg dark:prose-invert text-muted-foreground space-y-4">
                    <p className="text-foreground">Using MagicalCX means:</p>
                    <ul className="list-disc pl-5 space-y-2 marker:text-primary">
                      <li>You’ll use the platform responsibly</li>
                      <li>
                        You won’t misuse automation to spam or harm others
                      </li>
                      <li>You’ll follow local laws when messaging customers</li>
                      <li>You’ll keep your login safe</li>
                      <li>
                        You’ll configure your AI assistant in ways that match
                        your brand and legal limits
                      </li>
                    </ul>
                    <p className="mt-4">
                      If something goes wrong or behaves unexpectedly, tell us —
                      we’re here to help.
                    </p>
                  </div>
                </section>

                {/* 4. Billing */}
                <section id="billing" className="scroll-mt-32">
                  <h2 className="text-2xl font-semibold mb-6">
                    4. Billing & Plans
                  </h2>
                  <div className="prose prose-lg dark:prose-invert text-muted-foreground space-y-4">
                    <ul className="list-none space-y-4 pl-0">
                      <li className="flex gap-3">
                        <span className="text-primary font-bold">✓</span>
                        <span>Plans renew automatically unless you cancel</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-primary font-bold">✓</span>
                        <span>
                          You can upgrade, downgrade, or cancel anytime
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-primary font-bold">✓</span>
                        <span>
                          If something looks off in billing, we’ll fix it
                          quickly
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-primary font-bold">✓</span>
                        <span>Refunds are handled fairly, case-by-case</span>
                      </li>
                    </ul>
                    <div className="mt-6 font-medium text-foreground">
                      We don’t do surprise charges or dark patterns.
                    </div>
                  </div>
                </section>

                {/* 5. Data Privacy */}
                <section id="data-privacy" className="scroll-mt-32">
                  <h2 className="text-2xl font-semibold mb-6">
                    5. Your Data & Privacy
                  </h2>
                  <div className="prose prose-lg dark:prose-invert text-muted-foreground space-y-4">
                    <p className="text-xl font-medium text-foreground">
                      Your customer data stays your property — not ours.
                    </p>
                    <div className="bg-muted/30 p-6 rounded-xl border border-border/50 space-y-4">
                      <p>
                        We will never sell, rent, or trade your data. <br />
                        We use it only to power your support experience.
                      </p>
                      <p>You can request export or deletion anytime.</p>
                    </div>
                    <p>
                      We protect data using high-standard security practices
                      because trust is everything.
                    </p>
                  </div>
                </section>

                {/* 6. Uptime */}
                <section id="uptime" className="scroll-mt-32">
                  <h2 className="text-2xl font-semibold mb-6">
                    6. Uptime & Availability
                  </h2>
                  <div className="prose prose-lg dark:prose-invert text-muted-foreground">
                    <p className="mb-2">
                      We aim for strong uptime, but no system is perfect.
                    </p>
                    <p>
                      If downtime happens, we’ll be transparent and resolve it
                      fast.
                    </p>
                  </div>
                </section>

                {/* 7. AI Limitations */}
                <section id="ai-limitations" className="scroll-mt-32">
                  <h2 className="text-2xl font-semibold mb-6">
                    7. AI Limitations (Honesty Clause)
                  </h2>
                  <div className="prose prose-lg dark:prose-invert text-muted-foreground space-y-4">
                    <p className="font-medium text-foreground">
                      AI is powerful, but not magic.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 marker:text-primary">
                      <li>
                        It may occasionally be wrong, confused, or incomplete.
                      </li>
                      <li>
                        Your team should monitor and adjust settings as needed.
                      </li>
                      <li>
                        If the assistant can’t solve a problem, it should hand
                        off to a human — no ego, no loops.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* 8. Ending Account */}
                <section id="ending-account" className="scroll-mt-32">
                  <h2 className="text-2xl font-semibold mb-6">
                    8. Ending Your Account
                  </h2>
                  <div className="prose prose-lg dark:prose-invert text-muted-foreground">
                    <p>You can cancel anytime.</p>
                    <p className="mt-2">
                      After cancellation, we keep your data only as long as
                      required for compliance, then delete it upon request.
                    </p>
                  </div>
                </section>

                {/* 9. Updates */}
                <section id="updates" className="scroll-mt-32">
                  <h2 className="text-2xl font-semibold mb-6">
                    9. Updates to These Terms
                  </h2>
                  <div className="prose prose-lg dark:prose-invert text-muted-foreground">
                    <p>
                      If we change anything important, we’ll tell you clearly.
                    </p>
                    <p className="font-medium text-foreground mt-2">
                      No hidden edits.
                    </p>
                  </div>
                </section>

                {/* 10. Help */}
                <section id="help" className="scroll-mt-32">
                  <h2 className="text-2xl font-semibold mb-6">
                    10. If You Need Help
                  </h2>
                  <div className="prose prose-lg dark:prose-invert text-muted-foreground">
                    <p className="text-xl font-medium text-foreground mb-4">
                      Reach out anytime.
                    </p>
                    <p>
                      We’ll reply like humans — not robots pretending to be
                      lawyers.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
