"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const Step3Visual = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-xl border border-border/50 overflow-hidden flex flex-col items-center justify-center p-8 shadow-sm">
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
        <TypingSequence />
      </div>
    </div>
  );
};

const TypingSequence = () => {
  const [showReply, setShowReply] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowTyping(true), 600);
    const t2 = setTimeout(() => {
      setShowTyping(false);
      setShowReply(true);
    }, 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

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

