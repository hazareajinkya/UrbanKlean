"use client";

import { motion } from "framer-motion";

export const AboutPhilosophy = () => {
  return (
    <section className="section-container section-content-padding border-x border-b py-20 md:py-32 bg-muted/10">
      <div className="max-w-4xl mx-auto text-center ">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-primary text-sm font-medium mb-4 block uppercase tracking-wider">
            This Is Not a Chatbot
          </span>
          <h2 className="text-3xl md:text-4xl leading-normal mb-8 text-foreground">
            MagicalCX is Empathy-First <br className="hidden md:block" />{" "}
            Revenue Orchestration.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A simple way of saying we help brands grow by caring better. With AI
            that understands context, language that feels natural, automation
            that feels warm, and conversations that end in solutions.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
