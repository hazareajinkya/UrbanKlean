"use client";

import { useRef, useState, useEffect } from "react";
import {
  Cable,
  HeartHandshake,
  BrainCircuit,
  Cpu,
  BarChart3,
  Brain,
  Book,
  BookOpen,
  Dock,
  FileText,
  PersonStanding,
  Clover,
  Component,
  MessageCircle,
  MessageCircleMore,
  FolderOpen,
  FolderOpenDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFIcon } from "@/lib/logos";

const reasons = [
  {
    feature: {
      title: "Effortless Connection",
      subtitle: "We integrate without pain.",
      description:
        "Forget months-long IT projects. We designed onboarding to feel less like a migration and more like flipping a switch.",
      icon: Cable,
    },
    outcome: {
      text: "Customers feel connected to one united brand.",
    },
  },
  {
    feature: {
      title: "Done-for-you Service",
      subtitle: "True white‑glove service.",
      description:
        "We’ll set everything up for you – from channels to guardrails. We join calls, share screens, and guide you click‑by‑click so you never have to guess.",
      icon: HeartHandshake,
    },
    outcome: {
      text: "Zero hassle integration—we do the heavy lifting so you don't have to.",
    },
  },
  {
    feature: {
      title: "Memory that feels human",
      subtitle: "Other bots forget. MagicalCX listens and remembers.",
      description:
        "It recalls past chats, issues, and promises to avoid asking the same basic questions again.",
      icon: FolderOpen,
    },
    outcome: {
      text: "This brand treats me like a relationship, not a ticket.",
    },
  },
  {
    feature: {
      title: "EFRO + HumanlyClear™",

      subtitle: "Beyond generic “ChatGPT‑style” AI.",
      description:
        "Trained for emotional clarity and business precision, balancing customer empathy with your revenue goals.",
      icon: MessageCircleMore,
    },
    outcome: {
      text: "Conversations that build loyalty and lifetime value, not just resolutions.",
    },
  },
  {
    feature: {
      title: "Dashboards & Insights",
      subtitle: "Tell you exactly “how it’s going”",
      description:
        "Live dashboards and weekly reports give you a crystal‑clear answer to “How are our conversations going?” with concrete suggestions.",
      icon: FileText,
    },
    outcome: {
      text: "You stop guessing and start steering with clear, actionable data.",
    },
  },
];

export const WhyChooseUs = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isPausedRef = useRef(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      // Calculate which card is currently visible (accounting for padding)
      const cardWidth = clientWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(newIndex, reasons.length - 1));
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  const pauseAutoScroll = () => {
    isPausedRef.current = true;
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, 8000);
  };

  const handleManualScroll = () => {
    checkScroll();
    pauseAutoScroll();
  };

  const handleManualNavigation = (direction: "left" | "right") => {
    scroll(direction);
    pauseAutoScroll();
  };

  const handleIndicatorClick = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth",
      });
      pauseAutoScroll();
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);

    // Auto-scroll setup
    autoScrollIntervalRef.current = setInterval(() => {
      if (!isPausedRef.current && scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const cardWidth = clientWidth;
        const currentIdx = Math.round(scrollLeft / cardWidth);
        const nextIndex = currentIdx + 1;

        if (nextIndex >= reasons.length) {
          scrollRef.current.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        } else {
          scroll("right");
        }
      }
    }, 3000);

    return () => {
      window.removeEventListener("resize", checkScroll);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="section-container border py-24 md:py-32 bg-background overflow-hidden dark">
      <div className="max-w-5xl mx-auto text-center mb-16 section-container-padding">
        <h2 className="section-heading ">
          {/* Why fast-growing brands{" "}
          <span className="text-muted-foreground">switch to MagicalCX</span> */}
          {/* Why Teams Love Working With MagicalCX */}
          {/* Why Growing Brands Pick MagicalCX */}
          <span className="text-muted-foreground">
            Why MagicalCX is the
          </span>{" "}
          <span className="text-muted-oreground">smarter choice</span>
          {/* Why MagicalCX Is Different */}
        </h2>
        <p className="section-subheadline">
          {/* We built the only AI engine that combines the memory of a CRM, the
          hands of an agent, and the brain of a salesperson. */}
          We built the only AI engine that remembers like a CRM, acts like an
          agent, and thinks like a salesperson.
        </p>
      </div>

      {/* Carousel Container */}
      <div
        className="relative section-content-padding"
        onMouseEnter={pauseAutoScroll}
        onMouseLeave={() => {
          if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
          }
          isPausedRef.current = false;
        }}
      >
        {/* Scroll Area */}
        <div
          ref={scrollRef}
          onScroll={handleManualScroll}
          className="flex gap-0 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reasons.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full snap-center px-2 md:px-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full min-h-[420px]">
                {/* Left Card: Feature */}
                <div className="bg-card rounded-3xl border border-border p-6 md:p-8 lg:p-16 flex flex-col justify-center h-full order-1 md:order-1">
                  <div className="mb-6">
                    <item.feature.icon className="size-9 md:size-11 text-foreground stroke-[1.5]" />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-medium mb-5 text-foreground tracking-tight">
                    {item.feature.title}
                  </h3>
                  <p className="text-base text-foreground font-normal mb-6">
                    {item.feature.subtitle}
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {item.feature.description}
                  </p>
                </div>

                {/* Right Card: Outcome */}
                <div className="bg-card rounded-3xl border border-border p-6 md:p-8 lg:p-16 flex flex-col items-center justify-center text-center h-full relative overflow-hidden order-2 md:order-2">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 to-transparent pointer-events-none" />

                  <div className="relative z-10  max-w-md mx-auto">
                    <div className="text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase mb-6">
                      THE OUTCOME
                    </div>

                    <div className="relative">
                      <p className="text-2xl md:text-3xl font-serif italic leading-snug text-foreground">
                        "{item.outcome.text}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls - Bottom */}
        <div className="section-content-padding flex items-center justify-between gap-4 mt-8 ">
          {/* Page Indicators */}
          <div className="flex items-center gap-2">
            {reasons.map((_, index) => (
              <button
                key={index}
                onClick={() => handleIndicatorClick(index)}
                className={`transition-all cursor-pointer ${
                  index === currentIndex
                    ? "w-8 h-2 bg-foreground rounded-full"
                    : "w-2 h-2 bg-muted-foreground/40 rounded-full hover:bg-muted-foreground/60"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleManualNavigation("left")}
              disabled={!canScrollLeft}
              className="rounded-full w-10 h-10 bg-background/5 border-border/10 text-foreground hover:bg-background/10 hover:text-foreground disabled:opacity-30 transition-all"
            >
              <ArrowLeftIcon className="size-10" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleManualNavigation("right")}
              disabled={!canScrollRight}
              className="rounded-full w-10 h-10 bg-background/5 border-border/10 text-foreground hover:bg-background/10 hover:text-foreground disabled:opacity-30 transition-all"
            >
              <ArrowRightIcon className="size-10" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    width="96"
    height="96"
    viewBox="0 0 96 96"
    className={className}
  >
    <g transform="translate(24.024, 60)">
      <path
        d="M44.59-12.96Q45.31-12.58 45.31-12 45.31-11.42 44.59-11.04L44.59-11.04 7.92-11.04 8.06-10.9Q13.01-7.1 14.54-1.2L14.54-1.2Q14.83-0.14 14.83 0L14.83 0Q14.83 0.53 13.82 0.53L13.82 0.53Q13.25 0.53 13.08 0.41 12.91 0.29 12.82-0.19L12.82-0.19Q12.72-0.53 12.62-1.01L12.62-1.01Q11.76-4.51 9.34-7.25 6.91-9.98 3.5-11.33L3.5-11.33Q2.78-11.62 2.64-11.86L2.64-11.86Q2.64-12.48 3.5-12.67L3.5-12.67Q6.91-14.02 9.34-16.75 11.76-19.49 12.62-22.99L12.62-22.99Q12.67-23.14 12.72-23.42 12.77-23.71 12.79-23.81 12.82-23.9 12.89-24.1 12.96-24.29 13.06-24.36 13.15-24.43 13.34-24.48 13.54-24.53 13.82-24.53L13.82-24.53Q14.83-24.53 14.83-24L14.83-24Q14.83-23.86 14.54-22.8L14.54-22.8Q13.1-17.09 8.06-13.1L8.06-13.1 7.92-12.96 44.59-12.96Z"
        fill="currentColor"
      />
    </g>
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    width="96"
    height="96"
    viewBox="0 0 96 96"
    className={className}
  >
    <g transform="translate(96, 0) scale(-1, 1) translate(24.024, 60)">
      <path
        d="M44.59-12.96Q45.31-12.58 45.31-12 45.31-11.42 44.59-11.04L44.59-11.04 7.92-11.04 8.06-10.9Q13.01-7.1 14.54-1.2L14.54-1.2Q14.83-0.14 14.83 0L14.83 0Q14.83 0.53 13.82 0.53L13.82 0.53Q13.25 0.53 13.08 0.41 12.91 0.29 12.82-0.19L12.82-0.19Q12.72-0.53 12.62-1.01L12.62-1.01Q11.76-4.51 9.34-7.25 6.91-9.98 3.5-11.33L3.5-11.33Q2.78-11.62 2.64-11.86L2.64-11.86Q2.64-12.48 3.5-12.67L3.5-12.67Q6.91-14.02 9.34-16.75 11.76-19.49 12.62-22.99L12.62-22.99Q12.67-23.14 12.72-23.42 12.77-23.71 12.79-23.81 12.82-23.9 12.89-24.1 12.96-24.29 13.06-24.36 13.15-24.43 13.34-24.48 13.54-24.53 13.82-24.53L13.82-24.53Q14.83-24.53 14.83-24L14.83-24Q14.83-23.86 14.54-22.8L14.54-22.8Q13.1-17.09 8.06-13.1L8.06-13.1 7.92-12.96 44.59-12.96Z"
        fill="currentColor"
      />
    </g>
  </svg>
);
