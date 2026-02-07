import React from 'react'
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ScanLine, Zap, CheckCircle2, Box, MoreHorizontal } from 'lucide-react';

export default function OnboardingAnimation() {
  // Parallax Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  const rotateX = useTransform(mouseY, [-300, 300], [2.5, -2.5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-2.5, 2.5]);

  // Static final state - resolved
  const sentiment = "resolved";

  // Background Gradient Colors based on Sentiment
  const bgColors = {
    neutral: "from-zinc-900 via-zinc-950 to-black",
    frustrated: "from-orange-950/40 via-red-950/20 to-zinc-950",
    resolved: "from-emerald-950/40 via-teal-950/20 to-zinc-950",
  };

  return (
    <div
      className="hidden lg:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 relative overflow-hidden perspective-1000"
      onMouseMove={onMouseMove}
      style={{ perspective: 1000 }}
    >
      <div className="z-20 text-center px-8 mb-10">
        {/* <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl font-medium text-zinc-100 max-w-lg mx-auto"
        >
          Make your customers happier and your business more profitable.
        </motion.h2> */}
      </div>
      <div className={`absolute inset-0 bg-gradient-to-br ${bgColors[sentiment]}`} />


      <div
        className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] blur-[120px] rounded-full mix-blend-screen bg-emerald-500/10"
      />
      <div
        className="absolute bottom-[10%] -left-[10%] w-[60%] h-[60%] blur-[100px] rounded-full mix-blend-screen bg-teal-500/10"
      />

      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-md z-10"
      >

        <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
          <InsightNode
            text="Sentiment: Frustrated"
            icon={<Zap className="w-3 h-3 text-orange-400" />}
            position="top-18 -right-28"
            color="border-orange-500/30 bg-orange-500/10 text-orange-200"
          />

          <InsightNode
            text="Intent: Damaged Item"
            icon={<ScanLine className="w-3 h-3 text-blue-400" />}
            position="top-35 -left-24"
            color="border-blue-500/30 bg-blue-500/10 text-blue-200"
          />

          <InsightNode
            text="Action: Replacement"
            icon={<CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            position="bottom-40 -right-24"
            color="border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          />
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10">
          <div className="relative z-10 flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/logos/magicalcx-appicon-light.png"
                  alt="logo"
                  className="h-8 w-8 rounded-full shadow-lg shadow-black/20"
                />
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
              </div>
              <div>
                <span className="block text-sm font-medium tracking-wide text-zinc-100">
                  MagicalCX
                </span>
                <span className="block text-[10px] text-zinc-400 font-medium">
                  Always active
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MoreHorizontal className="w-5 h-5 text-zinc-500" />
            </div>
          </div>

          <div className="p-6 space-y-6 h-[537px]">
            <div className="flex justify-end relative group">
              <div className="bg-zinc-800/80 backdrop-blur-md text-zinc-200 rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[85%] text-sm leading-relaxed shadow-lg border border-white/5 relative overflow-hidden">
                My order #4029 arrived damaged. It's broken in half. I'm really frustrated.
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 text-zinc-300 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[95%] text-sm leading-relaxed shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <p className="mb-4 relative z-10">
                  I'm so sorry, Jane. That's definitely not the experience we want for you.
                </p>
                <p className="relative z-10">
                  I've already processed a free replacement for you immediately.
                </p>
              </div>
            </div>

            <div className="ml-4 max-w-[85%]">
              <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center justify-between relative z-10 group cursor-pointer hover:bg-black/60 transition-colors shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-green-400">
                        Replacement Order
                      </span>
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      Order #4029-B
                    </div>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-medium text-zinc-300 border border-white/5">
                  Shipped
                </div>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 text-zinc-300 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[95%] text-sm leading-relaxed shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <p className="relative z-10">
                  Is there anything else I can help you with today?
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="bg-zinc-800/80 backdrop-blur-md text-zinc-200 rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[85%] text-sm leading-relaxed shadow-lg border border-white/5">
                No, that's perfect! Thank you so much!
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const InsightNode = ({
  text,
  icon,
  position,
  color,
}: {
  text: string;
  icon: React.ReactNode;
  position: string;
  color: string;
}) => {
  return (
    <div
      className={`absolute ${position} flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-xl ${color}`}
    >
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-wider">
        {text}
      </span>
    </div>
  );
};
