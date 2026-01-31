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

export const ToneEmpathyContent = () => {
  return (
    <div className="w-full bg-background">
      <div className="section-container border-x px-6 py-16 md:py-24 max-w-4xl mx-auto space-y-16">
        {/* Insight Section */}
        <section className="space-y-6">
          <Badge variant="outline" className="w-fit">
            Why Tone Matters
          </Badge>
          <h2 className="section-heading font-serif text-foreground tracking-tight">
            Tone is strategy, not decoration
          </h2>

          <div className="prose prose-lg dark:prose-invert text-muted-foreground leading-relaxed space-y-5">
            <p>
              Most support teams focus on speed and accuracy. Those matter. But
              tone is the invisible factor that determines whether a resolved
              issue translates into a retained customer—or a silent churn.
            </p>

            <p>
              <strong>Different moments need different tones.</strong> An
              apology for a shipping delay requires warmth and acknowledgment. A
              billing dispute needs calm clarity. Explaining a policy requires
              firmness without coldness. The tone that works perfectly in one
              context falls flat in another.
            </p>

            <p>
              This is where most teams struggle. They train agents on what to
              say, but not how it should feel to the customer reading it. The
              result: technically correct messages that leave customers feeling
              dismissed, unheard, or frustrated.
            </p>

            <p>
              <strong>Consistency builds trust.</strong> When customers interact
              with your brand, they should feel a consistent presence—whether
              they&apos;re chatting with Alex at 9 AM or Jordan at midnight.
              Inconsistent tone creates cognitive dissonance. Customers start to
              wonder: Is this really the same company? Can I trust what they say
              next time?
            </p>

            <p>
              The data backs this up. Brands with consistent voice across
              support channels see <strong>23% higher customer loyalty</strong>{" "}
              and <strong>33% lower escalation rates</strong>. Tone isn&apos;t a
              nice-to-have—it&apos;s a competitive advantage.
            </p>

            <p>
              <strong>AI must respect tone boundaries.</strong> As AI handles
              more support interactions, tone consistency becomes even more
              critical. An AI that sounds robotic, overly formal, or
              inconsistent with your brand undermines trust faster than a human
              agent having a bad day.
            </p>

            <p>
              The teams winning at customer experience treat tone as seriously
              as they treat response time. They define it, measure it, and
              actively improve it across every touchpoint.
            </p>
          </div>
        </section>

        {/* Soft MagicalCX Bridge */}
        <section className="bg-muted/30 border rounded-2xl p-8 md:p-10 space-y-5">
          <p className="text-foreground leading-relaxed">
            MagicalCX lets you define tone rules once—and applies them
            consistently across conversations.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Your brand voice, encoded. Your team, aligned. Every message,
            on-brand.
          </p>
          <div className="pt-2">
            <Link href="/product">
              <Button variant="outline" size="lg" className="group">
                See how it works
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
                Why does tone matter in customer support?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Tone directly impacts how customers perceive your brand and
                whether they stay loyal.{" "}
                <strong>68% of customers leave companies</strong> because they
                feel uncared for—not because of product issues. A technically
                correct response delivered in the wrong tone can escalate a
                simple issue into a complaint. Conversely, a warm, empathetic
                tone can turn frustrated customers into advocates. Tone is the
                emotional wrapper around your message that determines whether
                customers feel heard, valued, and willing to continue the
                relationship.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium text-left">
                What tone reduces angry customers?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                <strong>Calm acknowledgment</strong> is the most effective tone
                for de-escalating angry customers. Start by validating their
                frustration (&quot;I completely understand why this is
                frustrating&quot;), then move to calm reassurance (&quot;Let me
                look into this right away&quot;). Avoid three tone
                mistakes:&nbsp;
                <strong>defensive tone</strong> (&quot;That&apos;s not our
                fault&quot;),&nbsp;
                <strong>dismissive tone</strong> (&quot;Per our policy...&quot;
                without empathy), or&nbsp;
                <strong>overly cheerful tone</strong> that feels tone-deaf to
                their distress. The goal is matching their emotional intensity
                with understanding, then gradually guiding them toward
                resolution.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium text-left">
                Can AI adapt tone dynamically?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes, but only when properly configured. Modern AI support tools
                can analyze customer sentiment in real-time and adjust tone
                accordingly—<strong>softening when customers are upset</strong>,
                becoming more direct when efficiency is valued. However, this
                requires defining your brand&apos;s tone spectrum clearly.
                Without guardrails, AI may default to generic corporate-speak or
                overcorrect in unhelpful ways. The best approach: set tone
                boundaries that reflect your brand values, then let AI adapt
                within those parameters based on conversation context.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};
