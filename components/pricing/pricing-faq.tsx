"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const pricingFaqData = [
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
  {
    question: "What happens if I exceed my message limit?",
    answer: (
      <div className="space-y-4">
        <p>
          We'll notify you before you hit your limit. You can upgrade to a
          higher tier at any time to continue seamless service.
        </p>
      </div>
    ),
  },
];

export const PricingFaq = () => {
  return (
    <section className="section-container border-x py-16 md:py-20 bg-muted/30">
      <div className="section-content-padding px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Pricing FAQs
            </h2>
            <p className="text-lg text-muted-foreground">
              Common questions about our pricing and plans
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full space-y-2"
          >
            {pricingFaqData.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border bg-background rounded-lg px-6 overflow-hidden data-[state=open]:shadow-sm transition-all"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-medium text-foreground hover:no-underline py-5 transition-colors cursor-pointer">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
