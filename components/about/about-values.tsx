"use client";

import { motion } from "framer-motion";

export const AboutValues = () => {
  return (
    <section className="section-container border-x border-b py-20 md:py-32 bg-muted/10">
      <div className="max-w-4xl mx-auto text-center mb-16 section-content-padding  ">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-primary text-sm font-medium mb-4 block uppercase tracking-wider">
            What We Believe
          </span>
          <h2 className="text-3xl md:text-4xl leading-normal mb-6 text-foreground">
            Customer care should feel{" "}
            <span className="italic font-serif text-primary">human.</span>
          </h2>
          <p className="text-xl text-muted-foreground font-light">
            Simple, honest, and kind.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border-y ">
        {[
          {
            title: "People trust your brand.",
            desc: "When it does, everything changes.",
          },
          { title: "They buy.", desc: "They return." },
          {
            title: "Real growth.",
            desc: "Not because they were pushed, but because they were treated well.",
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group p-8 bg-card hover:bg-muted/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center mb-6 text-primary">
              <span className="text-lg font-medium">{index + 1}</span>
            </div>
            <h3 className="text-lg font-medium mb-3 text-foreground">
              {item.title}
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-16 section-content-padding"
      >
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          That’s how real growth happens.
        </p>
      </motion.div>
    </section>
  );
};
