"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ArrowDown,
  XCircle,
  CheckCircle,
  CheckCircle2,
  Check,
  DollarSign,
  Clock,
  TrendingDown,
  Users,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Heart,
  Zap,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function V2LandingPage() {
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-background grid place-items-center w-full px-4 py-24 gap-10">
        <div className="flex flex-col items-center text-center mt-18">
          <h1 className="text-4xl fot- mb-4">
            {/* Customer support that actually feels supportive. */}
            {/* Do more support with fewer agents — and happier customers. */}
            {/* Great support shouldn’t cost you more — it should earn you more. */}
            {/* When customers feel understood, they stay. MagicalCX makes that{" "} */}
            {/* happen. */}
            {/* Spend less on support. Earn more from every customer. */}
            {/* Support that feels human, helpful, and surprisingly simple. */}
            {/* Turns frustrated strangers into lifelong customers — fast. */}
            {/* Support that doesn’t make your team cry. Or your customers. */}
            {/* Most support sucks. Yours doesn’t have to. */}
            {/* People don’t leave brands. They leave bad experiences. */}
            {/* When customers feel heard, they stay. It’s that simple */}
            {/* Customer experience that actually feels human. */}
            {/* Finally, an AI that you're customers actually like talking to. */}
            {/* Finally — AI support that customers love talking to. */}
            {/* Finally, an AI agent that takes action, not just notes. */}
            {/* AI that pays for itself by growing revenue. */}
            {/* Support can be a revenue channel — not a cost centre. Only if you do it right */}
            {/* Make support the reason people stay, not leave. */}
            {/* Your customers deserve better than “please wait…”. */}
            {/* Automated support with measurable impact on CSAT, AHT, and resolution rate. */}
            {/* Maintain brand voice across thousands of conversations per day. */}
            {/* Improve CSAT, reduce refunds, increase lifetime value — reliably. */}
            {/* Turn your support queue into your best sales channel. */}
            {/* Make every customer feel like a VIP. Automatically. */}
            {/* Turn every customer conversation into revenue. */}
            From "How can I help?" to "It's already done."
            {/* Turn your customer conversations into revenue. */}
            {/* AI that sounds like you and works like your best teammate. */}
            {/* Enterprise-grade CX, without the Enterprise headache. */}
            {/* Stop using chatbots that apologize and do nothing. */}
            {/* Handle 10x more support without hiring 10x more people.{" "} */}
            {/* Reduce support costs without reducing support quality. */}
            {/* Enterprise-grade support with consistency you can trust. */}
            {/* Support that earns trust, reduces tickets, and increases revenue. */}
            {/* The modern infrastructure for customer conversation management. */}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {/* Resolve customer questions instantly, reduce support volume by 73%,
            and turn conversations into sales — without extra staff or tools. */}
            {/* MagicalCX doesn't just chat; it resolves. It processes refunds,
            updates subscriptions, and speaks with empathy—just like Sarah from
            your support team */}
            {/* Stop forcing your customers to wait for a human. MagicalCX resolves complex tickets, processes refunds, and manages subscriptions directly in the chat—with zero robotic awkwardness. */}
            {/* MagicalCX is the first empathy-led AI agent, which deeply integrates
            with your stack to execute tasks with empathy first. */}
            The world’s first AI that makes superior customer experience simple
            and scalable, while increasing profits and lowering costs.
            {/* MagicalCX is the first empathy-led AI agent that understands nuance,
            reads between the lines, and resolves issues instantly increasing
            revenue. */}
            {/* Meet the first empathy-led AI agent. MagicalCX understands nuance,
            reads between the lines, and handles your customers with the same
            care as your best support rep. */}
            {/* MagicalCX uses human-like conversations to solve problems instantly
            and identify upsell opportunities when your customers are happiest. */}
            {/* Deliver hyper-personalized, empathy-first support at scale. MagicalCX turns frustrated users into raving fans by solving their problems instantly—no waiting, no robotic scripts. */}
            {/* Finally, an AI agent smart enough to handle sensitive issues and take real actions without sounding like a robot. */}
          </p>

          <div className="flex justify-center w-full mt-8">
            <Button
              asChild
              size="lg"
              className="px-8 py-2 text-base font-semibold rounded-full bg-primary text-white hover:bg-neutral-900 transition-transform duration-200 hover:-translate-y-1 focus:ring-2 focus:ring-primary"
            >
              <Link
                href="https://calendly.com/echorift-ai"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={0}
                aria-label="Book a Demo"
                className="rounded-full"
              >
                Book a Demo
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid place-items-center w-full animate-fade-in">
          <img
            // src="https://i.postimg.cc/sgfLczMY/image.png"
            src="https://res.cloudinary.com/djmkshevy/image/upload/v1764321802/image_kp2ls8.jpg"
            alt="Customer support dashboard preview"
            className="rounded-md border border-muted w-full max-w-7xl h-auto mb-8 transition-all duration-300 mx-auto"
            loading="lazy"
          />
          {/* <Button
            asChild
            size="lg"
            className="mt-4 px-8 py-6 text-base font-semibold transition-transform duration-200 hover:-translate-y-1 focus:ring-2 focus:ring-primary"
          >
            <Link
              href="https://calendly.com/echorift-ai"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={0}
              aria-label="Book a Demo"
            >
              Book a Demo
            </Link>
          </Button> */}
        </div>
      </div>

      <BeforeVsAfter />

      <ProblemSection />

      <SolutionSection />

      <div className="my-24"></div>
    </div>
  );
}

const Header = () => {
  return (
    <nav className="w-full px-8 py-3 flex items-center justify-between bg-background border-b fixed top-0 left-0 z-50">
      <Link
        href="/"
        aria-label="Magical CX Home"
        tabIndex={0}
        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {/* <img
          src="/logo-transparent.png"
          alt="Magical CX Logo"
          className="w-10 h-10 rounded-full"
          loading="lazy"
        /> */}
        <span className="font- text-base tracking-tight">Magical CX</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="#features"
          aria-label="Features"
          tabIndex={0}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Features
        </Link>
        <Link
          href="#integration"
          aria-label="Integration"
          tabIndex={0}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Integration
        </Link>
        <Link
          href="#pricing"
          aria-label="Pricing"
          tabIndex={0}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Pricing
        </Link>
        <Link
          href="#resources"
          aria-label="Resources"
          tabIndex={0}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Resources
        </Link>

        <Link
          href="/demo"
          aria-label="Book Demo"
          tabIndex={0}
          className="ml-1 text-sm px-3 py-1 rounded-full font-medium bg-foreground text-background hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        >
          Book a demo
        </Link>
      </div>
    </nav>
  );
};

const BeforeVsAfter = () => {
  const beforeList = [
    "Customers wait minutes or hours for replies",
    "People ask the same question 3 different ways",
    "Your team is buried in repetitive queries",
    "Refund = money lost",
    "Support feels robotic, templated, transactional",
    "WhatsApp here, email there, DM somewhere else",
    "Hard to track conversations or measure quality",
    "Support = cost center eating profit",
    "Agents react to problems",
    "Churn rises silently after bad experiences",
  ];

  const afterList = [
    "Customers get answers instantly, on any channel",
    "They never repeat themselves — context is remembered",
    "60–80% of tickets handled automatically",
    "Refund becomes exchange, save, or upsell",
    "Support feels human, warm, helpful, natural",
    "All conversations sync into one single inbox",
    "Metrics, trends, and insights update in real time",
    "Support = revenue driver increasing LTV",
    "AI resolves proactively, reduces load",
    "Customers stay longer & return more often",
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl text-center mb-2">
        The transformation we deliver
      </h2>
      <p className="text-muted-foreground text-center mb-8 font-medium">
        See exactly how AI supercharges your support. Spot the difference — and
        imagine your team's potential.
      </p>

      <div className="grid grid-cols-2 gap-4 mt-12">
        <div className="flex flex-col gap-3 border rounded-md p-6 bg-muted border-muted-foreground">
          <h3 className="text-lg font-semibold mb-2">Before Magical CX</h3>
          {beforeList.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-base font-normal"
            >
              <X className="size-4 text-destructive" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3 border bg-black border-black rounded-md p-6">
            <h3 className="text-lg font-semibold mb-2 text-primary-foreground">
              After Magical CX
            </h3>
            {afterList.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-base font-medium text-primary-foreground"
              >
                <Check className="size-4 text-success" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProblemSection = () => {
  const businessProblems = [
    {
      icon: Clock,
      title: "Slow replies → abandoned carts",
      description:
        "Customers wait = they leave. Every delayed response is money walking out the door.",
    },
    {
      icon: TrendingDown,
      title: "Confusing flows → refunds + escalations",
      description:
        "Bad experience = refunds + churn. Direct revenue loss from poor support.",
    },
    {
      icon: Users,
      title: "Too many tools → high cost & zero clarity",
      description:
        "Agents switching platforms = 3-5 min per ticket lost. Thousands in wasted time.",
    },
    {
      icon: AlertCircle,
      title: "Support feels robotic → trust breaks → customers leave",
      description:
        "Poor follow-ups = no upsells, no LTV. Missed growth opportunities.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <div className="bg-muted rounded-xl p-8 md:p-12 border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col justify-center">
            <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">
              Problem
            </p>
            <h2 className="text-3xl md:text-4xl fontbold mb-6 leading-tight">
              Customers hate waiting.
            </h2>
            <div className="space-y-3 mb-8">
              <p className="text-base text-foreground">
                They hate repeating themselves.
              </p>
              <p className="text-base text-foreground">
                They hate feeling like they're talking to a bot that doesn't
                understand context.
              </p>
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-base text-muted-foreground leading-relaxed mb-2">
                Customer care shouldn't feel like pulling teeth.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                It should feel simple. Honest. Kind.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-0">
            {businessProblems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <div
                  key={index}
                  className="bg-background rounded-lg p-5 border border-border shadow-sm hover:shadow-md transition-shadow -mt-2 first:mt-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-muted border shrink-0">
                      <Icon
                        className="size-5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-mediu text-base mb-1.5">
                        {problem.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const SolutionSection = () => {
  const allFeatures = [
    {
      icon: Brain,
      title: "It listens.",
    },
    {
      icon: Heart,
      title: "It remembers.",
    },
    {
      icon: Sparkles,
      title:
        "It responds like someone who genuinely cares about the person typing on the other side.",
    },
    {
      icon: Zap,
      title: "Not more tickets.",
    },
    {
      icon: CheckCircle,
      title: "Not more tools.",
    },
    {
      icon: Heart,
      title:
        "Just smoother conversations, happier customers, and a support experience that feels kind.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <h2 className="text-3xl text-center mb-2">Meet MagicalCX.</h2>
      <p className="text-muted-foreground text-center mb-12 ">
        Not a chatbot. Not a help desk. A thoughtful AI teammate that answers
        like a human — but faster.
      </p>

      <div className="bg-muted rounded-xl p-8 md:p-12 border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {allFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-background rounded-lg p-4 lg:p-5 border border-border/50 shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-background border border-border/50 shrink-0">
                    <Icon
                      className="size-4 text-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-sm text-foreground font-medium leading-relaxed flex-1">
                    {feature.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
