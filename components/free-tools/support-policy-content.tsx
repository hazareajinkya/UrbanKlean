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

export const SupportPolicyContent = () => {
  return (
    <div className="w-full bg-background">
      <div className="section-container border-x px-6 py-16 md:py-24 max-w-4xl mx-auto space-y-16">
        {/* Insight Section */}
        <section className="space-y-6">
          <Badge variant="outline" className="w-fit">
            The Foundation of Trust
          </Badge>
          <h2 className="section-heading font-serif text-foreground tracking-tight">
            Policies don't replace empathy—but they support it
          </h2>

          <div className="prose prose-lg dark:prose-invert text-muted-foreground leading-relaxed space-y-5">
            <p>
              A common misconception is that having strict policies means being
              cold or inflexible. The reality is exactly the opposite.
            </p>
            <p>
              <strong>Clear boundaries reduce arguments.</strong> When customers
              understand your policies upfront, they don't feel blindsided when
              rules are enforced. When agents have documented guidelines, they
              don't second-guess every decision. The result? Less friction,
              fewer escalations, and more energy for what matters most—helping
              customers succeed.
            </p>
            <p>
              <strong>Consistency builds trust.</strong> When every customer
              gets the same treatment, fairness becomes visible. This
              consistency is what separates good support from great support.
              Customers remember how they were treated—and whether it matched
              what others received.
            </p>
            <p>
              <strong>Policies empower agents.</strong> Good policies give
              agents confidence to make decisions without constant escalation.
              They know the rules, so they can focus on delivery. They know
              where flexibility exists, so they can say "yes" more often.
            </p>
            <p>
              Your refund policy shouldn't be about preventing returns; it
              should be about making the process painless when returns are
              warranted. Your escalation rules shouldn't slow things down; they
              should ensure the right expert handles the right problem. Your
              support hours shouldn't limit access; they should set realistic
              expectations that you can consistently meet.
            </p>
            <p>
              The companies that win on customer experience don't hide behind
              policies—they lean on them. A customer who knows they can get a
              refund within 30 days feels confident buying. An agent who knows
              exactly when to escalate feels confident handling complex issues.
              Everyone benefits when the rules are clear.
            </p>
          </div>
        </section>

        {/* Soft MagicalCX Bridge */}
        <section className="bg-muted/30 border rounded-2xl p-8 md:p-10 space-y-5">
          <p className="text-foreground leading-relaxed">
            MagicalCX ensures your support policies are followed and
            communicated with empathy—every time, at scale. Our AI is trained to
            understand your specific guidelines and deliver consistent, caring
            responses.
          </p>
          <p className="text-foreground leading-relaxed">
            That's how modern teams turn policies into practice.
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
                What should a customer support policy include?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                A comprehensive customer support policy should cover five key
                areas: support hours and availability, contact channels (email,
                phone, chat), response time commitments, refund and return
                procedures, and escalation paths. The best policies are written
                in plain language that customers can easily understand, not
                legal jargon that requires interpretation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium text-left">
                How strict should refund policies be?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Data consistently shows that lenient policies increase overall
                revenue. A 30-day, no-questions-asked refund policy typically
                increases conversions more than it increases return rates. The
                key is finding the sweet spot: strict enough to prevent abuse,
                flexible enough to build trust. Most successful companies use a
                tiered approach—generous for standard cases, with clear
                exceptions for edge cases.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium text-left">
                Can AI follow support policies?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes, modern AI support tools can be trained to follow your
                policies precisely. The key is documenting your policies
                clearly—if a human can understand and follow your guidelines, AI
                can too. AI excels at consistent policy enforcement, never
                forgetting the rules or making exceptions it shouldn't. However,
                AI should always have clear escalation paths to humans for edge
                cases that require judgment.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-medium text-left">
                How do I handle policy exceptions without creating
                inconsistency?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Document your exception criteria as part of your policy. Instead
                of saying "no refunds after 30 days," specify "refunds within 30
                days; exceptions may be granted for documented shipping delays
                or product defects." This gives agents clear guidelines for when
                flexibility is appropriate without opening the door to arbitrary
                decisions. Track exceptions and review them quarterly.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};
