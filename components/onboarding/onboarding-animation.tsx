"use client";

import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Truck,
  Languages,
  Heart,
  MoreHorizontal,
  CheckCircle2,
} from "lucide-react";

type Message = {
  role: "user" | "agent";
  text: string;
};

type Scenario = {
  id: string;
  color: string;
  icon: React.ReactNode;
  messages: Message[];
  tag: string;
  chips: string[];
};

const SCENARIOS: Scenario[] = [
  {
    id: "returns",
    color: "cyan",
    icon: <ShoppingBag className="w-4 h-4" />,
    messages: [
      { role: "user", text: "I need to return order #8821." },
      { role: "agent", text: "I can help. Is the item damaged?" },
      { role: "user", text: "No, just wrong size." },
      { role: "agent", text: "Got it. Return label sent to your inbox!" },
    ],
    tag: "Instant Resolution",
    chips: ["Automated Returns"],
  },
  {
    id: "security",
    color: "emerald",
    icon: <ShieldCheck className="w-4 h-4" />,
    messages: [
      { role: "user", text: "Is my customer data secure?" },
      { role: "agent", text: "Yes, we use enterprise-grade encryption." },
      { role: "user", text: "Do you train on my data?" },
      { role: "agent", text: "Never. Your data stays private." },
    ],
    tag: "Trust & Safety",
    chips: ["SOC2 Compliant"],
  },
  {
    id: "pricing",
    color: "indigo",
    icon: <CreditCard className="w-4 h-4" />,
    messages: [
      { role: "user", text: "Do you offer enterprise plans?" },
      { role: "agent", text: "Yes! Unlimited seats & dedicated support." },
      { role: "user", text: "Can I get a demo?" },
      { role: "agent", text: "Booking you a slot for Tuesday!" },
    ],
    tag: "Sales Agent",
    chips: ["Lead Qualification"],
  },
  {
    id: "shipping",
    color: "blue",
    icon: <Truck className="w-4 h-4" />,
    messages: [
      { role: "user", text: "Where is my package?" },
      { role: "agent", text: "Order #8821 is out for delivery." },
      { role: "user", text: "Can I change delivery instructions?" },
      { role: "agent", text: "Updated: Leave at front door." },
    ],
    tag: "Logistics",
    chips: ["Real-time Tracking"],
  },
  {
    id: "multilingual",
    color: "orange",
    icon: <Languages className="w-4 h-4" />,
    messages: [
      { role: "user", text: "Hablas español?" },
      { role: "agent", text: "¡Sí! Hablo español y 30 idiomas más." },
      { role: "user", text: "Genial! Necesito ayuda." },
      { role: "agent", text: "Claro, ¿en qué puedo ayudarte hoy?" },
    ],
    tag: "Multilingual",
    chips: ["30+ Languages"],
  },
  {
    id: "empathy",
    color: "teal",
    icon: <Heart className="w-4 h-4" />,
    messages: [
      { role: "user", text: "I'm really frustrated, my bill is wrong again!" },
      {
        role: "agent",
        text: "I hear you, and I am truly sorry for the stress this caused.",
      },
      { role: "user", text: "I just want it fixed." },
      {
        role: "agent",
        text: "I've credited your account $50 and fixed the error permanently.",
      },
    ],
    tag: "Empathy Engine",
    chips: ["Sentiment Analysis"],
  },
];

export function OnboardingAnimation() {
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

  // Loop Logic
  const [index, setIndex] = useState(0);

  // 10 seconds fixed duration per card
  const SCENARIO_DURATION = 10000;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % SCENARIOS.length);
    }, SCENARIO_DURATION);

    return () => clearInterval(interval);
  }, []);

  const scenario = SCENARIOS[index];

  return (
    <div
      className="hidden lg:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 relative overflow-hidden h-full w-full perspective-1000 gap-12"
      onMouseMove={onMouseMove}
      style={{ perspective: 1000 }}
    >
      {/* Background Ambience */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br transition-colors duration-[2000ms] ease-in-out
          ${scenario.color === "cyan"
            ? "from-cyan-950/40 via-blue-950/20 to-zinc-950"
            : scenario.color === "emerald"
              ? "from-emerald-950/40 via-teal-950/20 to-zinc-950"
              : scenario.color === "blue"
                ? "from-blue-950/40 via-sky-950/20 to-zinc-950"
                : scenario.color === "orange"
                  ? "from-orange-950/40 via-amber-950/20 to-zinc-950"
                  : scenario.color === "teal"
                    ? "from-teal-950/40 via-emerald-950/20 to-zinc-950"
                    : "from-indigo-950/40 via-violet-950/20 to-zinc-950"
          }
        `}
      />

      {/* Main Heading */}
      <div className="z-20 text-center px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl font-medium tracking-tight text-zinc-100 max-w-[420px] mx-auto"
        >
          Make your customers happier and your business more profitable.
        </motion.h2>
      </div>

      {/* Main Card */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-[420px] z-10"
      >
        {/* Glow Core */}
        <motion.div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[80px] -z-10 transition-colors duration-[2000ms]
                ${scenario.color === "cyan"
              ? "bg-cyan-500/20"
              : scenario.color === "emerald"
                ? "bg-emerald-500/20"
                : scenario.color === "blue"
                  ? "bg-blue-500/20"
                  : scenario.color === "orange"
                    ? "bg-orange-500/20"
                    : scenario.color === "teal"
                      ? "bg-teal-500/20"
                      : "bg-indigo-500/20"
            }
            `}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 ring-1 ring-white/5 flex flex-col min-h-[500px]">
          {/* Header */}
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

          {/* Chat Area */}
          <div className="flex-1 relative flex flex-col justify-end">
            <AnimatePresence mode="wait">
              <ChatSequence key={scenario.id} scenario={scenario} />
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const ChatSequence = ({ scenario }: { scenario: Scenario }) => {
  return (
    <motion.div
      className="w-full h-full flex flex-col justify-between"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="p-6 space-y-4">
        {scenario.messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            scenarioColor={scenario.color}
          />
        ))}
      </div>

      {/* Chips Area */}
      <div className="px-6 pb-6 pt-2">
        <div className="flex flex-wrap gap-2 justify-center">
          {scenario.chips.map((chip, i) => (
            <div
              key={i}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border
                ${scenario.color === "cyan"
                  ? "bg-cyan-500/5 text-cyan-300 border-cyan-500/10"
                  : scenario.color === "emerald"
                    ? "bg-emerald-500/5 text-emerald-300 border-emerald-500/10"
                    : scenario.color === "blue"
                      ? "bg-blue-500/5 text-blue-300 border-blue-500/10"
                      : scenario.color === "orange"
                        ? "bg-orange-500/5 text-orange-300 border-orange-500/10"
                        : scenario.color === "teal"
                          ? "bg-teal-500/5 text-teal-300 border-teal-500/10"
                          : "bg-indigo-500/5 text-indigo-300 border-indigo-500/10"
                }
              `}
            >
              <CheckCircle2 className="w-3 h-3 opacity-70" />
              {chip}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const MessageBubble = ({
  message,
  scenarioColor,
}: {
  message: Message;
  scenarioColor: string;
}) => {
  const isAgent = message.role === "agent";

  return (
    <div
      className={`flex ${isAgent ? "justify-start" : "justify-end"} w-full`}
    >
      <div
        className={`
            max-w-[85%] text-[13px] leading-relaxed shadow-lg relative
            ${isAgent
            ? "bg-zinc-900/60 backdrop-blur-md border border-white/10 text-zinc-300 rounded-2xl rounded-tl-sm px-4 py-3"
            : "bg-zinc-800/80 backdrop-blur-md border border-white/5 text-zinc-200 rounded-2xl rounded-tr-sm px-4 py-3"
          }
        `}
      >
        {isAgent && (
          <div
            className={`absolute inset-0 bg-gradient-to-br from-${scenarioColor}-500/10 to-transparent pointer-events-none rounded-2xl rounded-tl-sm`}
          />
        )}
        <div className="relative z-10">
          <span>{message.text}</span>
        </div>
      </div>
    </div>
  );
};
