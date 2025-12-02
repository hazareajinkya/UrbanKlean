"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export const Step2Visual = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center shadow-sm p-8">
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

