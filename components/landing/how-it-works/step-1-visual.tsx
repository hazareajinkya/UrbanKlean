"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Check,
  Globe,
  Search,
  LayoutTemplate,
  Palette,
  MessageSquare,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Step1Visual = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center shadow-sm p-6">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

      <div className="relative w-full max-w-[420px] aspect-[4/3] flex items-center justify-center">
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

