"use client";

import { motion } from "framer-motion";
import {
  Building2,
  ShoppingBag,
  Stethoscope,
  GraduationCap,
  Utensils,
  Briefcase,
} from "lucide-react";

export const AboutAudience = () => {
  const industries = [
    { icon: <ShoppingBag className="w-5 h-5" />, name: "E-commerce & DTC" },
    {
      icon: <Stethoscope className="w-5 h-5" />,
      name: "Healthcare & diagnostics",
    },
    { icon: <Building2 className="w-5 h-5" />, name: "Real estate" },
    { icon: <GraduationCap className="w-5 h-5" />, name: "Ed-tech" },
    { icon: <Utensils className="w-5 h-5" />, name: "Hospitality" },
    { icon: <Briefcase className="w-5 h-5" />, name: "Service businesses" },
  ];

  return (
    <section className="section-container section-content-padding border-x border-b py-20 md:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start ">
        <div className="lg:col-span-4 lg:sticky lg:top-32">
          <span className="text-primary font-medium tracking-wider uppercase text-sm mb-4 block">
            Who It’s For
          </span>
          <h2 className="text-3xl md:text-4xl leading-normal mb-6 text-foreground">
            MagicalCX is built for brands who know they can’t scale{" "}
            <span className="text-muted-foreground line-through decoration-destructive/50 decoration-2">
              bad experiences.
            </span>
          </h2>
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            If your company is growing but your inbox is always full, MagicalCX
            was built for you.
          </p>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border rounded-lg overflow-hidden">
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center gap-4 p-6 bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="p-2 rounded-lg bg-muted text-foreground">
                {industry.icon}
              </div>
              <span className="font-medium text-base text-foreground">
                {industry.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
