"use client";

import { motion } from "framer-motion";

export const AboutV2Content = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="section-container section-content-padding border-x pt-20 sm:pt-16 md:pt-24 pb-10 md:pb-20 flex flex-col items-center">
        <div className="max-w-prose mt-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="section-heading">
              About Us{" "}
              <span className="text-muted-foreground text-2xl md:text-3xl font-normal">
                (from your side of the table)
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            <p>
              I&apos;m{" "}
              <span className="text-foreground font-medium">Manish</span>,
              Co-founder & CEO of MagicalCX
            </p>
            <p>Other than my family, I care about two things:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                Building{" "}
                <span className="text-foreground font-medium italic">
                  profitable, durable businesses
                </span>
              </li>
              <li>
                Giving people{" "}
                <span className="text-foreground font-medium italic">
                  genuinely good experiences
                </span>{" "}
                when they deal with those businesses
              </li>
            </ol>
            <p>
              Most days, those two things feel like they&apos;re fighting each
              other.
            </p>
            <p>You know this feeling too:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Targets and margins on one side</li>
              <li>Tired CX teams and frustrated customers on the other</li>
              <li>
                Pressure to &quot;automate more&quot; and &quot;cut costs&quot;
              </li>
              <li>
                While still wanting people to feel respected, understood and
                safe
              </li>
            </ul>
            <p className="text-foreground font-medium">
              That tension is why we built MagicalCX.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Co-founder Section */}
      <section className="border-t section-container section-content-padding border-x border-b py-20 md:py-28">
        <div className="max-w-prose mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            <p>And I didn&apos;t build it alone.</p>
            <p>
              My co‑founder & CTO,{" "}
              <span className="text-foreground font-medium">Hrushikesh</span>,
              is obsessed with his playlists, guitars and{" "}
              <span className="text-foreground font-medium italic">
                how things feel to the person using them.
              </span>{" "}
            </p>
            <p>
              Bad UX physically bothers him. Confusing flows, fake empathy, bots
              that don&apos;t really listen. He can&apos;t unsee them.
            </p>
            <div className="space-y-4 pt-6 border-t border-border/50">
              <div className="bg-muted/30 p-6 rounded-lg border border-border/50">
                <p className="text-foreground font-medium mb-2">
                  I look at a conversation and think:
                </p>
                <p className="text-muted-foreground italic">
                  &quot;What does this do to revenue, renewals, and cost?&quot;
                </p>
              </div>
              <div className="bg-muted/30 p-6 rounded-lg border border-border/50">
                <p className="text-foreground font-medium mb-2">
                  He looks at the same conversation and thinks:
                </p>
                <p className="text-muted-foreground italic">
                  &quot;What does this do to the person on the other side?&quot;
                </p>
              </div>
            </div>
            <p className="text-foreground font-medium pt-4">
              MagicalCX sits exactly where those two views meet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who We Built It For */}
      <section className="border-t section-container section-content-padding border-x border-b py-20 md:py-28 bg-muted/10">
        <div className="max-w-prose mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl leading-normal mb-8 text-foreground">
              We built it for businesses and brands like yours which:
            </h2>
            <ul className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>
                  Need{" "}
                  <span className="text-foreground font-medium italic">
                    more revenue and lower costs
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>
                  Refuse to get there by{" "}
                  <span className="text-foreground font-medium italic">
                    tricking, rushing, or disrespecting
                  </span>{" "}
                  customers
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>
                  Want AI that feels{" "}
                  <span className="text-foreground font-medium italic">
                    kind, clear, and human
                  </span>
                  , not cold and pushy
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="border-t section-container section-content-padding border-x border-b py-20 md:py-28">
        <div className="max-w-prose mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl leading-normal mb-8 text-foreground">
              So here&apos;s what we believe, in simple terms:
            </h2>
            <ul className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>
                  <span className="text-foreground font-medium italic">
                    Good business and good experience should help each other,
                    not fight each other
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>
                  <span className="text-foreground font-medium italic">
                    Trust is money for a brand
                  </span>{" "}
                  if customers trust you, they stay, come back, buy more, and
                  tell others
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>
                  <span className="text-foreground font-medium italic">
                    Your brand voice matters
                  </span>
                  ; your bot shouldn&apos;t sound like a stranger
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>
                  <span className="text-foreground font-medium italic">
                    Your people are an asset
                  </span>
                  , not a cost to replace; AI should make them better, not
                  unnecessary
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">•</span>
                <span>
                  <span className="text-foreground font-medium italic">
                    Customer conversations are gold
                  </span>
                  . They should guide what you build and how you grow
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Closing */}
      <section className="border-t section-container section-content-padding border-x border-b py-20 md:py-28 bg-muted/10">
        <div className="max-w-prose mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            <p className="text-2xl md:text-3xl text-foreground font-medium mb-8">
              MagicalCX is our way of giving you both:
            </p>
            <div className="space-y-4">
              <p className="text-foreground font-medium">
                Numbers you can show in a board meeting
              </p>
              <p className="text-muted-foreground">and</p>
              <p className="text-foreground font-medium">
                Experiences you can be proud to put your brand on
              </p>
            </div>
            <p className="mt-12 pt-8 border-t border-border/50 text-foreground font-medium">
              If you&apos;re trying to grow your business{" "}
              <span className="italic">and</span> take care of your customers
              the right way, we built MagicalCX for you.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};
