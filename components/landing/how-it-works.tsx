"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Check,
  Globe,
  LayoutDashboard,
  LineChart,
  Sparkles,
  FileText,
  ShieldCheck,
  TrendingUp,
  Zap,
  ChevronRight,
  ChevronDown,
  Search,
  LayoutTemplate,
  Palette,
  MessageSquare,
  MousePointer2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// --- Visual Components for Animations ---
const Step1Visual = ({ loop = false }: { loop?: boolean }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!loop) return;
    const interval = setInterval(() => {
      setKey((prev) => prev + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, [loop]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center shadow-sm p-6">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

      <div
        key={key}
        className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center"
      >
        {/* Browser Window Transformation */}
        <motion.div
          initial={{ width: 300, height: 52, borderRadius: 26, y: 0 }}
          animate={{
            width: "100%",
            height: "100%",
            borderRadius: 12,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute bg-white shadow-2xl border border-border/60 overflow-hidden flex flex-col z-10"
        >
          {/* Address Bar */}
          <div className="h-11 bg-neutral-50/80 border-b flex items-center px-3 gap-3 sticky top-0 z-20 backdrop-blur-sm">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            </div>
            {/* URL Input Animation */}
            <div className="flex-1 h-8 bg-white rounded-md border border-neutral-200 flex items-center px-3 overflow-hidden shadow-sm">
              <Search className="w-3.5 h-3.5 text-neutral-400 mr-2" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="text-xs text-neutral-600 font-medium">
                  your-brand.com
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  delay: 0.2,
                  duration: 0.8,
                  repeat: 2,
                  repeatType: "loop",
                }}
                className="w-0.5 h-4 bg-primary ml-0.5"
              />
            </div>
          </div>

          {/* Website Content Mockup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.4 }}
            className="flex-1 p-5 space-y-6 overflow-hidden relative bg-white"
          >
            {/* Hero Section */}
            <div className="flex gap-5">
              <div className="flex-1 space-y-3">
                <div className="w-3/4 h-5 bg-neutral-100 rounded-md animate-pulse" />
                <div className="w-1/2 h-3 bg-neutral-50 rounded-md" />
                <div className="w-2/3 h-3 bg-neutral-50 rounded-md" />
                <div className="flex gap-2 mt-2">
                  <div className="w-20 h-7 bg-blue-50 rounded-md border border-blue-100" />
                  <div className="w-20 h-7 bg-neutral-50 rounded-md border border-neutral-100" />
                </div>
              </div>
              <div className="w-28 h-24 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-center shadow-sm">
                <LayoutTemplate className="w-10 h-10 text-neutral-200" />
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-neutral-50 rounded-lg border border-neutral-100"
                />
              ))}
            </div>

            {/* Scan Line Effect */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_20px_2px_rgba(var(--primary),0.4)] z-30 w-full"
              initial={{ top: 44, opacity: 0 }} // Start below header
              animate={{ top: "120%", opacity: [0, 1, 1, 0] }}
              transition={{
                delay: 2.1,
                duration: 2.0,
                ease: "linear",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Floating Elements Extraction */}
        <ExtractParticle
          icon={Palette}
          label="Brand"
          color="text-pink-500"
          bg="bg-pink-50"
          delay={2.5}
          x={-80}
          y={-20}
        />
        <ExtractParticle
          icon={MessageSquare}
          label="Tone"
          color="text-blue-500"
          bg="bg-blue-50"
          delay={3.0}
          x={0}
          y={20}
        />
        <ExtractParticle
          icon={FileText}
          label="Knowledge"
          color="text-amber-500"
          bg="bg-amber-50"
          delay={3.5}
          x={80}
          y={-10}
        />

        {/* Bot Brain Collecting Info */}
        <motion.div
          className="absolute -right-4 -bottom-4 z-30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl border border-neutral-100 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl" />
            <Bot className="w-8 h-8 text-primary relative z-10" />

            {/* Success Badge */}
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-[3px] border-white flex items-center justify-center shadow-sm z-20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 4.2, type: "spring" }}
            >
              <Check className="w-3 h-3 text-white" strokeWidth={4} />
            </motion.div>

            {/* Absorption Rings */}
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-2xl border-2 border-primary"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0, 0.5, 0], scale: [1, 1.4] }}
                transition={{
                  delay: 3.8 + i * 0.2,
                  duration: 1,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const ExtractParticle = ({
  icon: Icon,
  label,
  color,
  bg,
  delay,
  x,
  y,
}: {
  icon: any;
  label: string;
  color: string;
  bg: string;
  delay: number;
  x: number;
  y: number;
}) => {
  return (
    <motion.div
      className={cn(
        "absolute flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg border border-white/50 backdrop-blur-sm z-40",
        bg
      )}
      style={{ marginLeft: x, marginTop: y }}
      initial={{ opacity: 0, scale: 0, y: y }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        // Move towards the bot at bottom right (approx coordinates relative to center)
        x: [x, 160],
        y: [y, 160],
      }}
      transition={{
        duration: 1.2,
        delay: delay,
        times: [0, 0.2, 0.8, 1],
        ease: "easeInOut",
      }}
    >
      <Icon className={cn("w-3.5 h-3.5", color)} />
      <span className={cn("text-[10px] font-bold", color)}>{label}</span>
    </motion.div>
  );
};

const Step2Visual = ({ loop = false }: { loop?: boolean }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!loop) return;
    const interval = setInterval(() => {
      setKey((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [loop]);

  return (
    <div
      key={key}
      className="relative w-full h-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center shadow-sm p-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-32 h-32 bg-white rounded-full shadow-2xl border border-indigo-100 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-indigo-500/5 rounded-full animate-ping" />
        <Bot className="w-14 h-14 text-indigo-600" />
      </motion.div>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-indigo-400 rounded-full shadow-lg ring-2 ring-white"
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: Math.cos((i * 72 * Math.PI) / 180) * 100,
            y: Math.sin((i * 72 * Math.PI) / 180) * 100,
            opacity: 1,
          }}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
        >
          <motion.div
            className="absolute top-1/2 left-1/2 h-[2px] bg-indigo-200 origin-left -translate-y-1/2 -translate-x-full -z-10"
            style={{
              transform: `rotate(${i * 72 + 180}deg)`,
              width: "100px",
              transformOrigin: "100% 50%",
              right: "50%",
              top: "50%",
            }}
          />
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[20%] left-[20%] text-xs font-medium bg-white/90 px-3 py-1.5 rounded-lg border shadow-sm text-indigo-600">
          Tone
        </div>
        <div className="absolute bottom-[25%] right-[20%] text-xs font-medium bg-white/90 px-3 py-1.5 rounded-lg border shadow-sm text-indigo-600">
          Policies
        </div>
        <div className="absolute top-[30%] right-[15%] text-xs font-medium bg-white/90 px-3 py-1.5 rounded-lg border shadow-sm text-indigo-600">
          FAQ
        </div>
      </motion.div>
    </div>
  );
};

const Step3Visual = ({ loop = false }: { loop?: boolean }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!loop) return;
    const interval = setInterval(() => {
      setKey((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [loop]);

  return (
    <div
      key={key}
      className="relative w-full h-full bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-xl border border-border/50 overflow-hidden flex flex-col items-center justify-center p-8 shadow-sm"
    >
      <div className="w-full max-w-sm space-y-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex justify-start"
        >
          <div className="bg-white border border-border px-5 py-3.5 rounded-2xl rounded-tl-none shadow-sm text-sm text-neutral-600 max-w-[85%]">
            Where is my order?
          </div>
        </motion.div>
        <TypingSequence loop={loop} />
      </div>
    </div>
  );
};

const TypingSequence = ({ loop = false }: { loop?: boolean }) => {
  const [showReply, setShowReply] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setShowTyping(true), 600);
    const t2 = setTimeout(() => {
      setShowTyping(false);
      setShowReply(true);
    }, 2000);

    if (loop) {
      const t3 = setTimeout(() => {
        setShowReply(false);
        setShowTyping(false);
        setKey((prev) => prev + 1);
      }, 4000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loop, key]);

  return (
    <>
      {showTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex justify-end"
        >
          <div className="bg-primary/10 px-4 py-2.5 rounded-2xl rounded-tr-none flex gap-1.5">
            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-75" />
            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-150" />
          </div>
        </motion.div>
      )}
      {showReply && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex justify-end"
        >
          <div className="bg-primary text-primary-foreground px-5 py-3.5 rounded-2xl rounded-tr-none shadow-lg text-sm max-w-[90%] relative overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute inset-0 bg-white/20 skew-x-12"
            />
            It's out for delivery! Arriving by 2 PM today. 📦
          </div>
        </motion.div>
      )}
    </>
  );
};

const Step4Visual = ({ loop = false }: { loop?: boolean }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!loop) return;
    const interval = setInterval(() => {
      setKey((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [loop]);

  return (
    <div
      key={key}
      className="relative w-full h-full bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center shadow-sm p-8"
    >
      <div className="relative w-full max-w-md h-64 bg-white rounded-xl border border-border shadow-xl p-6 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> EFRO Active
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
              Live Analysis
            </span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-3 h-full pb-2">
          {[30, 45, 35, 60, 55, 80, 95].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.1, duration: 0.6, type: "spring" }}
              className="flex-1 bg-emerald-100 rounded-t-md relative group overflow-hidden"
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md"
              />
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-400 font-medium uppercase">
              Revenue
            </span>
            <span className="text-lg font-bold text-emerald-600">+24%</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-neutral-400 font-medium uppercase">
              Churn
            </span>
            <span className="text-lg font-bold text-red-500">-12%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step5Visual = ({ loop = false }: { loop?: boolean }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!loop) return;
    const interval = setInterval(() => {
      setKey((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [loop]);

  return (
    <div
      key={key}
      className="relative w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center shadow-sm p-8"
    >
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-xl shadow-lg border border-border/50 col-span-2"
        >
          <div className="h-2.5 w-24 bg-neutral-100 rounded mb-3" />
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-neutral-800">94%</div>
            <div className="text-sm text-green-600 font-semibold flex items-center bg-green-50 px-2 py-1 rounded-md">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Resolution
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-xl shadow-lg border border-border/50 flex items-center justify-center"
        >
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-neutral-100"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-blue-500"
                strokeDasharray="200"
                strokeDashoffset="60"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-neutral-700">
              70%
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-xl shadow-lg border border-border/50 flex flex-col justify-center"
        >
          <div className="h-2 w-16 bg-neutral-100 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-2 w-full bg-neutral-50 rounded-full overflow-hidden">
              <div className="h-full w-[80%] bg-orange-400 rounded-full" />
            </div>
            <div className="h-2 w-full bg-neutral-50 rounded-full overflow-hidden">
              <div className="h-full w-[50%] bg-purple-400 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="absolute bottom-8 bg-neutral-900 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-xl flex items-center gap-2.5"
      >
        <Sparkles className="w-4 h-4 text-yellow-400" />
        <span>2 New Insights Found</span>
      </motion.div>
    </div>
  );
};

// --- Main Component ---

const steps = [
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
];

export const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (autoRotate && !isMobile) {
      intervalRef.current = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRotate, isMobile]);

  const handleStepChange = (index: number) => {
    if (activeStep === index) return;
    setActiveStep(index);
    setAutoRotate(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <section
      className="section-container py-24 md:py-32 relative overflow-hidden border-x "
      id="how-it-works"
    >
      <div className="section-container-padding">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-24">
          <h1 className="section-heading">What happens when you start</h1>
          <p className="section-subheadline">
            No complex integrations. No months of setup. Just instant,
            intelligent customer experience.
          </p>
        </div>

        {/* Mobile: Card Layout */}
        {isMobile ? (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            {steps.map((item, index) => {
              const VisualComponent = item.Visual;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white border border-border/50 rounded-2xl overflow-hidden"
                >
                  {/* Visual First */}
                  <div className="w-full h-[280px] relative overflow-hidden">
                    <VisualComponent loop={true} />
                  </div>

                  {/* Title, Description */}
                  <div className="p-6">
                    <div className="flex flex-col items-start gap-2">
                      <h3 className="text-lg text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Desktop: Original Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 section-content-padding items-start">
            {/* Left Column: Steps List */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {steps.map((item, index) => {
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
                    {steps.map((s, i) => {
                      // Render component only if it matches active step to mount/unmount
                      if (i !== activeStep) return null;
                      const VisualComponent = s.Visual;
                      return <VisualComponent key={i} />;
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
