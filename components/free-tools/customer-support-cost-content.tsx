"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const CustomerSupportCostContent = () => {
  return (
    <div className="w-full bg-background">
      <div className="section-container border-x px-6 py-16 md:py-24 max-w-4xl mx-auto space-y-16">
        {/* Insight Section - What This Number Doesn't Show */}
        <section className="space-y-6">
          <Badge variant="outline" className="w-fit">
            The Hidden Impact
          </Badge>
          <h2 className="section-heading font-serif text-foreground tracking-tight">
            What this number doesn't show (but your business feels)
          </h2>

          <div className="prose prose-lg dark:prose-invert text-muted-foreground leading-relaxed space-y-5">
            <p>
              The calculator above gives you a dollar figure. That's the visible
              cost—the one that shows up on spreadsheets and gets reviewed in
              quarterly meetings.
            </p>
            <p>
              But underneath that number lies something harder to measure and
              far more damaging.
            </p>
            <p>
              <strong>Burnout.</strong> When your team answers the same question
              50 times a day, motivation erodes. Turnover climbs. The agents who
              could solve real problems leave for roles where they actually can.
            </p>
            <p>
              <strong>Slow replies.</strong> Every hour a customer waits, their
              frustration compounds. What started as a simple question becomes a
              complaint. A complaint becomes a negative review. And that review
              costs you customers you'll never even know about.
            </p>
            <p>
              <strong>Refunds due to delays.</strong> Customers who can't get
              answers often give up—and request their money back. Not because
              your product failed, but because your support experience did.
              These are preventable losses hiding in your queue.
            </p>
            <p>
              <strong>Lost repeat purchases.</strong> A single frustrating
              support experience can end a customer relationship permanently.
              The lifetime value you've built through marketing and product
              quality vanishes when support drops the ball.
            </p>
            <p>
              These costs never appear on the calculator. But they compound over
              time, silently draining revenue and wearing down your team. The
              question isn't just "how much do we spend on support?"—it's "how
              much are we losing because of how we do support?"
            </p>
          </div>
        </section>

        {/* Soft MagicalCX Bridge */}
        <section className="bg-muted/30 border rounded-2xl p-8 md:p-10 space-y-5">
          <p className="text-foreground leading-relaxed">
            Teams using AI-assisted support reduce repetitive tickets, respond
            faster, and lower overall support costs—without removing the human
            touch.
          </p>
          <p className="text-foreground leading-relaxed">
            That's the model MagicalCX is built around.
          </p>
          <div className="pt-2">
            <Link href="/product">
              <Button variant="outline" size="lg" className="group">
                See how AI-assisted support works
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="space-y-8">
          <Badge variant="outline" className="w-fit">
            Common Questions
          </Badge>
          <h2 className="section-heading font-serif text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-medium text-left">
                How do I calculate customer support costs?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Start with agent salaries, then add 30-40% for benefits, taxes,
                and overhead. Include software costs—your helpdesk, CRM, phone
                systems. Factor in management time, training programs, and
                turnover expenses. Divide your total monthly spend by ticket
                volume to get cost per ticket. The calculator above does this
                automatically based on your inputs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium text-left">
                What is a good cost per support ticket?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                It depends on the channel. Phone support runs $8-15 per ticket.
                Email sits around $5-10. Live chat is typically $3-7.
                AI-assisted support can bring costs down to $0.30-2 per ticket.
                If you're well above these ranges, there's likely room to
                improve through better processes or automation. The goal isn't
                the absolute lowest number—it's finding the balance where
                customers get great experiences without costs scaling linearly
                with every new inquiry.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium text-left">
                Why does support cost increase as volume grows?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Traditional support follows a linear model: double your tickets,
                double your agents. Each human has a fixed capacity—typically
                40-60 simple tickets per day. There are no natural economies of
                scale. As teams grow, you also add management layers, quality
                assurance, training programs, and coordination overhead. The
                complexity compounds. This is precisely why AI-assisted models
                are gaining traction—they break the linear relationship between
                volume and headcount.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-medium text-left">
                Can AI reduce customer support costs?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes, when implemented thoughtfully. AI can automate 40-70% of
                routine tickets—password resets, order status, return policies.
                It can suggest responses that reduce handle time by 30-50%. It
                provides 24/7 coverage without night shift staffing. And agents
                handling fewer repetitive questions report higher satisfaction
                and stay longer. The key is augmentation, not replacement. The
                best results come from AI handling routine work while humans
                focus on complex issues that require empathy and judgment.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};
