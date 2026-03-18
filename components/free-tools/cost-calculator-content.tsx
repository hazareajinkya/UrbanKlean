"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  DollarSign,
  TrendingDown,
  Users,
  Headphones,
  BarChart3,
} from "lucide-react";

export const CostCalculatorContent = () => {
  return (
    <div className="w-full bg-background">
      <div className="section-container border-x px-6 py-16 md:py-24 max-w-4xl mx-auto space-y-20">
        {/* The Problem Section */}
        <section className="space-y-6">
          <Badge variant="outline" className="w-fit">
            The Hidden Cost Crisis
          </Badge>
          <h2 className="section-heading font-serif text-foreground tracking-tight">
            Why Customer Support Costs Keep Spiraling Out of Control
          </h2>
          <div className="prose prose-lg dark:prose-invert text-muted-foreground leading-relaxed space-y-4">
            <p>
              If you've ever tried to build a customer support team from
              scratch, you know the painful truth:{" "}
              <strong>the math rarely works.</strong>
            </p>
            <p>
              Start with a single support agent. In the US, you're looking at
              $4,000–$6,000 per month in base salary. But that's just the
              headline number. Add 30–40% for benefits, payroll taxes, and
              healthcare. Then tack on software subscriptions—your helpdesk
              ($50/seat/month), CRM ($100/seat/month), phone system
              ($30/seat/month), quality assurance tools, training platforms, and
              more. Before you know it, that "$4,500/month agent" is costing you{" "}
              <strong>closer to $7,000–$8,000 per month</strong> all-in.
            </p>
            <p>
              Now, multiply that by five agents. Or ten. Or fifty. Suddenly,
              your support operation is a multi-million dollar line item—and
              growth feels less like an opportunity and more like a financial
              liability.
            </p>
            <p>
              The real challenge? <strong>Support costs scale linearly.</strong>{" "}
              If your ticket volume doubles next quarter, you need to double
              your headcount. There's no economy of scale. No efficiency gains
              from growth itself. Every new customer adds predictable cost
              pressure to your bottom line.
            </p>
            <p>
              This linear scaling model forces difficult trade-offs. Do you
              extend wait times to save money (risking customer churn)? Do you
              offshore to lower-cost regions (risking quality and brand
              alignment)? Do you implement aggressive chatbots (risking customer
              frustration)?
            </p>
            <p>
              Many companies try all three—and still find themselves trapped.
              Wait times creep up. Quality scores fluctuate. And customers? They
              vote with their feet. According to research, 73% of consumers will
              switch to a competitor after multiple bad service experiences. The
              cost of support isn't just the direct expense—it's the hidden
              churn you create when you can't afford to provide great
              experiences at scale.
            </p>
          </div>
        </section>

        {/* The Solution / Subtle MagicalCX Positioning */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingDown className="w-6 h-6 text-primary" />
            </div>
            <h2 className="section-heading font-serif text-foreground tracking-tight">
              Breaking the Linear Cost Curve
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-medium flex items-center gap-2">
                <Calculator className="w-5 h-5 text-muted-foreground" />
                Know Your True Baseline
              </h3>
              <p className="text-muted-foreground">
                The first step to reducing support costs is understanding them
                accurately. Most companies underestimate their true cost per
                ticket by 40–60% because they only count salaries. Our
                calculator includes the hidden factors—overhead, management
                time, tooling, and turnover costs—so you know exactly where you
                stand.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-medium flex items-center gap-2">
                <Headphones className="w-5 h-5 text-muted-foreground" />
                Augment, Don't Replace
              </h3>
              <p className="text-muted-foreground">
                The smartest teams aren't firing support agents—they're giving
                them superpowers. When AI handles routine inquiries (password
                resets, shipping status, refund policies), human agents can
                focus on complex issues that actually need empathy and creative
                problem-solving. The result? Happier agents, happier customers,
                and dramatically lower cost per resolution.
              </p>
            </div>
          </div>

          <div className="bg-muted/30 border rounded-xl p-6 md:p-8">
            <h3 className="text-lg font-medium mb-2">
              The Hybrid Model Reality
            </h3>
            <p className="text-muted-foreground">
              Companies that implement AI-assisted support typically see{" "}
              <strong>40–70% cost reductions</strong> within the first year. Not
              by cutting quality—by routing simple tickets to instant
              automation, providing agents with draft responses, and reducing
              average handle time on complex issues. MagicalCX customers report
              that agents become 2–3x more productive because they're no longer
              answering the same questions 50 times a day.
            </p>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="space-y-8">
          <Badge variant="outline" className="w-fit">
            Common Questions
          </Badge>
          <div className="space-y-4">
            <h2 className="section-heading font-serif text-foreground tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about calculating and reducing your
              customer support costs.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-medium">
                How much does customer support cost per month?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                A fully-loaded support agent costs between{" "}
                <strong>$5,000–$8,000/month in the US</strong>,
                $3,500–$5,500/month in Europe, and $800–$1,500/month in India
                (when you include benefits, tools, and overhead). Your total
                monthly cost depends on team size, ticket volume, and average
                handling time. Use our calculator above to get a precise
                estimate for your specific situation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium">
                What is a good cost per support ticket?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Industry benchmarks vary widely by channel and complexity:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <strong>Phone support:</strong> $8–$15 per ticket
                  </li>
                  <li>
                    <strong>Email/ticket support:</strong> $5–$10 per ticket
                  </li>
                  <li>
                    <strong>Live chat:</strong> $3–$7 per ticket
                  </li>
                  <li>
                    <strong>AI-assisted support:</strong> $0.30–$2 per ticket
                  </li>
                </ul>
                If your cost per ticket is significantly higher than these
                benchmarks, there's likely room to optimize through automation
                or process improvements.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium">
                How can I reduce customer support costs without hurting quality?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                The most effective strategies include:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <strong>Implement AI triage:</strong> Route simple,
                    repetitive tickets to automated responses.
                  </li>
                  <li>
                    <strong>Build a self-service knowledge base:</strong>{" "}
                    Empower customers to find answers themselves.
                  </li>
                  <li>
                    <strong>Use AI-assisted drafting:</strong> Speed up agent
                    response times with suggested replies.
                  </li>
                  <li>
                    <strong>Analyze ticket patterns:</strong> Fix product issues
                    that generate repeat tickets.
                  </li>
                  <li>
                    <strong>Hire in cost-effective regions:</strong> But
                    maintain quality standards with strong training.
                  </li>
                </ul>
                The key is reducing volume and handling time—not cutting corners
                on the interactions that matter.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-medium">
                What hidden costs should I include in my support budget?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Many companies underestimate true support costs by overlooking:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <strong>Benefits and taxes:</strong> Add 25–40% to base
                    salaries
                  </li>
                  <li>
                    <strong>Software tools:</strong> Helpdesk, CRM, phone, QA,
                    analytics
                  </li>
                  <li>
                    <strong>Management overhead:</strong> Team leads, trainers,
                    QA specialists
                  </li>
                  <li>
                    <strong>Hiring and training:</strong> Each new hire costs
                    $3,000–$6,000 to onboard
                  </li>
                  <li>
                    <strong>Turnover:</strong> Industry average is 30–45%
                    annually—each replacement costs 3–6 months of productivity
                  </li>
                  <li>
                    <strong>Physical space:</strong> If you have an on-site team
                  </li>
                </ul>
                Our calculator applies a 1.3x multiplier to account for these
                factors, but your actual overhead may be higher depending on
                your setup.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-medium">
                How many support tickets can one agent handle per day?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                This depends on ticket complexity and channel:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                    <strong>Simple email tickets:</strong> 40–60 per day
                  </li>
                  <li>
                    <strong>Complex technical issues:</strong> 10–20 per day
                  </li>
                  <li>
                    <strong>Live chat:</strong> 4–6 concurrent chats, 50–80
                    total per day
                  </li>
                  <li>
                    <strong>Phone calls:</strong> 30–50 per day depending on
                    call length
                  </li>
                </ul>
                With AI assistance (suggested responses, automated info
                gathering), agents typically see a 50–100% increase in
                productivity on routine tickets.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-medium">
                Is AI customer support worth the investment?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                For most companies handling 500+ tickets per month, yes. AI
                support typically pays for itself within 2–3 months through:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>60–70% of routine tickets resolved automatically</li>
                  <li>
                    2–3x increase in agent productivity on remaining tickets
                  </li>
                  <li>Faster first response times (instant vs. hours)</li>
                  <li>Reduced agent burnout and turnover</li>
                  <li>24/7 coverage without night shift staffing</li>
                </ul>
                Modern AI platforms like MagicalCX can be live within hours, not
                months, making the barrier to try them extremely low.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Call to Value - Zero Aggressive Sales */}
        <section className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center space-y-6">
          <BarChart3 className="w-12 h-12 text-primary mx-auto" />
          <h3 className="text-2xl md:text-3xl font-serif pb-2">
            Your numbers. Your decision.
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Play with the calculator above to see exactly where your support
            budget goes today. When you're ready to explore what's possible,
            MagicalCX offers a free analysis of your ticket data—no commitment
            required, just insights you can use.
          </p>
        </section>
      </div>
    </div>
  );
};
