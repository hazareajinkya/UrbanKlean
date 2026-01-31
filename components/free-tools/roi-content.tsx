"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Zap, Bot, TrendingDown, Clock } from "lucide-react";
import Link from "next/link";

export const RoiContent = () => {
  return (
    <div className="w-full bg-background">
      <div className="section-container border-x px-6 py-16 md:py-24 space-y-16">
        {/* Understanding Your ROI Results */}
        <div className="space-y-16">
          <section className="space-y-6 ">
            <Badge variant="outline" className="w-fit">
              Understanding Your Results
            </Badge>
            <h2 className="section-heading font-serif text-foreground tracking-tight">
              What these numbers mean for your team
            </h2>

            <div className="prose prose-lg dark:prose-invert text-muted-foreground leading-relaxed space-y-5 w-full">
              <p>
                The calculator above estimates three key outcomes: monthly cost
                savings from automation, faster response times, and reduced
                refund requests. Each of these metrics tells a different part of
                the story.
              </p>

              <div className="grid gap-6 not-prose">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      Monthly savings
                    </h3>
                    <p className="text-muted-foreground">
                      This reflects the cost difference between handling tickets
                      manually versus automating a portion with AI. The savings
                      compound as ticket volume grows—where human-only support
                      requires proportional headcount increases, AI handles
                      additional volume at minimal incremental cost.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      Faster response delta
                    </h3>
                    <p className="text-muted-foreground">
                      Response time directly impacts customer satisfaction and
                      retention. AI provides instant responses for automated
                      tickets, while freeing human agents to respond faster to
                      complex issues. The combined effect significantly reduces
                      average wait times across your entire queue.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      Estimated refund reduction
                    </h3>
                    <p className="text-muted-foreground">
                      Many refund requests stem from support frustration rather
                      than product issues. When customers wait hours or days for
                      simple answers, they often give up and request their money
                      back. Faster, more accurate responses prevent these
                      avoidable losses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Insight Section - Why AI Alone Isn't the Answer */}
          <section className="space-y-6">
            <Badge variant="outline" className="w-fit">
              The Hybrid Approach
            </Badge>
            <h2 className="section-heading font-serif text-foreground tracking-tight">
              Why AI alone isn't the answer
            </h2>

            <div className="prose prose-lg dark:prose-invert text-muted-foreground leading-relaxed space-y-5">
              <p>
                The ROI numbers paint an attractive picture, but they come with
                an important caveat: not all AI implementations succeed. The
                difference between a transformative support operation and a
                frustrating bot experience comes down to how you balance
                automation with human expertise.
              </p>

              <div className="grid md:grid-cols-1 gap-6 not-prose">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Bot className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      Pure bots frustrate users
                    </h3>
                    <p className="text-muted-foreground">
                      Customers can tell when they're stuck in a loop with a bot
                      that doesn't understand their problem. Menu trees that
                      lead nowhere, responses that miss the point, and the
                      inability to reach a human when needed—these experiences
                      create frustration, increase escalations, and damage trust
                      in your brand. The cost savings from full automation often
                      get wiped out by increased churn and negative reviews.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      Humans scale poorly alone
                    </h3>
                    <p className="text-muted-foreground">
                      Every new support agent means more hiring, training, and
                      management overhead. Finding qualified candidates takes
                      weeks. Training takes months. And just as agents become
                      productive, many leave—support roles have notoriously high
                      turnover. Costs climb linearly while response times often
                      remain inconsistent, especially during peak periods when
                      you need consistency most.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Zap className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-1">
                      Hybrid works best
                    </h3>
                    <p className="text-muted-foreground">
                      The highest-performing support teams use AI for speed and
                      scale, while reserving humans for nuance and empathy. AI
                      handles the repetitive inquiries—order status, tracking,
                      return policies—instantly and accurately. Human agents
                      focus on complex issues, complaints, and situations
                      requiring judgment. This combination delivers faster
                      average response times, lower costs, and higher customer
                      satisfaction than either approach alone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Soft CTA - MagicalCX Bridge */}
        <section className="bg-muted/30 border rounded-2xl p-8 md:p-10 space-y-5">
          <p className="text-foreground leading-relaxed text-lg">
            MagicalCX is designed for hybrid, empathy-first support—where AI
            handles volume and humans handle nuance.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Automate routine inquiries instantly while giving your agents
            AI-powered response suggestions for complex tickets. Every customer
            gets the right experience—fast when speed matters, personal when
            empathy matters.
          </p>
          <div className="pt-2">
            <Link href="/product">
              <Button variant="outline" size="lg" className="group">
                See how hybrid support works
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="space-y-8">
          <h2 className="section-heading font-serif text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-medium text-left">
                Is AI customer support cheaper than humans?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes, significantly. AI can handle routine inquiries at a
                fraction of the cost—often under $0.50 per ticket compared to
                $5-15 for human-handled tickets. But the real savings come from
                combining AI and humans strategically. AI resolves 60-70% of
                simple questions instantly, while your team focuses on complex
                issues that require judgment and empathy. This hybrid approach
                typically reduces overall support costs by 40-60% while
                maintaining or improving customer satisfaction scores.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium text-left">
                What tickets should AI handle?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                AI excels at repetitive, well-defined queries: order status,
                tracking information, return policies, password resets, FAQs,
                and product specifications. These make up 50-70% of most support
                queues. AI can also draft responses for agents to review on more
                complex tickets, speeding up resolution times even when full
                automation isn't appropriate. Human agents should handle
                complaints, sensitive situations, technical troubleshooting, VIP
                customers, and anything requiring empathy or creative
                problem-solving.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium text-left">
                Does AI reduce refunds?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes, often substantially. Many refund requests stem from
                frustration with slow responses or lack of information—not the
                product itself. When customers wait hours for answers about
                shipping delays or return windows, some simply give up and
                request their money back. When AI provides instant, accurate
                answers, customers often decide to keep their purchase. Studies
                show that faster first response times correlate directly with
                lower refund rates, with some companies reporting 20-35% fewer
                refund requests after implementing AI-assisted support.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-medium text-left">
                How accurate are ROI calculators?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                ROI calculators provide directional estimates based on industry
                averages and your inputs. Actual results depend on your specific
                ticket mix, current efficiency, implementation quality, and how
                well your AI is trained on your knowledge base. This calculator
                uses conservative assumptions: 60% AI automation rate, 30%
                refund reduction potential, and 1.3x overhead on agent salaries.
                Your actual ROI may be higher or lower. The best way to get
                precise numbers is to run a pilot with real data from your
                support queue.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </div>
  );
};
