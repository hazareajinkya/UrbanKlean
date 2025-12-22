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
        question: "Is this just another chatbot?",
        answer: (
          <div className="space-y-4">
            <p>
              No. Chatbots follow scripts. MagicalCX understands meaning, tone,
              frustration, emotions, and context — and solves the problem like a
              real teammate.
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
              Order changes, size swaps, address updates, package tracking,
              subscription edits — all done inside the conversation.
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
              It sounds like your brand at its best — warm, clear, and helpful.
            </p>
          </div>
        ),
      },
      {
        question: "Do customers need to repeat their story on every channel?",
        answer: (
          <div className="space-y-4">
            <p>No.</p>
            <p>
              If they talked yesterday on Instagram and today on email, it
              remembers and continues smoothly.
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
            <p>No.</p>
            <p>
              It removes the repetitive stuff so your team can focus on the
              moments that need real care.
            </p>
          </div>
        ),
      },
      {
        question: "Is this right for my business?",
        answer: (
          <div className="space-y-4">
            <p>If you get daily customer messages, yes.</p>
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
            <p>No.</p>
            <p>We set everything up for you.</p>
            <p>You only paste one line of code.</p>
          </div>
        ),
      },
      {
        question: "Do I need a tech team?",
        answer: (
          <div className="space-y-4">
            <p>Not at all.</p>
            <p>If you can log in to Shopify, you can run MagicalCX.</p>
          </div>
        ),
      },
      {
        question: "How do I control what it can or can't say?",
        answer: (
          <div className="space-y-4">
            <p>
              You set clear rules — tone, limits, sensitive topics, escalation
              triggers.
            </p>
            <p>It stays within your boundaries.</p>
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
            <p>Your data stays yours — private, protected, and never shared.</p>
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
            <p>Change plans anytime.</p>
          </div>
        ),
      },
      {
        question: "Is there a free trial?",
        answer: (
          <div className="space-y-4">
            <p>Yes.</p>
            <p>No credit card. No pressure.</p>
            <p>Try it and see how it feels for your brand.</p>
          </div>
        ),
      },
      {
        question: "How does this help my revenue?",
        answer: (
          <div className="space-y-4">
            <p>
              By answering faster, solving quicker, and making it easier for
              customers to buy, upgrade, or reorder — without extra effort from
              you.
            </p>
          </div>
        ),
      },
      {
        question: "Does MagicalCX reduce support costs?",
        answer: (
          <div className="space-y-4">
            <p>Yes.</p>
            <p>Most teams see a 60–80% drop in repetitive questions.</p>
          </div>
        ),
      },
      {
        question: "Is this cheaper than hiring someone?",
        answer: (
          <div className="space-y-4">
            <p>Much cheaper — and it works 24/7 without dropping the ball.</p>
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
                Everything you need to know about your new best employee.
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
