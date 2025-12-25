"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const faqData = [
  {
    id: "general",
    label: "General",
    items: [
      {
        question: "What is EFRO™?",
        answer: (
          <div className="space-y-4">
            <p>
              EFRO™ (Empathy-First Revenue Orchestrator) is MagicalCX’s built-in
              revenue engine.
            </p>

            <p>
              It understands customer intent in real time and knows when to step
              in, suggesting the right next step, upgrade, or offer only when it
              genuinely helps the customer move forward.
            </p>

            <p>
              That means your support doesn’t just resolve issues. It quietly
              supports growth.
            </p>

            <p>
              More yeses. Fewer pushy moments. Revenue that feels natural, not
              forced.
            </p>
          </div>
        ),
      },

      {
        question: "What is HumanlyClear™?",
        answer: (
          <div className="space-y-4">
            <p>
              HumanlyClear™ is MagicalCX’s quality standard for “human-grade”
              conversations, clear, warm, and action-oriented.
            </p>
            <p>
              It makes answers easy to understand, asks only what’s needed, and
              guides customers to the next step fast, so they feel helped (not
              handled) and your support and sales conversations convert better.
            </p>
          </div>
        ),
      },
      {
        question: "Is this just another chatbot?",
        answer: (
          <div className="space-y-4">
            <p>No. Chatbots follow scripts.</p>
            <p>
              MagicalCX understands meaning, tone, frustration, emotions, and
              context and solves the problem like a real teammate using EFRO™
              and HumanlyClear™.
            </p>
          </div>
        ),
      },
      {
        question: "Can it fix real issues or only answer questions?",
        answer: (
          <div className="space-y-4">
            <p>It fixes real issues.</p>
            <p>
              Order updates, size swaps, address changes, subscription upgrades,
              booking calls, etc. — all done within the conversation.
            </p>
          </div>
        ),
      },
      {
        question: "Will it sound like a robot?",
        answer: (
          <div className="space-y-4">
            <p>No.</p>
            <p>
              It sounds exactly like you want your brand to—friendly or
              professional, authoritative or kind, direct or thoughtful.
            </p>
          </div>
        ),
      },

      {
        question: "Does this work for voice calls too?",
        answer: (
          <div className="space-y-4">
            <p>Yes.</p>
            <p>
              Customers can talk naturally, and MagicalCX handles the call
              calmly without the usual "please hold" chaos.
            </p>
          </div>
        ),
      },
      {
        question: "Will it replace my team?",
        answer: (
          <div className="space-y-4">
            <p>Yes, only to the extent you want it to.</p>
            <p>
              MagicalCX can be engineered to fully replace human agents with
              brand‑aligned, agentic bots that handle your customer interactions
              end‑to‑end with HumanlyClear™ and EFRO™. Whether you use that
              power to support your team or to replace it is a business
              decision, not a technical limitation.
            </p>
          </div>
        ),
      },
      {
        question: "Is this right for my business?",
        answer: (
          <div className="space-y-4">
            <p>If you want to improve sales, yes.</p>
            <p>If you sell online, definitely.</p>
            <p>
              If you want happier customers and fewer headaches, it's a great
              fit.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    id: "setup",
    label: "Setup & Technical",
    items: [
      {
        question: "Is it complicated to set up?",
        answer: (
          <div className="space-y-4">
            <p>No. Not at all.</p>
            <p>You can do it yourself or we set everything up for you.</p>
          </div>
        ),
      },
      {
        question: "Do I need a tech team?",
        answer: (
          <div className="space-y-4">
            <p>Not at all.</p>
            <p>If you can use a phone, you can use MagicalCX.</p>
          </div>
        ),
      },
      {
        question: "How do I control what it can or can't say?",
        answer: (
          <div className="space-y-4">
            <p>You set the rules.</p>

            <p>
              We guide you through simple multiple-choice questions to choose
              the tone, define boundaries, flag sensitive topics, and set
              escalation triggers.
            </p>

            <p>It stays within your boundaries, every time.</p>
          </div>
        ),
      },
      {
        question: "Can I see why it gave a certain answer?",
        answer: (
          <div className="space-y-4">
            <p>Yes.</p>
            <p>
              You can review replies and adjust them in plain, everyday
              language.
            </p>
          </div>
        ),
      },
      {
        question: "Does it work with Shopify, WhatsApp, Instagram, etc.?",
        answer: (
          <div className="space-y-4">
            <p>Yes.</p>
            <p>
              It connects smoothly with Shopify, WooCommerce, WhatsApp,
              Instagram DMs, Email, Messenger, and more.
            </p>
          </div>
        ),
      },
      {
        question: "Will it slow down my website?",
        answer: (
          <div className="space-y-4">
            <p>No.</p>
            <p>It's lightweight and loads in the background.</p>
          </div>
        ),
      },
      {
        question: "Is my customer data safe?",
        answer: (
          <div className="space-y-4">
            <p>Yes.</p>
            <p>Your data stays yours, private, protected, and never shared.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    items: [
      {
        question: "What counts as a message?",
        answer: (
          <div className="space-y-4">
            <p>Any message sent or received:</p>
            <p>Customer writes = 1</p>
            <p>MagicalCX replies = 1</p>
            <p>Simple.</p>
          </div>
        ),
      },
      {
        question: "Are there any hidden fees?",
        answer: (
          <div className="space-y-4">
            <p>None.</p>
            <p>You only pay for your plan and your message usage.</p>
          </div>
        ),
      },
      {
        question: "Can I upgrade or downgrade later?",
        answer: (
          <div className="space-y-4">
            <p>Yes.</p>
            <p>You can upgrade, downgrade or cancel your plan at anytime.</p>
          </div>
        ),
      },
      {
        question: "Is there a free trial?",
        answer: (
          <div className="space-y-4">
            <p>Yes. We offer a 14-day free trial.</p>
            <p>Try it and see how it feels for your brand.</p>
          </div>
        ),
      },
      {
        question: "How does this help my revenue?",
        answer: (
          <div className="space-y-4">
            <p>
              Our unique Empathy-First Revenue Orchestrator (EFRO™) technology
              intelligently identifies the perfect, non-pushy moments to present
              relevant offers or upsells.
            </p>
            <p>
              This builds trust, leading directly to more conversions, higher
              order values, and increased customer loyalty.
            </p>
          </div>
        ),
      },
      {
        question: "Does MagicalCX reduce support costs?",
        answer: (
          <div className="space-y-4">
            <p>Yes. Of course!</p>
            <p>
              MagicalCX automates common questions with instant, empathetic,
              accurate replies, reduces ticket volume, and cuts agent time by
              handling repetitive support 24/7
            </p>
          </div>
        ),
      },
      {
        question: "Is this cheaper than hiring someone?",
        answer: (
          <div className="space-y-4">
            <p>
              Much cheaper. And, it works 24/7 without expecting breaks or
              vacations.
            </p>
          </div>
        ),
      },
    ],
  },
];

export const FaqSection = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <section className="section-container py-24 md:py-32  bg-background border relative overflow-hidden">
      <div className="section-container-padding relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 section-content-padding">
          {/* Left Column: Heading & CTA */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h2 className="text-3xl leading-tight text-foreground md:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about your intelligent, always
                working, lowest paid employee.
              </p>
            </div>
          </div>

          {/* Right Column: Tabs & Accordion */}
          <div className="lg:col-span-7">
            <Tabs
              defaultValue="general"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full flex flex-col items-start"
            >
              <TabsList className="flex flex-wrap justify-start h-auto gap-2 bg-transparent p-0 mb-4 border-none w-full">
                {faqData.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-full px-5 py-2 text-sm border border-border bg-background hover:bg-muted data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-foreground transition-all cursor-pointer"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {faqData.map((category) => (
                <TabsContent
                  key={category.id}
                  value={category.id}
                  className="w-full mt-0"
                >
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-0"
                  >
                    {category.items.map((item, i) => (
                      <AccordionItem
                        key={i}
                        value={`item-${category.id}-${i}`}
                        className="border-b border-border px-0 last:border-none"
                      >
                        <AccordionTrigger className="text-left text-lg font-medium text-foreground hover:no-underline py-6 transition-colors cursor-pointer">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};
