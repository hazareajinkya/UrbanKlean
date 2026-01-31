import Link from "next/link";
import { Button } from "@/components/ui/button";

export const AgentNotFound = () => (
  <div className="flex items-center justify-center flex-col h-screen bg-background px-6">
    <div className="section-container border-x border-y py-16 px-8 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full border border-border flex items-center justify-center">
        <svg
          className="w-10 h-10 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h2 className="text-3xl leading-normal md:text-4xl mb-4 text-foreground">
        Hey, Agent Not Found
      </h2>

      <p className="text-base leading-relaxed text-muted-foreground max-w-md mx-auto mb-8">
        The agent you&apos;re looking for doesn&apos;t exist or may have been
        removed. Please contact{" "}
        <a
          href="mailto:support@magicalcx.com"
          className="text-foreground font-medium underline underline-offset-4 hover:no-underline"
        >
          MagicalCX Support
        </a>{" "}
        for assistance.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          asChild
          size="lg"
          className="px-8 py-6 text-base rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 hover:shadow-lg active:scale-100 transition-all"
        >
          <Link href="mailto:support@magicalcx.com">Contact Support</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="px-8 py-6 text-base rounded-full border-border hover:bg-accent hover:scale-105 active:scale-100 transition-all"
        >
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  </div>
);
