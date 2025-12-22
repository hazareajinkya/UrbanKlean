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
  MessageCircleMore,
  MessageCircle,
  SplitSquareHorizontal,
  Split,
  AlignHorizontalJustifyCenter,
  Merge,
  FileTextIcon,
  Undo2,
  Redo2,
  Redo,
  Undo,
  Mail,
  User,
  RotateCw,
  DatabaseBackup,
  Repeat2,
  InfinityIcon,
} from "lucide-react";

const comparisons = [
  {
    old: {
      icon: Bot,
      // text: "Robotic replies that stop the moment things get real",
      // text: "Robotic replies that fail when it matters",
      // text: "Robotic replies that fail when it matters",
      text: "Fails with robotic replies when it matters",
      // text: "Scripts that can’t handle real customer problems",
    },
    new: {
      icon: MessageCircle,
      // text: "Human-like conversations that solve real problems",
      // text: "Human-like help that solves real issues",

      text: "Helps with human-like replies when it matters",
    },
  },
  {
    // old: { icon: RotateCcw, text: "Forcing customers to repeat themselves" },
    old: { icon: Repeat2, text: "Makes customers repeat themselves" },
    new: { icon: Brain, text: "Remembers every detail, across channels" },
    // new: { icon: Brain, text: "Memory that follows the customer everywhere" },
  },
  {
    old: {
      icon: LinkIcon,
      text: "Sends links when people need solutions",
    },
    new: { icon: Zap, text: "Takes action right inside the chat" },
  },
  {
    old: { icon: Split, text: "Designed to deflect tickets" },
    new: { icon: TrendingUp, text: "Designed to turn support into sales" },
  },
  // {
  //   old: {
  //     icon: AlignHorizontalJustifyCenter,
  //     text: "Scattered conversations everywhere",
  //   },
  //   new: {
  //     icon: GitMerge,
  //     text: "One unified inbox for every channel",
  //   },
  // },

  {
    old: {
      icon: HelpCircle,
      text: "Leaves you guessing",
    },
    // new: { icon: BarChart3, text: "Shows exactly what’s working at a glance" },
    // new: { icon: BarChart3, text: "Shows you what matters without digging" },
    new: {
      icon: FileTextIcon,
      text: "Tells you what customers actually care about",
    },
  },
  // {
  //   old: {
  //     icon: RefreshCw,
  //     text: "Makes you manually update answers",
  //   },
  //   new: {
  //     icon: DatabaseBackup,
  //     // text: "Syncs with your knowledgebase automatically",
  //     text: "Auto-syncs with your knowledgebase",
  //   },
  // },
  {
    old: { icon: Bot, text: "Makes your brand sound cold and generic" },
    // new: { icon: Megaphone, text: "Matches your brand voice in every message" },
    new: {
      icon: Megaphone,
      text: "Makes your brand sound warm and human",
      // text: "Makes your brand sound like… your brand",
    },
  },
  {
    old: {
      icon: Mail,
      text: "Tells customers to email for complex issues",
    },
    new: { icon: User, text: "Seamlessly brings in an agent when needed" },
  },
  {
    old: {
      icon: Unplug,
      text: "Disconnected from your tools and data",
    },
    new: {
      icon: Cable,
      text: "Works seamlessly with your CRM and data",
    },
  },
  // {
  //   old: { icon: DollarSign, text: "Optimizes for cost instead of customers" },
  //   // new: { icon: Gem, text: "Boosts LTV through better conversations" },
  //   new: { icon: Gem, text: "Optimizes for LTV instead of costs" },
  // },
];

export const OldNewWay = () => {
  return (
    <section className="section-container py-16 md:py-32 border section-content-padding">
      {/* Section Header */}
      <div className="text-center mb-12 md:mb-20">
        <h2 className="section-heading ">
          {/* Yesterdays helpdesk vs. Tomorrows CX. */}
          {/* From Outdated to Upgraded */}
          {/* Old Method vs New Standard. */}
          {/* From "I'm just a bot." to "I've got this." */}
          The Old Way vs The New Way
          {/* Slow, Repetitive, Frustrating vs Fast, Human, Effortless. */}
          {/* Yesterday's Support vs Tomorrow's Experience.  */}
          {/* Old Problems. New Solutions. */}
          {/* Support of the Past vs Experience of Tomorrow */}
        </h2>
        <p className="section-subheadline">
          {/* Most tools make support harder. MagicalCX makes it simpler, kinder,
            and far more effective. */}
          {/* A quick look at how support changes when it finally works the way it
            should. */}
          Two very different ways to handle support — only one makes sense.
        </p>
      </div>

      {/* Split Container */}
      <div className=" flex flex-col md:flex-row max-w-4xl mx-auto border border-border rounded-md overflow-hidden">
        {/* Left Side: The Old Way */}
        <div className="w-full md:w-1/2 bg-card px-4 py-6 md:px-6 lg:px-8 md:py-8 border-b md:border-b-0 md:border-r border-border">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg md:text-xl text-muted-foreground font-normal">
              The Old Way
            </h3>
            <Undo className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-6 pb-2 md:pb-0">
            {comparisons.map((item, idx) => (
              <div
                key={`old-${idx}`}
                className="flex gap-4 opacity-60 items-center"
              >
                <item.old.icon className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <h3 className="text-base text-foreground font-normal leading-snug">
                    {item.old.text}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: The MagicalCX Way */}
        <div className="w-full md:w-1/2 bg-primary px-4 py-6 md:px-6 lg:px-8 md:py-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg md:text-xl text-primary-foreground font-normal">
              The MagicalCX Way
            </h3>
            <Redo className="size-5 text-primary-foreground" />
          </div>
          <div className="space-y-6 pb-2 md:pb-0">
            {comparisons.map((item, idx) => (
              <div key={`new-${idx}`} className="flex gap-4 items-center">
                <item.new.icon className="w-5 h-5 text-primary-foreground shrink-0" />
                <div>
                  <h3 className="text-base text-primary-foreground font-normal leading-snug">
                    {item.new.text}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
