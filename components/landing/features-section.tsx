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
  <div className="w-full h-full min-h-[200px] bg-[#eeecea] flex items-center justify-center px-4 py-6 overflow-hidden">
    <div className="w-full max-w-[320px] space-y-3">
      {/* User — right */}
      <motion.div
        className="flex items-end justify-end gap-2"
        initial={{ y: 8, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="bg-neutral-900 text-white px-3.5 py-2 rounded-2xl rounded-br-sm text-[11px] leading-snug max-w-[210px] shadow-sm">
          Do you have the shirt I bought last time?
        </div>
        <img src="https://i.pravatar.cc/80?img=32" alt="" className="w-7 h-7 rounded-full flex-shrink-0 object-cover shadow-sm" />
      </motion.div>

      {/* AI — left (both bubbles grouped under one avatar) */}
      <motion.div
        className="flex items-end gap-2"
        initial={{ y: 8, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.35, ease: "easeOut" }}
      >
        <img src="https://i.pravatar.cc/80?img=12" alt="" className="w-7 h-7 rounded-full flex-shrink-0 object-cover shadow-sm" />
        <div className="space-y-1.5 max-w-[240px]">
          <motion.div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-200 w-fit"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.25 }}
          >
            <Brain className="w-2.5 h-2.5 text-yellow-600" />
            <span className="text-[9px] font-medium text-yellow-700">Past order recalled</span>
          </motion.div>
          <div className="bg-white text-neutral-800 px-3.5 py-2 rounded-2xl rounded-bl-sm text-[11px] leading-snug shadow-sm w-full">
            Yes! The Blue Oxford Shirt in Medium is back in stock
          </div>
          <motion.div
            className="bg-white text-neutral-800 px-3.5 py-2 rounded-2xl text-[11px] leading-snug shadow-sm w-full"
            initial={{ y: 6, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.35, ease: "easeOut" }}
          >
            Want me to add size L to your cart? Same as your last order 🛒
          </motion.div>
        </div>
      </motion.div>
    </div>
  </div>
);

const EFROVisual = () => (
  <div className="w-full h-full min-h-[200px] bg-[#eeecea] flex items-center justify-center px-4 py-6 overflow-hidden">
    <div className="w-full max-w-[320px] space-y-3">
      {/* User — right */}
      <motion.div
        className="flex items-end justify-end gap-2"
        initial={{ y: 8, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="bg-neutral-900 text-white px-3.5 py-2 rounded-2xl rounded-br-sm text-[11px] leading-snug max-w-[210px] shadow-sm">
          I&apos;m buying the running shoes
        </div>
        <img src="https://i.pravatar.cc/80?img=5" alt="" className="w-7 h-7 rounded-full flex-shrink-0 object-cover shadow-sm" />
      </motion.div>

      {/* AI — left */}
      <motion.div
        className="flex items-end gap-2"
        initial={{ y: 8, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.35, ease: "easeOut" }}
      >
        <img src="https://i.pravatar.cc/80?img=12" alt="" className="w-7 h-7 rounded-full flex-shrink-0 object-cover shadow-sm" />
        <div className="space-y-1.5 max-w-[240px]">
          <motion.div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 w-fit"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.25 }}
          >
            <Zap className="w-2.5 h-2.5 text-amber-500" />
            <span className="text-[9px] font-medium text-amber-600">EFRO™ checking...</span>
          </motion.div>
          <div className="bg-white text-neutral-800 px-3.5 py-2 rounded-2xl rounded-bl-sm text-[11px] leading-snug shadow-sm w-full">
            Runners who got these also loved our performance socks, 30% off when bundled!
          </div>
          <motion.div
            className="bg-white rounded-xl p-2 shadow-sm border border-neutral-100"
            initial={{ y: 8, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-sm">🧦</div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-neutral-700">Pro Running Socks</p>
                <p className="text-[9px] text-neutral-400 line-through">$18</p>
              </div>
              <div className="text-[11px] font-medium text-emerald-600">$12.60</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </div>
);

const HumanlyClearVisual = () => (
  <div className="w-full h-full min-h-[200px] bg-[#eeecea] flex items-center justify-center px-4 py-6 overflow-hidden">
    <div className="w-full max-w-[320px] space-y-3">
      {/* User 1 — right */}
      <motion.div className="flex items-end justify-end gap-2" initial={{ y: 8, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.35, ease: "easeOut" }}>
        <div className="bg-neutral-900 text-white px-3.5 py-2 rounded-2xl rounded-br-sm text-[11px] leading-snug max-w-[210px] shadow-sm">
          You sent me the wrong size wtf, I ordered L and got S
        </div>
        <img src="https://i.pravatar.cc/80?img=47" alt="" className="w-7 h-7 rounded-full flex-shrink-0 object-cover shadow-sm" />
      </motion.div>

      {/* AI 1 & 2 — left, one avatar */}
      <motion.div className="flex items-end gap-2" initial={{ y: 8, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.35, ease: "easeOut" }}>
        <img src="https://i.pravatar.cc/80?img=12" alt="" className="w-7 h-7 rounded-full flex-shrink-0 object-cover shadow-sm" />
        <div className="space-y-1.5 max-w-[240px]">
          <div className="bg-white text-neutral-800 px-3.5 py-2 rounded-2xl rounded-bl-sm text-[11px] leading-snug shadow-sm">
            That&apos;s our mistake, not yours. Really sorry. I&apos;m raising a replacement for size L right now. Tracking details within the hour
          </div>
          <motion.div className="bg-white text-neutral-800 px-3.5 py-2 rounded-2xl text-[11px] leading-snug shadow-sm" initial={{ y: 6, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, duration: 0.35, ease: "easeOut" }}>
            No need to return the wrong one either, keep it 💙
          </motion.div>
        </div>
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
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
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
          description="Decides if, when, and how to introduce upgrades, offers, or saves, only when it's fair, timely, and genuinely helpful."
          Visual={EFROVisual}
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
