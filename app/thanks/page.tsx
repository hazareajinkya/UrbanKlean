"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Loader } from "lucide-react";
import { useDemoModal } from "@/components/landing/demo-modal";
import { useRouter } from "next/navigation";
import { useAgentRealtime } from "@/lib/hooks/agent/use-agent-realtime";
import { IAgent } from "@/lib/types/agent";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const isAgentReadyForChat = (agent: IAgent | null) => {
  if (!agent) return false;
  return agent.trainingStatus !== "pending";
};

const parseEstimatedMinutes = (raw: string | null): number => {
  if (!raw) return 0;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n;
};

const PhoneFrame = (args: { children: ReactNode }) => {
  return (
    <div className="flex justify-center w-full">
      <div className="relative">
        <div className="relative bg-gray-900 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-2xl">
          <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden w-[355px] h-[647px] max-w-full flex flex-col">
            {args.children}
          </div>
        </div>
      </div>
    </div>
  );
};

const phoneScreenClass =
  "flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto bg-zinc-50 px-6 py-10 text-center";

const ThanksPhoneChatShimmer = () => (
  <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
    <div className="px-4 pr-2 py-3 bg-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
          <div className="h-3 bg-gray-300 rounded animate-pulse w-32" />
        </div>
      </div>
    </div>
    <div className="flex-1" />
    <div className="px-3 pb-0 pt-3">
      <div className="flex items-end gap-3">
        <div className="flex-1 border-1 relative rounded-lg">
          <div className="flex items-end gap-2 p-1 h-10">
            <div className="w-full flex-1 relative">
              <div className="h-0 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="py-4 text-center flex justify-center items-center gap-0">
      <div className="h-2 bg-gray-200 rounded animate-pulse w-32" />
    </div>
  </div>
);

const ThanksPhoneConnecting = () => {
  return (
    <PhoneFrame>
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <ThanksPhoneChatShimmer />
      </div>
    </PhoneFrame>
  );
};

const ThanksPhoneNoId = () => {
  return (
    <PhoneFrame>
      <div className={phoneScreenClass}>
        <div className="flex w-full max-w-[300px] flex-col items-center gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-balance text-2xl font-medium leading-tight text-foreground">
              No agent in this link
            </h2>
            <p className="text-balance text-sm leading-relaxed text-muted-foreground">
              Open this page from onboarding so the URL includes your agent id.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 w-full rounded-full bg-foreground px-6 text-base text-background hover:bg-foreground/90"
          >
            <Link href="/onboarding">Back to onboarding</Link>
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
};

const ThanksPhoneNotFound = () => {
  return (
    <PhoneFrame>
      <div className={phoneScreenClass}>
        <div className="flex w-full max-w-[300px] flex-col items-center gap-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white">
            <svg
              className="h-10 w-10 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-balance text-2xl font-medium leading-tight tracking-tight text-foreground">
              Hey, Agent Not Found
            </h2>

            <p className="text-balance text-sm leading-relaxed text-muted-foreground">
              The agent you&apos;re looking for doesn&apos;t exist or may have
              been removed. Please contact{" "}
              <a
                href="mailto:support@magicalcx.com"
                className="text-foreground font-medium underline underline-offset-4 hover:no-underline"
              >
                MagicalCX Support
              </a>{" "}
              for assistance.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full border-foreground px-6 text-base text-foreground hover:bg-muted/50"
            >
              <Link href="mailto:support@magicalcx.com">Contact Support</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full border-zinc-200 bg-white px-6 text-base text-foreground hover:bg-zinc-50"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
};

const ThanksPhoneSubscriptionError = (args: { onRetry: () => void }) => {
  return (
    <PhoneFrame>
      <div className={phoneScreenClass}>
        <div className="flex w-full max-w-[300px] flex-col items-center gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-balance text-2xl font-medium leading-tight text-foreground">
              Couldn&apos;t load status
            </h2>
            <p className="text-balance text-sm leading-relaxed text-muted-foreground">
              Check your connection and try again.
            </p>
          </div>
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-full bg-foreground px-6 text-base text-background hover:bg-foreground/90"
            onClick={args.onRetry}
          >
            Try again
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
};

const computeTrainingProgressPercent = (args: {
  elapsedMs: number;
  estimatedMs: number;
}) => {
  const t = Math.min(1, Math.max(0, args.elapsedMs / args.estimatedMs));
  const eased = 1 - (1 - t) ** 2.15;
  return Math.min(94, Math.max(2, eased * 94));
};

const ThanksPhoneTraining = (args: {
  estimatedMinutes: number;
  pageEnteredAtMs: number;
}) => {
  const { estimatedMinutes, pageEnteredAtMs } = args;
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((n) => n + 1);
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  const elapsedMs = Date.now() - pageEnteredAtMs;
  const estimatedMs = estimatedMinutes > 0 ? estimatedMinutes * 60 * 1000 : 0;

  const progressPercent =
    estimatedMinutes <= 0
      ? null
      : computeTrainingProgressPercent({
          elapsedMs,
          estimatedMs,
        });

  const estimationText =
    estimatedMinutes > 0
      ? `This will take about ${estimatedMinutes} minute${estimatedMinutes === 1 ? "" : "s"}.`
      : "This will take about a minute…";

  return (
    <PhoneFrame>
      <div
        className={phoneScreenClass}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex w-full max-w-[300px] flex-col items-center gap-7">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center">
            <Loader
              className="h-9 w-9 shrink-0 animate-spin text-primary"
              aria-hidden
            />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-balance text-2xl font-medium leading-tight tracking-tight text-foreground">
              Training your agent…
            </h2>
            <p className="text-balance text-xs text-muted-foreground">
              We’re learning from your website.
            </p>
          </div>

          <div className="w-full space-y-2">
            {progressPercent !== null ? (
              <Progress
                value={progressPercent}
                className="h-1.5 w-full rounded-full bg-primary/15 [&_[data-slot=progress-indicator]]:bg-primary"
              />
            ) : (
              <Skeleton className="h-1.5 w-full rounded-full bg-primary/15" />
            )}
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              {estimationText}
            </p>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
};

const ThanksShell = (args: { children: ReactNode }) => {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-8 sm:pt-24 sm:pb-16 border-x section-container section-content-padding w-full flex flex-col justify-center">
        {args.children}
      </main>
      <div className="bg-background dark">
        <Footer />
      </div>
    </div>
  );
};

const ThanksTwoColumnLayout = (args: {
  phoneSlot: ReactNode;
  onTrialStart: () => void;
  openDemoModal: () => void;
}) => {
  const { phoneSlot, onTrialStart, openDemoModal } = args;
  return (
    <>
      <div className="lg:hidden text-center mb-4 px-2">
        <h1 className="text-2xl sm:text-3xl mb-2">
          Meet your AI customer experience agent
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          You&apos;re testing a free demo agent trained only on your public
          website. It&apos;s a preview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-24 items-center max-w-6xl mx-auto w-full">
        {phoneSlot}
        <div className="hidden lg:flex flex-col items-start text-left space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-4xl leading-normal">
              Meet your AI customer experience agent
            </h1>
            <p className="text-base sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              You&apos;re testing a free demo agent trained only on your public
              website. It&apos;s a preview. The full MagicalCX setup adds your
              policies + integrations + memory, so it feels human and performs
              10x better in real customer conversations.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="rounded-full group border-primary "
                onClick={onTrialStart}
                size="lg"
              >
                Start 14‑Day Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-primary "
                onClick={openDemoModal}
              >
                Book Demo
              </Button>
            </div>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground flex-wrap lg:flex-nowrap">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="shrink-0 w-5 h-5 rounded-full border border-emerald-500/70 bg-emerald-500/20 shadow-sm flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
              </span>
              <span>Done For You Setup</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="shrink-0 w-5 h-5 rounded-full border border-emerald-500/70 bg-emerald-500/20 shadow-sm flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
              </span>
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="shrink-0 w-5 h-5 rounded-full border border-emerald-500/70 bg-emerald-500/20 shadow-sm flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
              </span>
              <span>Turn chats into revenue</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden mt-6 px-2">
        <div className="bg-muted/50 rounded-2xl p-2 sm:p-6 space-y-4">
          <div className="text-balance text-center space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              You&apos;re testing a free demo agent trained only on your public
              website. It&apos;s a preview. The full MagicalCX setup adds your
              policies + integrations + memory, so it feels human and performs
              10x better in real customer conversations.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full py-5 text-base rounded-full group"
              onClick={onTrialStart}
            >
              Start 14‑Day Trial
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full py-5 text-base rounded-full"
              onClick={openDemoModal}
            >
              Book Demo
            </Button>
          </div>

          <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 w-4 h-4 rounded-full border border-emerald-500/70 bg-emerald-500/20 shadow-sm flex items-center justify-center">
                <Check className="w-2 h-2 text-emerald-600" strokeWidth={2.5} />
              </span>
              <span>Done For You Setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 w-4 h-4 rounded-full border border-emerald-500/70 bg-emerald-500/20 shadow-sm flex items-center justify-center">
                <Check className="w-2 h-2 text-emerald-600" strokeWidth={2.5} />
              </span>
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 w-4 h-4 rounded-full border border-emerald-500/70 bg-emerald-500/20 shadow-sm flex items-center justify-center">
                <Check className="w-2 h-2 text-emerald-600" strokeWidth={2.5} />
              </span>
              <span>Turn chats into revenue</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ThanksPageContent = () => {
  const params = useSearchParams();
  const id = params.get("id");
  const estimatedTimeParam = params.get("estimatedTime");
  const router = useRouter();
  const { openDemoModal } = useDemoModal();
  const onTrialStart = () => router.push(`/pricing`);
  const pageEnteredAtRef = useRef(Date.now());
  const estimatedMinutes = parseEstimatedMinutes(estimatedTimeParam);

  const { agent, isListening, subscriptionError, retrySubscription } =
    useAgentRealtime({ agentId: id });

  const phoneSlot = (() => {
    if (!id) {
      return <ThanksPhoneNoId />;
    }
    if (isListening) {
      return <ThanksPhoneConnecting />;
    }
    if (subscriptionError) {
      return <ThanksPhoneSubscriptionError onRetry={retrySubscription} />;
    }
    if (agent === null) {
      return <ThanksPhoneNotFound />;
    }
    if (!isAgentReadyForChat(agent)) {
      return (
        <ThanksPhoneTraining
          estimatedMinutes={estimatedMinutes}
          pageEnteredAtMs={pageEnteredAtRef.current}
        />
      );
    }
    return (
      <PhoneFrame>
        <iframe
          src={`/chat/${id}`}
          className="h-full w-full min-h-0 border-0"
          title="Magical CX"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />
      </PhoneFrame>
    );
  })();

  return (
    <ThanksShell>
      <ThanksTwoColumnLayout
        phoneSlot={phoneSlot}
        onTrialStart={onTrialStart}
        openDemoModal={openDemoModal}
      />
    </ThanksShell>
  );
};

const ThanksPageFallback = () => (
  <ThanksShell>
    <ThanksTwoColumnLayout
      phoneSlot={<ThanksPhoneConnecting />}
      onTrialStart={() => {}}
      openDemoModal={() => {}}
    />
  </ThanksShell>
);

export default function SharePage() {
  return (
    <Suspense fallback={<ThanksPageFallback />}>
      <ThanksPageContent />
    </Suspense>
  );
}
