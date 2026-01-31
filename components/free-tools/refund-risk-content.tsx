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

export const RefundRiskContent = () => {
  return (
    <div className="w-full bg-background">
      <div className="section-container border-x px-6 py-16 md:py-24 max-w-4xl mx-auto space-y-16">
        {/* Insight Section */}
        <section className="space-y-6">
          <Badge variant="outline" className="w-fit">
            The Hidden Cost of Refunds
          </Badge>
          <h2 className="section-heading font-serif text-foreground tracking-tight">
            Why refunds drain more than you think
          </h2>

          <div className="prose prose-lg dark:prose-invert text-muted-foreground leading-relaxed space-y-5">
            <p>
              The refund cost on your books is just the beginning. For every
              refund processed, you&apos;re also losing the{" "}
              <strong>
                shipping, handling, payment processing fees, and the customer
                acquisition cost
              </strong>{" "}
              that brought them to you in the first place.
            </p>
            <p>
              But here&apos;s what most teams miss: refunds rarely happen
              because of product quality alone. They emerge from a chain of
              small failures—slow response times, unclear expectations, and
              rigid policies that frustrate rather than resolve.
            </p>
            <p>
              <strong>40-60% of refund requests</strong> could be prevented
              entirely with faster, more proactive support. The customer who
              waits three days for a sizing question often gives up and just
              asks for their money back.
            </p>
            <p>
              Teams with response times under one hour experience refund rates{" "}
              <strong>35% lower</strong> than those with 24-hour windows. And
              counterintuitively, companies with flexible refund policies see{" "}
              <strong>fewer total refunds</strong>—because customers feel heard
              and are more willing to accept alternatives like exchanges or
              store credit.
            </p>
            <p>
              The irony is that strict policies meant to reduce losses often
              backfire. They increase chargebacks, generate negative reviews,
              and create adversarial support experiences that cost more than the
              refunds they&apos;re trying to prevent.
            </p>
            <p>
              Understanding your specific refund risk profile reveals the
              precise levers that reduce unnecessary losses—without damaging
              customer relationships.
            </p>
          </div>
        </section>

        {/* Soft MagicalCX Bridge */}
        <section className="bg-muted/30 border rounded-2xl p-8 md:p-10 space-y-5">
          <p className="text-foreground leading-relaxed">
            Teams using AI-assisted support catch frustration signals early,
            respond faster, and convert potential refunds into retained
            customers.
          </p>
          <p className="text-foreground leading-relaxed">
            That&apos;s the approach MagicalCX enables.
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
                What factors contribute most to refund rates?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                The primary drivers include <strong>slow response times</strong>{" "}
                (the longer customers wait, the more likely they request
                refunds), <strong>unclear product expectations</strong>{" "}
                (insufficient descriptions or misleading images), and{" "}
                <strong>inflexible policies</strong> that leave customers
                feeling trapped. Industry type also matters—fashion and
                electronics typically see higher rates due to fit and
                compatibility concerns.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium text-left">
                How does response time affect refund requests?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Response time is one of the strongest predictors of refund
                behavior. Customers who receive responses within{" "}
                <strong>one hour</strong> are 60% more likely to accept an
                alternative solution compared to those who wait 24 hours or
                more. Delayed responses signal that customer concerns
                aren&apos;t a priority, making refunds feel like the only path
                to resolution.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium text-left">
                Should I make my refund policy stricter to reduce losses?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Counterintuitively, <strong>no</strong>. Strict refund policies
                often backfire—increasing chargebacks (which cost more than
                refunds), generating negative reviews that deter future
                customers, and creating adversarial support interactions.
                Companies with generous, clearly communicated policies often see
                fewer refund requests because customers feel secure purchasing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-medium text-left">
                What is a healthy refund rate for my industry?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Benchmarks vary significantly: <strong>Fashion/Apparel</strong>{" "}
                runs 15-30% (fit issues), <strong>Electronics</strong> sits at
                8-15% (compatibility), <strong>SaaS</strong> is 3-8%
                (subscription cancellations), <strong>Home Goods</strong> lands
                at 5-12% (quality mismatches), and{" "}
                <strong>Digital Products</strong> is lowest at 2-5% (instant
                delivery). If you&apos;re above these ranges, there&apos;s room
                for support-side improvements.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};
