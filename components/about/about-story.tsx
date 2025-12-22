"use client";

import { motion } from "framer-motion";

export const AboutStory = () => {
  return (
    <section className="section-container section-content-padding border-x border-b py-20 md:py-32 bg-muted/10">
      <div className="max-w-3xl mx-auto ">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-4 block">
            Why We Built It
          </span>
          <h2 className="text-3xl md:text-4xl leading-normal mb-8 text-foreground">
            We built MagicalCX because we were customers first.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-8"
        >
          <p className="text-lg text-muted-foreground leading-relaxed text-center">
            We waited. We repeated ourselves. We got stuck. We watched brands
            lose trust because support couldn’t keep up.
          </p>

          <div className="border-l-2 border-primary pl-6 py-2 my-8">
            <p className="font-medium text-foreground text-xl italic">
              "So we created what should have existed all along — a system that
              doesn’t treat people like tickets and a platform that actually
              helps."
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
