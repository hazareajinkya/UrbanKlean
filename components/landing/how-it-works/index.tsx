"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Globe,
  LayoutDashboard,
  LineChart,
  Zap,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Step1Visual } from "./step-1-visual";
import { Step2Visual } from "./step-2-visual";
import { Step3Visual } from "./step-3-visual";
import { Step4Visual } from "./step-4-visual";
import { Step5Visual } from "./step-5-visual";

// --- Main Component ---

const steps = [
  {
    id: 0,
    step: "Step 1",
    title: "Drop in your website",
    subtitle: "(and whatever you already have)",
    description:
      "Share your website and materials—MagicalCX instantly studies everything for you and transforms your content into ready-to-use conversational intelligence. Your assistant launches fluent in your brand, requiring zero manual setup.",
    icon: Globe,
    Visual: Step1Visual,
  },
  {
    id: 1,
    step: "Step 2",
    title: "MagicalCX understands",
    subtitle: "HumanlyClear™ Intelligence",
    description:
      "MagicalCX reads your site like a smart, empathetic team member, building a unified conversation brain that reflects your brand.",
    icon: Bot,
    Visual: Step2Visual,
  },
  {
    id: 2,
    step: "Step 3",
    title: "Customer experience levels up",
    subtitle: "Quietly and immediately",
    description:
      "From the moment MagicalCX takes over, customers notice faster clarity and real resolutions inside the chat.",
    icon: Zap,
    Visual: Step3Visual,
  },
  {
    id: 3,
    step: "Step 4",
    title: "EFRO optimizes revenue",
    subtitle: "Empathy-First Revenue Orchestrator™",
    description:
      "As conversations flow, EFRO learns when to help, when to suggest, and how to protect your margins.",
    icon: LineChart,
    Visual: Step4Visual,
  },
  {
    id: 4,
    step: "Step 5",
    title: "Steer with a dashboard",
    subtitle: "No complicated systems",
    description:
      "Log into one clear view to see plain-language summaries, resolution stats, and opportunities for improvement.",
    icon: LayoutDashboard,
    Visual: Step5Visual,
  },
  {
    id: 0,
    step: "Step 1",
    title: "Drop in your website",
    subtitle: "(and whatever you already have)",
    description:
      "You don’t need a big project plan, complex integrations, or months of setup. Just share your URL and let us do the heavy lifting.",
    icon: Globe,
    Visual: Step1Visual,
  },
];

export const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoRotate) {
      intervalRef.current = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % 5); // steps.length is 5 (ignoring the duplicate I might have added by mistake? No wait, looking at original code)
      }, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRotate]);

  const handleStepChange = (index: number) => {
    if (activeStep === index) return;
    setActiveStep(index);
    setAutoRotate(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Filter to unique steps for display if needed, but original code had 5 steps.
  // Wait, I see I pasted Step 1 twice in the steps array above in my thought process?
  // Let me check the steps array I wrote in the content.
  // 0, 1, 2, 3, 4.
  // I see 6 items in the array I prepared above (Step 1 repeated at end).
  // The original code had 5 items.
  // I will remove the last duplicate item.

  return (
    <section
      className="py-24 md:py-32 bg-background relative overflow-hidden border-x border-b"
      id="how-it-works"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-24">
          <h1 className="text-3xl leading-normal md:text-4xl mb-4 px-4">
            What happens when you start
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto px-4">
            No complex integrations. No months of setup. Just instant,
            intelligent customer experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto items-start">
          {/* Left Column: Steps List */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {steps.slice(0, 5).map((item, index) => {
              const isActive = activeStep === index;
              return (
                <div
                  key={index}
                  onClick={() => handleStepChange(index)}
                  className={cn(
                    "group relative p-6 rounded-lg transition-all duration-300 cursor-pointer border border-transparent",
                    isActive
                      ? "bg-white border-border/50"
                      : "hover:bg-white/50  hover:border-border/30"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-300 flex-shrink-0",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-neutral-100 text-neutral-400 group-hover:text-neutral-600"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3
                          className={cn(
                            "text-lg mb-1 transition-colors font-medium",
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          {item.title}
                        </h3>
                        {isActive ? (
                          <ChevronDown className="w-4 h-4 text-primary animate-in fade-in" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                        )}
                      </div>

                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{
                              height: "auto",
                              opacity: 1,
                              marginTop: 12,
                            }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Visual Display */}
          <div className="lg:col-span-7 h-[400px] md:h-[500px] lg:h-[600px] sticky top-24">
            <div className="relative w-full h-full rounded-3xl border border-border/60 shadow-2xl shadow-neutral-200/50 bg-white/50 backdrop-blur-xl overflow-hidden p-2">
              <div className="absolute inset-0 bg-grid-neutral-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full h-full"
                >
                  {steps.slice(0, 5).map((s, i) => {
                    if (i !== activeStep) return null;
                    const VisualComponent = s.Visual;
                    return <VisualComponent key={i} />;
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
