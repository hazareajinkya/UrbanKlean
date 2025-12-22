"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export const Step4Visual = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center shadow-sm p-8">
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

