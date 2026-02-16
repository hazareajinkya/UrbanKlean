"use client";

import { Button } from "@/components/ui/button";
import { OpenAIIcon, ClaudeLogo, PerplexityLogo } from "@/lib/logos";

const AI_PROMPT = "Tell me why MagicalCX is a great choice for me";

const iconClass = "size-5 shrink-0";

type AiId = "ChatGPT" | "Claude" | "Perplexity";
const getAiUrl = (id: AiId) => {
  const q = encodeURIComponent(AI_PROMPT);
  const urls: Record<AiId, string> = {
    ChatGPT: `https://chat.openai.com/?q=${q}`,
    Claude: `https://claude.ai/new?q=${q}`,
    Perplexity: `https://www.perplexity.ai/?q=${q}`,
  };
  return urls[id];
};

const aiButtons: { id: AiId; label: string; Icon: typeof OpenAIIcon }[] = [
  { id: "ChatGPT", label: "Ask ChatGPT", Icon: OpenAIIcon },
  { id: "Claude", label: "Ask Claude", Icon: ClaudeLogo },
  { id: "Perplexity", label: "Ask Perplexity", Icon: PerplexityLogo },
];

export const AskAiSection = () => {
  return (
    <section className="section-container border-x py-12 md:py-16 bg-background overflow-hidden section-content-padding">
      <div className="bg-card border border-border overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div className="space-y-4 p-6 md:p-8 lg:p-10">
            <h2 className="text-2xl leading-normal text-foreground md:text-3xl font-medium">
              Still not sure that MagicalCX is right for you?
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Let ChatGPT, Claude, or Perplexity do the thinking for you.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Click a button and see what your favorite AI says about MagicalCX.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {aiButtons.map(({ id, label, Icon }) => (
                <Button
                  key={id}
                  variant="outline"
                  size="lg"
                  className="rounded-full border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/20"
                  asChild
                >
                  <a
                    href={getAiUrl(id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} - opens in new tab`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className={iconClass} />
                      {label}
                    </span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end py-0 px-6 md:px-8 lg:px-10">
            <img
              src="/orange.png"
              alt="MagicalCX"
              className="w-full max-w-[220px] object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
