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

const OmnichannelVisual = () => (
  <div className="relative w-full h-full min-h-[240px] bg-gradient-to-b from-neutral-50 to-white flex flex-col items-center justify-center p-6 overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,#E2E8F0_1px,transparent_1px)] [background-size:20px_20px] rotate-12" />
    </div>

    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-border/60 overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-neutral-50/80 border-b md:border-b-0 md:border-r border-border/50 p-3 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
        {[
          { icon: MessageSquare, label: "All Chats", active: true, count: 5 },
          { icon: Instagram, label: "Instagram", count: 2 },
          { icon: Mail, label: "Email", count: 1 },
          { icon: Phone, label: "WhatsApp", count: 2 },
        ].map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg text-sm font-medium cursor-pointer transition-colors min-w-[120px] md:min-w-0",
              item.active
                ? "bg-white shadow-sm text-primary"
                : "hover:bg-neutral-100 text-neutral-600"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="flex-1">{item.label}</span>
            {item.count > 0 && (
              <span className="text-[10px] bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded-full">
                {item.count}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 space-y-4 bg-white relative">
        <div className="flex items-center justify-between border-b border-border/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              JD
            </div>
            <div>
              <div className="text-sm font-semibold">Jane Doe</div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Instagram className="w-3 h-3" /> via Instagram
              </div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground">Just now</div>
        </div>

        <div className="space-y-3">
          <motion.div
            className="bg-neutral-100 rounded-2xl rounded-tl-none p-3 text-sm text-neutral-700 max-w-[80%]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            When will my order #8829 arrive?
          </motion.div>
          <motion.div
            className="bg-primary text-white rounded-2xl rounded-tr-none p-3 text-sm max-w-[80%] ml-auto shadow-md"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            It's out for delivery today! 🚚
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);

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
        <h2 className="section-heading ">
          {/* Features built to{" "}
          <span className="text-muted-foreground">scale your support</span> */}
          <span className="text-muted-foreground">Everything you need to</span>{" "}
          deliver a magical experience
          {/* Why your team works better with{" "}
          <span className="font-serif italic">MagicalCX</span> */}
        </h2>
        <p className="section-subheadline">
          MagicalCX is designed to help every customer feel understood,
          supported, and genuinely cared for.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-y rounded-none max-w-7xl mx-auto overflow-hidden">
        {/* Row 1 */}
        <FeatureCard
          title="Conversational Memory"
          description="MagicalCX remembers past chats, orders, and details so customers don't repeat themselves"
          Visual={MemoryVisual}
        />
        <FeatureCard
          title="Takes Actions"
          description="Refunds, exchanges, and tracking—handled instantly without human help."
          Visual={ActionsVisual}
        />
        <FeatureCard
          title="Self-Learning Engine"
          description="Improves automatically with every conversation. No manual training needed."
          Visual={LearningVisual}
        />

        {/* Row 2 */}
        <div className="md:col-span-2 group relative bg-card flex flex-col">
          <div className="w-full h-[350px] bg-neutral-50/30 border-b border-border/50 overflow-hidden relative">
            <OmnichannelVisual />
          </div>
          <div className="p-6 md:p-8 bg-card z-10">
            <h3 className="text-lg mb-2">Omnichannel Inbox</h3>
            <p className="text-base font-normal text-muted-foreground leading-relaxed max-w-xl">
              Unify WhatsApp, Instagram, Email, and Webchat in one organized
              stream. Reply faster and never miss a customer message again.
            </p>
          </div>
        </div>

        <FeatureCard
          title="Auto-Sync Knowledge"
          description="Reads your website and FAQs daily to keep answers accurate and up-to-date."
          Visual={SyncVisual}
        />

        {/* Row 3 */}
        <FeatureCard
          title="Customer Profiles"
          description="A 360° view of orders, history, and behavior for personalized support."
          Visual={ProfileVisual}
        />
        <FeatureCard
          title="Workflows & Scenarios"
          description="Set simple rules to automate repetitive tasks like late order tracking."
          Visual={WorkflowVisual}
        />
        <FeatureCard
          title="Human Handoff"
          description="Instantly transfers complex issues to your team with full context."
          Visual={HandoffVisual}
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
