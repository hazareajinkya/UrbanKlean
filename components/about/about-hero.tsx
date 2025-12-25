"use client";

import { motion } from "framer-motion";

export const AboutHero = () => {
  return (
    <section className="section-container section-content-padding border-x pt-20 sm:pt-16 md:pt-24 pb-10 md:pb-20 flex flex-col items-center">
      <div className="max-w-prose mt-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="section-heading">
            Why We Built <span className="text-primary">MagicalCX</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed"
        >
          <p>Customer support should feel human.</p>

          <p>
            But somewhere along the way, it became slow, repetitive, and
            transactional.
          </p>
          <p>
            People waited too long. They repeated themselves. They ended up
            talking to systems designed to{" "}
            <i>close tickets, not build trust.</i>
          </p>

          <p>And, none of that made sense to us.</p>
          <p className="text-foreground font-medium">So, we built MagicalCX</p>
          <p>
            MagicalCX exists to help brands deliver clear, fair, human
            conversations at scale, using AI that understands context, remembers
            people, and knows when empathy matters more than efficiency.
          </p>
          <p>Because great customer experience isn't a cost to cut.</p>
          <p>
            It's how trust is built. It's how brands grow revenues in today's
            day and age.
          </p>
          <p>
            It's how customers stay longer, buy again, and feel good about
            choosing you.
          </p>
          <p>
            That's why MagicalCX combines empathy-first AI together with
            thoughtful revenue orchestration to help business build the exact
            kind of relationship they want with their customers.
          </p>

          <p className="text-foreground font-medium">
            Human to Human through MagicalCX's agentic AI.
          </p>
          {/* <div className="pt-4 space-y-2">
            <p className="text-foreground font-medium">
              Clarity before automation.
            </p>
            <p className="text-foreground font-medium">
              Empathy before revenue.
            </p>
          </div> */}
          {/* <p className="text-foreground font-medium pt-2">
            That's why we built MagicalCX.
          </p> */}
        </motion.div>
      </div>
    </section>
  );
};
