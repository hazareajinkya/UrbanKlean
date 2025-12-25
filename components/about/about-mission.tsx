"use client";

import { motion } from "framer-motion";
import { Check, MessageSquare, Zap, Heart, Brain } from "lucide-react";

export const AboutMission = () => {
  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      text: "Understands context",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      text: "Speaks simply",
    },
    {
      icon: <Heart className="w-5 h-5" />,
      text: "Responds kindly",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: "Resolves completely",
    },
  ];

  return (
    <section className="border-t section-container section-content-padding border-x border-b py-20 md:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start ">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-primary text-sm font-medium mb-4 block uppercase tracking-wider">
            What MagicalCX Is
          </span>
          <h2 className="text-3xl md:text-4xl leading-normal mb-8 text-foreground">
            MagicalCX builds AI team members that feel{" "}
            <span className="text-primary">human.</span>
          </h2>

          <div className="space-y-3 text-base text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              <span>Not bots.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              <span>Not scripts.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
              <span>Not robotic replies.</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              <span className="text-foreground">
                Real conversations, clear answers, and problems solved the first
                time.
              </span>
            </p>
            <p>
              Across WhatsApp, Instagram, Facebook, web chat, and email,
              customers speak to one system that understands context, responds
              kindly, speaks simply, and resolves completely.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border rounded-lg overflow-hidden">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="text-primary">{feature.icon}</div>
                <span className="text-base text-foreground">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border/50">
            <div className="flex flex-wrap gap-3 mb-6">
              {["No loops", "No handoffs", "No dead ends"].map((item, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground border border-border"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="text-xl text-primary font-normal">
              Just support that feels human.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
