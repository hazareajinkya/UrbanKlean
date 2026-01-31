import Link from "next/link";
import {
  ClaudeLogo,
  GeminiLogo,
  GrokLogo,
  OpenAIIcon,
  PerplexityLogo,
} from "@/lib/logos";

const aiLogos = [
  { name: "ChatGPT", Icon: OpenAIIcon },
  { name: "Claude", Icon: ClaudeLogo },
  { name: "Gemini", Icon: GeminiLogo },
  { name: "Grok", Icon: GrokLogo },
  { name: "Perplexity", Icon: PerplexityLogo },
] as const;

export const AiSummaryFooter = () => {
  const prompt = `As a potential client, I want to concretely understand what I will receive with MagicalCX (magicalcx.com).

Detail step by step what the service includes: what I receive, what I analyze, what I see in my dashboard, the scores, biomarkers, deliverables, recommendations and frequency.

Explain it simply, as if you were describing the real experience of the service.  `;

  type AiName = (typeof aiLogos)[number]["name"];

  const handleAIShare = (aiName: AiName) => {
    const encodedPrompt = encodeURIComponent(prompt);
    const aiUrls: Record<AiName, string> = {
      ChatGPT: `https://chat.openai.com/?q=${encodedPrompt}`,
      Claude: `https://claude.ai/new?q=${encodedPrompt}`,
      Gemini: `https://gemini.google.com/app?prompt=${encodedPrompt}`,
      Perplexity: `https://www.perplexity.ai/?q=${encodedPrompt}`,
      Grok: `https://x.com/i/grok?text=${encodedPrompt}`,
    };
    return aiUrls[aiName];
  };

  return (
    <div className="section-content-padding py-10 sm:py-12 flex flex-col items-center gap-5 text-center border-b border-border">
      <div className="flex items-center justify-center gap-6 sm:gap-8 text-foreground">
        {aiLogos.map(({ name, Icon }) => (
          <Link
            key={name}
            aria-label={name}
            href={handleAIShare(name)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110"
          >
            <Icon className="size-8 sm:size-9" />
          </Link>
        ))}
      </div>
      <p className="text-lg sm:text-2xl text-foreground font-playfair tracking-wider italic">
        Request an AI summary of MagicalCX
      </p>
    </div>
  );
};
