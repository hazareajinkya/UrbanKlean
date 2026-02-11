import { coreConf } from "@/lib/utils/conf";

const getBaseUrl = () => coreConf.baseUrl || "https://magicalcx.com";

const getLlmsIndexContent = () => {
  const baseUrl = getBaseUrl();
  return `# MagicalCX
> MagicalCX is an empathy-first AI customer service platform that enables businesses to deliver instant, empathetic, and scalable customer support across channels.

Core Benefits
- Remember every customer context across conversations and channels, so users never repeat themselves
- Resolve up to 86% of tickets while lowering support costs by 40-70% and increasing upsells by 15-30%
- Improve customer satisfaction with faster responses, less repetition, and seamless human handoff
- Launch quickly with low setup friction and start seeing operational impact in days

Key Features
- HumanlyClear™ Conversations: Warm, context-aware, action-oriented support quality
- EFRO™ Engine: Empathy-first revenue orchestration with non-pushy offer timing
- Conversational Memory: Remembers past chats, orders, and customer context across channels
- Collaboration: Human handoff with full context and team workflows
- Workflow Automation: Trigger-driven flows with API actions and guardrails
- Knowledge Suite: Website scraping, PDFs, teach mode, semantic retrieval
- CRM + Identity Resolution: Unified cross-channel customer profiles and memory
- Analytics + Weekly Reports: Sentiment, resolution, demand signals, and opportunities
- Dedicated Success Manager: White-glove onboarding and ongoing optimization support

Tailored Solutions
- Enterprises needing scalable CX automation with governance, guardrails, and high service quality
- Startups and growth teams needing fast deployment, omnichannel support, and efficient scaling

Use Cases
- SaaS onboarding, activation, retention, and support-led expansion
- E-commerce support for tracking, returns, product questions, and payment issues
- Service business workflows for scheduling, qualification, and follow-up automation

## Get Started
- [Homepage](${baseUrl}): Product overview and value proposition.
- [Onboarding](${baseUrl}/onboarding): Start setup by entering your website URL.
- [Pricing](${baseUrl}/pricing): Plans, trial, and credits.

## Product & Use Cases
- [About](${baseUrl}/about): Platform philosophy and differentiators.
- [Blog](${baseUrl}/blog): Guides on empathy-first support and AI CX.
- [Free Tools](${baseUrl}/free-tools): ROI and support optimization tools.

## Free Tools
- [AI vs Human Support ROI Calculator](${baseUrl}/free-tools/ai-vs-human-support-roi-calculator)
- [Customer Support Cost Calculator](${baseUrl}/free-tools/customer-support-cost-calculator)
- [Customer Support Tone Checker](${baseUrl}/free-tools/customer-support-tone-checker)
- [Customer Support Response Grader](${baseUrl}/free-tools/customer-support-response-grader)
- [Policy Generator](${baseUrl}/free-tools/customer-support-and-refund-policy-generator)
- [Refund Risk Predictor](${baseUrl}/free-tools/refund-risk-predictor)

## Trust & Legal
- [Privacy Policy](${baseUrl}/legal/privacy)
- [Terms](${baseUrl}/legal/terms)
- [Refund Policy](${baseUrl}/legal/refund)

## Full Context
- [MagicalCX Full Context](${baseUrl}/llms-full.txt): Extended product, workflows, FAQs, and implementation context for AI systems.
`;
};

export async function GET() {
  const baseUrl = getBaseUrl();
  return new Response(getLlmsIndexContent(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      Link: `</llms.txt>; rel="llms-txt", </llms-full.txt>; rel="llms-full-txt"`,
      "X-Llms-Txt": "/llms.txt",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Content-Location": `${baseUrl}/llms.txt`,
    },
  });
}
