"use client";

import {
  Bot,
  RotateCcw,
  MessageSquare,
  Link as LinkIcon,
  TrendingDown,
  GitBranch,
  Settings,
  FileText,
  HelpCircle,
  UserCheck,
  Plug,
  DollarSign,
  Brain,
  CheckCircle2,
  Users,
  Zap,
  TrendingUp,
  GitMerge,
  RefreshCw,
  BarChart3,
  UserPlus,
  Cable,
  Coins,
  ShieldAlert,
  MessageCircleHeart,
  Hammer,
  HeartHandshake,
  EyeOff,
  Eye,
  Unplug,
  Gem,
  Megaphone,
} from "lucide-react";

const comparisons = [
  {
    old: { icon: FileText, text: "Robotic scripts that hit dead ends" },
    new: {
      icon: MessageCircleHeart,
      text: "Fluid conversations that actually resolve issues",
    },
  },
  {
    old: { icon: RotateCcw, text: "Forcing customers to repeat themselves" },
    new: { icon: Brain, text: "Remembers every detail, across every channel" },
  },
  {
    old: { icon: LinkIcon, text: "Throwing help links at angry customers" },
    new: { icon: Zap, text: "Takes action (refunds, updates) instantly" },
  },
  {
    old: { icon: ShieldAlert, text: "Just trying to deflect tickets" },
    new: {
      icon: TrendingUp,
      text: "Turning support chats into sales opportunities",
    },
  },
  {
    old: { icon: GitBranch, text: "Scattered conversations everywhere" },
    new: {
      icon: GitMerge,
      text: "One unified brain for Email, WhatsApp, & Web",
    },
  },
  {
    old: { icon: Hammer, text: "You building complex flowcharts" },
    new: {
      icon: HeartHandshake,
      text: "We handle the setup and training for you",
    },
  },
  {
    old: { icon: RefreshCw, text: "Manually updating stale answers" },
    new: { icon: Zap, text: "Syncs with your site automatically, every day" },
  },
  {
    old: { icon: HelpCircle, text: "Guessing if it's actually working" },
    new: { icon: BarChart3, text: "Weekly insights on revenue & resolution" },
  },
  {
    old: { icon: Bot, text: "Sounding like a generic robot" },
    new: { icon: Megaphone, text: "Speaks fluent 'You' (your brand voice)" },
  },
  {
    old: { icon: EyeOff, text: "Blind handoffs to human agents" },
    new: { icon: Eye, text: "Agents step in with full context ready" },
  },
  {
    old: { icon: Unplug, text: "Disconnected from your store data" },
    new: { icon: Cable, text: "Deeply integrated with Shopify & your stack" },
  },
  {
    old: { icon: DollarSign, text: "Optimizing for lowest cost" },
    new: { icon: Gem, text: "Optimizing for highest Customer Lifetime Value" },
  },
];

export const OldNewWay = () => {
  return (
    <section className="py-12 md:py-24 bg-muted/30 border">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-normal tracking-tight text-foreground mb-4 md:mb-6">
            Invest in an outcome.
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-light px-2">
            Stop settling for tools that just "deflect" tickets. Switch to a
            platform built to grow your business.
          </p>
        </div>

        {/* Split Container */}
        <div className="flex flex-col md:flex-row max-w-6xl mx-auto border border-border rounded-md overflow-hidden">
          {/* Left Side: The Old Way */}
          <div className="w-full md:w-1/2 bg-white p-6 md:p-8 lg:p-12 xl:p-16 border-b md:border-b-0 md:border-r border-border">
            <div className="mb-6 md:mb-8 md:sticky md:top-8 z-10 bg-white md:bg-white/95 md:backdrop-blur py-2">
              <h3 className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-normal">
                The Old Way
              </h3>
            </div>

            <div className="space-y-4 md:space-y-6">
              {comparisons.map((item, idx) => (
                <div
                  key={`old-${idx}`}
                  className="flex gap-3 md:gap-5 opacity-60 items-center"
                >
                  <item.old.icon className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground shrink-0" />
                  <div>
                    <h3 className="text-base md:text-lg text-foreground font-normal leading-snug">
                      {item.old.text}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: The MagicalCX Way */}
          <div className="w-full md:w-1/2 bg-primary p-6 md:p-8 lg:p-12 xl:p-16">
            <div className="mb-6 md:mb-8 md:sticky md:top-8 z-10 bg-primary md:bg-primary/95 md:backdrop-blur py-2">
              <h3 className="text-lg md:text-xl lg:text-2xl text-primary-foreground font-normal">
                The MagicalCX Way
              </h3>
            </div>

            <div className="space-y-4 md:space-y-6">
              {comparisons.map((item, idx) => (
                <div
                  key={`new-${idx}`}
                  className="flex gap-3 md:gap-5 items-center"
                >
                  <item.new.icon className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground shrink-0" />
                  <div>
                    <h3 className="text-base md:text-lg text-primary-foreground font-normal leading-snug">
                      {item.new.text}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
