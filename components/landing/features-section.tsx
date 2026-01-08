"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Brain,
  Zap,
  Sparkles,
  RefreshCw,
  User,
  GitBranch,
  Users,
  Check,
  Search,
  ArrowRight,
  FileText,
  ShieldCheck,
  Clock,
  CreditCard,
  Truck,
  Mail,
  Instagram,
  Phone,
} from "lucide-react";

// --- Visual Components ---

const MemoryVisual = () => (
  <div className="relative w-full h-full min-h-[200px] bg-neutral-50/50 flex items-center justify-center p-4 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
    <motion.div
      className="relative bg-white rounded-2xl shadow-lg border border-border/40 p-4 max-w-[220px] w-full space-y-3"
      initial={{ y: 10, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 border-b border-border/50 pb-2">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="w-3 h-3 text-blue-600" />
        </div>
        <div className="text-xs font-medium text-neutral-600">Customer</div>
      </div>
      <div className="space-y-2">
        <div className="bg-neutral-100 rounded-lg rounded-tl-none p-2 text-[10px] text-neutral-600">
          Do you have the shirt I bought last time?
        </div>
        <motion.div
          className="bg-blue-500 text-white rounded-lg rounded-tr-none p-2 text-[10px] ml-auto w-fit shadow-sm"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Yes! The Blue Oxford Shirt in Medium is in stock.
        </motion.div>
      </div>
      <div className="absolute -right-2 -top-2 bg-yellow-100 text-yellow-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm flex gap-1 items-center">
        <Brain className="w-2 h-2" />
        <span>Recalled</span>
      </div>
    </motion.div>
  </div>
);

const ActionsVisual = () => (
  <div className="relative w-full h-full min-h-[200px] bg-neutral-50/50 flex items-center justify-center p-4 overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    <div className="flex flex-col gap-3 w-full max-w-[200px]">
      {[
        {
          icon: RefreshCw,
          text: "Processing Refund",
          color: "text-orange-500",
          bg: "bg-orange-50",
        },
        {
          icon: Truck,
          text: "Tracking Order",
          color: "text-blue-500",
          bg: "bg-blue-50",
        },
        {
          icon: FileText,
          text: "Generating Invoice",
          color: "text-green-500",
          bg: "bg-green-50",
        },
      ].map((item, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-border/50 shadow-sm z-10"
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.2 }}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              item.bg
            )}
          >
            <item.icon className={cn("w-4 h-4", item.color)} />
          </div>
          <span className="text-xs font-medium text-neutral-700">
            {item.text}
          </span>
          {i === 0 && (
            <motion.div
              className="ml-auto w-2 h-2 rounded-full bg-green-500"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}
    </div>
  </div>
);

const HumanlyClearVisual = () => (
  <div className="relative w-full h-full min-h-[200px] bg-gradient-to-br from-blue-50/50 to-indigo-50/50 flex items-center justify-center p-4 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
    <div className="relative w-full max-w-[280px] space-y-3">
      {/* Customer frustrated message */}
      <motion.div
        className="flex items-start gap-2"
        initial={{ x: -20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
          <User className="w-3.5 h-3.5 text-neutral-500" />
        </div>
        <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 shadow-sm border border-border/50">
          <p className="text-[11px] text-neutral-600">I've been waiting 2 weeks for my order! 😤</p>
        </div>
      </motion.div>
      {/* Typing indicator */}
      <motion.div
        className="flex justify-end"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 1, 1, 0] }}
        transition={{ delay: 0.5, duration: 1.2, times: [0, 0.2, 0.8, 1] }}
      >
        <div className="bg-primary/10 px-3 py-2 rounded-2xl rounded-tr-none flex gap-1">
          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:75ms]" />
          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:150ms]" />
        </div>
      </motion.div>
      {/* Empathetic AI response */}
      <motion.div
        className="flex items-start gap-2 justify-end"
        initial={{ x: 20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
      >
        <div className="bg-primary text-white rounded-2xl rounded-tr-none px-3 py-2 shadow-md max-w-[200px] relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-white/20 skew-x-12"
            initial={{ x: "-100%" }}
            whileInView={{ x: "200%" }}
            transition={{ delay: 1.4, duration: 0.8 }}
          />
          <p className="text-[11px] relative z-10">I completely understand—that's frustrating. Let me check and fix this right now.</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Brain className="w-3.5 h-3.5 text-primary" />
        </div>
      </motion.div>
      {/* Humanly Clear badge */}
      <motion.div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-lg border border-green-100"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
      >
        <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-2.5 h-2.5 text-green-600" />
        </div>
        <span className="text-[10px] font-semibold text-green-700">HumanlyClear™</span>
      </motion.div>
    </div>
  </div>
);

const LearningVisual = () => (
  <div className="relative w-full h-full min-h-[200px] bg-neutral-50/50 flex items-center justify-center p-4 overflow-hidden">
    <div className="relative w-full max-w-[220px] aspect-video bg-white rounded-xl border border-border/50 shadow-sm p-3 flex items-end gap-1">
      {[20, 40, 35, 50, 65, 85, 95].map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-primary/20 rounded-t-sm relative group"
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          transition={{ delay: i * 0.1, type: "spring" }}
        >
          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-primary/40 to-transparent" />
        </motion.div>
      ))}
      <motion.div
        className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Sparkles className="w-2.5 h-2.5" />
        <span>+98% Accuracy</span>
      </motion.div>
    </div>
  </div>
);

const OmnichannelVisual = () => {
  const channels = [
    { icon: Instagram, label: "Instagram", color: "from-pink-500 to-purple-500", bg: "bg-gradient-to-br from-pink-100 to-purple-100" },
    { icon: Mail, label: "Email", color: "from-blue-500 to-cyan-500", bg: "bg-gradient-to-br from-blue-100 to-cyan-100" },
    { icon: Phone, label: "WhatsApp", color: "from-green-500 to-emerald-500", bg: "bg-gradient-to-br from-green-100 to-emerald-100" },
    { icon: MessageSquare, label: "Messenger", color: "from-blue-600 to-indigo-500", bg: "bg-gradient-to-br from-blue-100 to-indigo-100" },
  ];

  return (
    <div className="relative w-full h-full min-h-[300px] bg-gradient-to-br from-slate-50 to-neutral-100 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Central Unified Inbox */}
      <motion.div
        className="relative z-10 w-full max-w-[260px] bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {/* Header */}
        <div className="bg-neutral-50/80 border-b border-border/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-neutral-700">Unified Inbox</span>
          </div>
          <motion.div
            className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
          >
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span>Live</span>
          </motion.div>
        </div>

        {/* Messages from different channels */}
        <div className="p-3 space-y-2">
          {[
            { icon: Instagram, name: "Sarah M.", msg: "Love your products! 💕", color: "text-pink-500", delay: 0.3 },
            { icon: Mail, name: "John D.", msg: "Order inquiry #4521", color: "text-blue-500", delay: 0.5 },
            { icon: Phone, name: "Mike R.", msg: "Thanks for the help!", color: "text-green-500", delay: 0.7 },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50/80 border border-border/30"
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: item.delay, duration: 0.4 }}
            >
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 relative">
                <span className="text-[10px] font-bold text-neutral-500">{item.name.charAt(0)}</span>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <item.icon className={cn("w-2.5 h-2.5", item.color)} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-neutral-700 truncate">{item.name}</div>
                <div className="text-[10px] text-neutral-500 truncate">{item.msg}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating Channel Icons */}
      {channels.map((channel, i) => {
        const positions = [
          { x: -90, y: -60 },
          { x: 100, y: -40 },
          { x: -80, y: 80 },
          { x: 90, y: 60 },
        ];
        return (
          <motion.div
            key={i}
            className={cn("absolute w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-white/50", channel.bg)}
            style={{ left: `calc(50% + ${positions[i].x}px)`, top: `calc(50% + ${positions[i].y}px)` }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.15, type: "spring", stiffness: 200 }}
          >
            <channel.icon className={cn("w-5 h-5 bg-gradient-to-br bg-clip-text", channel.color.replace("from-", "text-").split(" ")[0])} />
            {/* Connection line to center */}
            <motion.div
              className="absolute w-[40px] h-[2px] bg-gradient-to-r from-neutral-200 to-transparent origin-left"
              style={{
                transform: `rotate(${Math.atan2(-positions[i].y, -positions[i].x) * 180 / Math.PI}deg)`,
                left: positions[i].x > 0 ? "auto" : "100%",
                right: positions[i].x > 0 ? "100%" : "auto",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 0.5 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
            />
          </motion.div>
        );
      })}

      {/* Pulse ring around central inbox */}
      <motion.div
        className="absolute w-[280px] h-[280px] rounded-3xl border-2 border-primary/20"
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

const SyncVisual = () => (
  <div className="relative w-full h-full min-h-[240px] bg-neutral-50/50 flex items-center justify-center p-4 overflow-hidden">
    <motion.div
      className="absolute w-32 h-32 border border-dashed border-neutral-300 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
    <div className="relative bg-white p-4 rounded-xl shadow-lg border border-border/50 flex items-center gap-4 z-10">
      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
        <GlobeIcon className="w-5 h-5" />
      </div>
      <ArrowRight className="w-4 h-4 text-neutral-400" />
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
        <Brain className="w-5 h-5" />
      </div>
      <motion.div
        className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-sm"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        SYNCED
      </motion.div>
    </div>
  </div>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const ProfileVisual = () => (
  <div className="relative w-full h-full min-h-[200px] bg-neutral-50/50 flex items-center justify-center p-4 overflow-hidden">
    <div className="w-full max-w-[220px] bg-white rounded-xl border border-border/50 shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-neutral-200" />
        <div>
          <div className="w-20 h-3 bg-neutral-200 rounded mb-1" />
          <div className="w-12 h-2 bg-neutral-100 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="bg-neutral-50 p-2 rounded-lg text-center">
          <div className="text-[10px] text-neutral-500 mb-1">LTV</div>
          <div className="text-xs font-bold text-green-600">$1,200</div>
        </div>
        <div className="bg-neutral-50 p-2 rounded-lg text-center">
          <div className="text-[10px] text-neutral-500 mb-1">Orders</div>
          <div className="text-xs font-bold text-neutral-700">15</div>
        </div>
      </div>
    </div>
  </div>
);

const WorkflowVisual = () => (
  <div className="relative w-full h-full min-h-[200px] bg-neutral-50/50 flex items-center justify-center p-4 overflow-hidden">
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white border border-border/50 p-2 rounded-lg shadow-sm text-xs font-medium text-neutral-600">
        Order Late?
      </div>
      <ArrowRight className="w-3 h-3 text-neutral-400 rotate-90" />
      <div className="bg-white border border-border/50 p-2 rounded-lg shadow-sm text-xs font-medium text-neutral-600">
        Check Status
      </div>
      <ArrowRight className="w-3 h-3 text-neutral-400 rotate-90" />
      <div className="flex gap-2">
        <div className="bg-green-50 border border-green-100 p-2 rounded-lg shadow-sm text-xs font-medium text-green-700">
          Email Update
        </div>
      </div>
    </div>
  </div>
);

const HandoffVisual = () => (
  <div className="relative w-full h-full min-h-[200px] bg-neutral-50/50 flex items-center justify-center p-4 overflow-hidden">
    <div className="relative flex items-center gap-4 md:gap-8">
      <motion.div
        className="w-12 h-12 bg-white rounded-xl border border-border shadow-sm flex items-center justify-center relative z-10"
        animate={{ scale: [1, 0.9, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Brain className="w-6 h-6 text-primary" />
      </motion.div>

      <div className="h-[2px] w-16 bg-neutral-200 relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2 bg-primary"
          animate={{ left: ["-50%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="w-12 h-12 bg-white rounded-xl border border-border shadow-sm flex items-center justify-center relative z-10">
        <User className="w-6 h-6 text-blue-600" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />
      </div>
    </div>
  </div>
);

// --- Main Component ---

export const FeaturesSection = () => {
  return (
    <section
      className="section-container py-24 md:py-32 border-x border-b"
      id="features"
    >
      <div className="max-w-5xl mx-auto text-center mb-16 section-container-padding">
        <h2 className="section-heading max-w-3xl mx-auto">
          {/* Features built to{" "}
          <span className="text-muted-foreground">scale your support</span> */}
          <span className="text-muted-foreground">
            Everything your brand needs to
          </span>{" "}
          deliver a magical customer experience
          {/* Why your team works better with{" "}
          <span className="font-serif italic">MagicalCX</span> */}
        </h2>
        <p className="section-subheadline">
          MagicalCX is designed to help all your customers feel understood,
          supported, and genuinely cared for. Anytime. Everytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-y rounded-none max-w-7xl mx-auto overflow-hidden">
        {/* Row 1 */}

        <FeatureCard
          title="HumanlyClear™ Conversations"
          description="Interactions that feel like your best human agents. Clear, empathetic, and context‑aware."
          Visual={HumanlyClearVisual}
        />
        <FeatureCard
          title="EFRO™ Engine "
          description="Decides if, when, and how to introduce upgrades, offers, or saves, only when it’s fair, timely, and genuinely helpful."
          Visual={ActionsVisual}
        />
        <FeatureCard
          title="Conversational Memory"
          description="MagicalCX remembers past chats, orders, and details so customers don't repeat themselves"
          Visual={MemoryVisual}
        />

        {/* Row 2 */}
        {/* <div className="md:col-span-2 group relative bg-card flex flex-col">
          <div className="w-full h-[350px] bg-neutral-50/30 border-b border-border/50 overflow-hidden relative">
            <OmnichannelVisual />
          </div>
          <div className="p-6 md:p-8 bg-card z-10">
            <h3 className="text-lg mb-2">Omnichannel Inbox</h3>
            <p className="text-base font-normal text-muted-foreground leading-relaxed max-w-xl">
              One Intelligent CX brain which unifies Webchat, Email, WhatsApp,
              Instagram, and Messenger in one organized stream.
            </p>
          </div>
        </div> */}

        <FeatureCard
          title="Omnichannel Inbox"
          description="One Intelligent CX brain which unifies Web, Email, Whatsapp, Instagram, and Messenger in one organized stream."
          Visual={OmnichannelVisual}
        />
        <FeatureCard
          title="Guided Workflows & Scenarios"
          // description="Set simple rules to automate repetitive tasks like late order tracking."
          // description=" Onboarding, returns, and more become guided, intuitive flows that reduce effort,  and help customers complete what they came to do"
          description="Automate complex processes like onboarding, returns, and plan changes into guided flows."
          Visual={WorkflowVisual}
        />

        {/* Row 3 */}
        <FeatureCard
          title="Customer Profiles"
          description="Provides you 360° view of each customer so every conversation stays personalized, precise, and humanly aware."
          Visual={ProfileVisual}
        />

        <FeatureCard
          title="Business Insights"
          description="Clear, actionable insights into customer relationships, journeys, friction points, and contact patterns."
          Visual={SyncVisual}
        />

        <FeatureCard
          title="Seamless Human Handoff"
          description="Transfers seamlessly to humans when needed within the same conversation with full context."
          Visual={HandoffVisual}
        />
        <FeatureCard
          title="Self-learning Engine"
          description="Improves with every conversation, so experiences grow more intelligent and consistent."
          Visual={LearningVisual}
        />
      </div>
    </section>
  );
};

const FeatureCard = ({
  title,
  description,
  Visual,
}: {
  title: string;
  description: string;
  Visual: React.ComponentType;
}) => {
  return (
    <div className="group relative bg-card flex flex-col h-full">
      <div className="w-full h-[350px] bg-muted border-b overflow-hidden relative">
        <Visual />
      </div>
      <div className="p-6 md:p-8 bg-card z-10 flex flex-col justify-start">
        <h3 className="text-lg mb-2">{title}</h3>
        <p className="text-base font-normal text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

//TODO: Add a separate full features page from here list and more https://poe.com/s/NgncfZnaFmEoMxib4FRU
