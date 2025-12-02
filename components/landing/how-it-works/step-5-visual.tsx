"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";

export const Step5Visual = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center shadow-sm p-8">
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

