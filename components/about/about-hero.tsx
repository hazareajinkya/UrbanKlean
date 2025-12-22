"use client";

import { motion } from "framer-motion";

export const AboutHero = () => {
  return (
    <section className="section-container section-content-padding  border-x pt-20 sm:pt-16 md:pt-24 pb-10 md:pb-20 flex flex-col ">
      <div className="max-w-4xl mt-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            About MagicalCX
          </span>
          <h1 className="text-3xl md:text-4xl leading-normal mb-6 text-foreground">
            MagicalCX exists because getting help from a brand today feels like
            a <span className="text-primary">punishment.</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl"
        >
          <p>
            You message. You wait. You repeat yourself. You get bounced around.
            By the time someone finally responds, you’re already tired and
            halfway gone.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
