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

export const ResponseQualityContent = () => {
  return (
    <div className="w-full bg-background">
      <div className="section-container border-x px-6 py-16 md:py-24 max-w-4xl mx-auto space-y-16">
        {/* Insight Section */}
        <section className="space-y-6">
          <Badge variant="outline" className="w-fit">
            The Hidden Impact
          </Badge>
          <h2 className="section-heading font-serif text-foreground tracking-tight">
            Good responses reduce refunds. Great ones build loyalty.
          </h2>

          <div className="prose prose-lg dark:prose-invert text-muted-foreground leading-relaxed space-y-5">
            <p>
              Every support response is a moment of truth. In those few
              sentences, you're shaping how a customer perceives your brand—and
              whether they'll come back.
            </p>
            <p>
              <strong>Tone matters more than scripts.</strong> Customers can
              spot a canned response immediately. What they remember isn't
              whether you followed the playbook—it's whether you actually seemed
              to care. A response that acknowledges frustration, uses natural
              language, and treats the customer as a person—not a ticket
              number—creates connection that scripts can't replicate.
            </p>
            <p>
              <strong>Clarity beats speed.</strong> A fast reply that confuses
              the customer just creates more work. One clear, complete answer is
              worth more than three hasty ones. When customers understand
              exactly what to do next, they don't write back asking for
              clarification—they move forward and remember you got it right.
            </p>
            <p>
              <strong>Empathy outweighs automation.</strong> Automated responses
              have their place for simple queries. But when a customer is
              frustrated, confused, or upset, they need to feel heard before
              they can hear solutions. Empathetic language is the difference
              between diffusing tension and escalating it.
            </p>
            <p>
              The best support teams don't just resolve issues—they leave
              customers feeling better about your brand than before the problem
              occurred. That's the difference between a support cost and a
              retention investment.
            </p>
            <p>
              Resolution strength isn't just about solving the immediate
              problem. It's about anticipating the next question, providing
              complete information, and closing the loop so the customer doesn't
              have to come back. Strong resolutions reduce ticket volume,
              increase satisfaction, and free your team to focus on genuinely
              complex issues.
            </p>
            <p>
              Brand safety is often overlooked. Every response is a brand
              touchpoint. Language that's too casual, too formal, or simply off
              from your company voice creates cognitive dissonance. Customers
              notice when something feels "off"—even if they can't articulate
              what. Consistent tone builds trust; inconsistency erodes it.
            </p>
          </div>
        </section>

        {/* Soft MagicalCX Bridge */}
        <section className="bg-muted/30 border rounded-2xl p-8 md:p-10 space-y-5">
          <p className="text-foreground leading-relaxed">
            MagicalCX trains AI responses to match your brand's tone—without
            sounding robotic.
          </p>
          <p className="text-foreground leading-relaxed">
            Real-time quality scoring helps every agent deliver responses that
            meet your standards, consistently.
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
                What makes a good customer support response?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                A good customer support response combines several key elements:
                <strong> clarity</strong> (easy to understand, no jargon),
                <strong> empathy</strong> (acknowledges the customer's situation
                and feelings),
                <strong> resolution strength</strong> (fully addresses the issue
                with clear next steps), and
                <strong> brand consistency</strong> (matches your company's
                voice and values). The best responses make customers feel heard,
                understood, and confident about the path forward—all while
                reinforcing a positive perception of your brand.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium text-left">
                How do you measure empathy in support?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Empathy in support responses can be measured through several
                indicators:
                <strong> acknowledgment phrases</strong> that recognize the
                customer's frustration or situation,
                <strong> personalized language</strong> that goes beyond
                template responses,
                <strong> warm, human tone</strong> that doesn't feel robotic,
                and
                <strong> customer-centric framing</strong> that puts their needs
                first. Empathetic responses typically include phrases like "I
                understand how frustrating this must be" or "I appreciate you
                bringing this to our attention"—said genuinely, not as scripted
                placeholders.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium text-left">
                Can AI write good support replies?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                AI can write excellent support replies when properly trained on
                your brand voice and quality standards. The key is using AI as
                an augmentation tool rather than a full replacement. AI excels
                at:
                <strong> handling routine queries</strong> with consistent
                quality,
                <strong> suggesting responses</strong> that agents can
                personalize,
                <strong> ensuring brand consistency</strong> across all
                interactions, and
                <strong> catching quality issues</strong> before messages are
                sent. The best results come from AI and humans working together—
                AI handles the repetitive work while humans focus on complex
                issues requiring judgment and genuine emotional intelligence.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-medium text-left">
                Why does response quality affect refund rates?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Response quality directly impacts refund rates because customers
                often request refunds not because of product issues, but because
                of frustrating support experiences.
                <strong> Slow responses</strong> let frustration compound until
                customers give up.
                <strong> Unclear answers</strong> leave customers confused and
                unsatisfied.
                <strong> Lack of empathy</strong> makes customers feel
                undervalued. When support quality improves, customers are more
                likely to work through issues rather than request refunds—and
                they're more likely to purchase again in the future.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};
