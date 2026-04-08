"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader,
  Mail,
  CheckCircle2,
  Box,
  ArrowRight,
  ScanLine,
  Sparkles,
  Zap,
  LoaderIcon,
  MoreHorizontal,
} from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/user/use-user";
import { useAuthActions } from "@/lib/hooks/auth/use-auth-actions";
import { useState, useEffect, useRef } from "react";
import { GoogleLogo } from "@/lib/logos";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import datafastService from "@/lib/services/datafast-service";

export default function AuthPageV2() {
  const { data: session, status } = useSession();
  const email = session?.user?.email;

  // Parallax Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  const rotateX = useTransform(mouseY, [-300, 300], [2.5, -2.5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-2.5, 2.5]);

  // Neural Orchestration State
  const [sentiment, setSentiment] = useState<
    "neutral" | "frustrated" | "resolved"
  >("neutral");

  useEffect(() => {
    datafastService.trackGoal("auth_page_viewed");
  }, []);

  useEffect(() => {
    // Timeline of sentiment shifts
    const t1 = setTimeout(() => setSentiment("frustrated"), 1000); // After user message
    const t2 = setTimeout(() => setSentiment("resolved"), 8000); // After resolution

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Background Gradient Colors based on Sentiment
  const bgColors = {
    neutral: "from-zinc-900 via-zinc-950 to-black",
    frustrated: "from-orange-950/40 via-red-950/20 to-zinc-950",
    resolved: "from-emerald-950/40 via-teal-950/20 to-zinc-950",
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[40%_60%]">
      {/* Left Column - Auth Form */}
      <div className="flex flex-col justify-between p-8 lg:p-16 bg-white text-black relative">
        <div className="w-full max-w-[440px] mx-auto flex flex-col justify-center flex-1 py-12">
          {status === "loading" ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <Spinner />
            </div>
          ) : email ? (
            <SignedIn />
          ) : (
            <SignInForm />
          )}
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500">
          <p>
            By signing up, you agree to our{" "}
            <Link href="/legal/privacy" className="underline hover:text-black">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/legal/terms" className="underline hover:text-black">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Right Column - Chat Mockup (Dark Theme) */}
      <div
        className="hidden lg:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 relative overflow-hidden perspective-1000 transition-colors duration-1000"
        onMouseMove={onMouseMove}
        style={{ perspective: 1000 }}
      >
        {/* Dynamic Background Gradient/Texture */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${bgColors[sentiment]} transition-colors duration-2000`}
          animate={{ opacity: 1 }}
        />

        {/* Animated Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -top-[20%] -right-[10%] w-[80%] h-[80%] blur-[120px] rounded-full mix-blend-screen transition-colors duration-2000 ${sentiment === "frustrated"
            ? "bg-orange-500/10"
            : sentiment === "resolved"
              ? "bg-emerald-500/10"
              : "bg-white/5"
            }`}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className={`absolute bottom-[10%] -left-[10%] w-[60%] h-[60%] blur-[100px] rounded-full mix-blend-screen transition-colors duration-2000 ${sentiment === "frustrated"
            ? "bg-red-500/10"
            : sentiment === "resolved"
              ? "bg-teal-500/10"
              : "bg-white/5"
            }`}
        />

        {/* Chat Interface Mockup with Parallax */}
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-md z-10"
        >
          {/* Insight Nodes Layer */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
            {/* Insight 1: Sentiment Detection */}
            <InsightNode
              delay={1.5}
              text="Sentiment: Frustrated"
              icon={<Zap className="w-3 h-3 text-orange-400" />}
              position="top-18 -right-28"
              color="border-orange-500/30 bg-orange-500/10 text-orange-200"
            />

            {/* Insight 2: Intent Detection */}
            <InsightNode
              delay={2.0}
              text="Intent: Damaged Item"
              icon={<ScanLine className="w-3 h-3 text-blue-400" />}
              position="top-35 -left-24"
              color="border-blue-500/30 bg-blue-500/10 text-blue-200"
            />

            {/* Insight 3: Action Taken */}
            <InsightNode
              delay={8.5}
              text="Action: Replacement"
              icon={<CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              position="bottom-40 -right-24"
              color="border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            />
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10">
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="/logos/magicalcx-appicon-light.png"
                    alt="logo"
                    className="h-8 w-8 rounded-full shadow-lg shadow-black/20"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
                </div>
                <div>
                  <span className="block text-sm font-medium tracking-wide text-zinc-100">
                    MagicalCX
                  </span>
                  <span className="block text-[10px] text-zinc-400 font-medium">
                    Always active
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MoreHorizontal className="w-5 h-5 text-zinc-500" />
              </div>
            </div>

            {/* Chat Content */}
            <div className="p-6 space-y-6 h-[537px]">
              {/* User Message 1 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex justify-end relative group"
              >
                {/* Scan Effect */}
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.0, duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-20 pointer-events-none"
                  style={{ mixBlendMode: "overlay" }}
                />

                <div className="bg-zinc-800/80 backdrop-blur-md text-zinc-200 rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[85%] text-sm leading-relaxed shadow-lg border border-white/5 relative overflow-hidden">
                  <TypewriterText
                    text="My order #4029 arrived damaged. It's broken in half. I'm really frustrated."
                    delay={0.5}
                  />
                </div>
              </motion.div>

              {/* Typing Indicator 1 */}
              <TypingIndicator delay={2.5} duration={1.5} />

              {/* Agent Message 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 4.1, duration: 0.5 }}
                className="flex justify-start"
              >
                <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 text-zinc-300 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[95%] text-sm leading-relaxed shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  <p className="mb-4 relative z-10">
                    <TypewriterText
                      text="I'm so sorry, Jane. That's definitely not the experience we want for you."
                      delay={4.2}
                    />
                  </p>
                  <p className="relative z-10">
                    <TypewriterText
                      text="I've already processed a free replacement for you immediately."
                      delay={6.5}
                    />
                  </p>
                </div>
              </motion.div>

              {/* Replacement Order Card */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 8.5, duration: 0.4 }}
                className="ml-4 max-w-[85%]"
              >
                <div className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center justify-between relative z-10 group cursor-pointer hover:bg-black/60 transition-colors shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-green-400">
                          Replacement Order
                        </span>
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Order #4029-B
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-medium text-zinc-300 border border-white/5">
                    Shipped
                  </div>
                </div>
              </motion.div>

              {/* Typing Indicator 2 */}
              <TypingIndicator delay={9.5} duration={1.2} />

              {/* Agent Message 2 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 10.8, duration: 0.5 }}
                className="flex justify-start"
              >
                <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 text-zinc-300 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[95%] text-sm leading-relaxed shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  <p className="relative z-10">
                    <TypewriterText
                      text="Is there anything else I can help you with today?"
                      delay={10.9}
                    />
                  </p>
                </div>
              </motion.div>

              {/* User Reply (Simulated) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 13.0, duration: 0.5 }}
                className="flex justify-end"
              >
                <div className="bg-zinc-800/80 backdrop-blur-md text-zinc-200 rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[85%] text-sm leading-relaxed shadow-lg border border-white/5">
                  <TypewriterText
                    text="No, that's perfect! Thank you so much!"
                    delay={13.1}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const InsightNode = ({
  delay,
  text,
  icon,
  position,
  color,
}: {
  delay: number;
  text: string;
  icon: React.ReactNode;
  position: string;
  color: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      className={`absolute ${position} flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-xl ${color}`}
    >
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-wider">
        {text}
      </span>
    </motion.div>
  );
};

const TypewriterText = ({
  text,
  delay = 0,
  speed = 30,
}: {
  text: string;
  delay?: number;
  speed?: number;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true);
    }, delay * 1000);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [started, text, speed]);

  return <span>{displayedText}</span>;
};

const TypingIndicator = ({
  delay,
  duration,
}: {
  delay: number;
  duration: number;
}) => {
  const [visible, setVisible] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), delay * 1000);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setRemoved(true), 300); // Allow exit animation
    }, (delay + duration) * 1000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [delay, duration]);

  if (removed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex justify-start"
        >
          <div className="bg-transparent border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Spinner = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <LoaderIcon className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
};

const SignedIn = () => {
  const { data: user, isLoading } = useCurrentUser();
  const { signOutUser } = useAuthActions();

  return (
    <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-2">
        <span className="text-4xl">👋</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-medium tracking-tight text-black">
          Welcome back
        </h2>
        <p className="text-muted-foreground text-base">
          You are currently signed in as
        </p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl w-full bg-gray-50 shadow-sm">
          <Avatar className="w-12 h-12 border border-gray-200">
            <AvatarImage src={user?.photoUrl} alt={user?.name} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="text-left overflow-hidden">
            <h3 className="font-medium truncate text-black">{user?.name}</h3>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full pt-4">
        <Button
          asChild
          className="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-all bg-black text-white hover:bg-gray-900"
        >
          <Link href="/workspaces">Go to Dashboard</Link>
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base hover:bg-gray-50 transition-colors border-gray-200 text-black"
          onClick={() => signOutUser.mutate()}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

const SignInForm = () => {
  const { sendLoginEmail, signInGoogle } = useAuthActions();
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleGoogleSignIn = () => {
    signInGoogle.mutate();
  };

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendLoginEmail.mutateAsync(email);
    setIsEmailSent(true);
  };

  if (isEmailSent) {
    return <VerifyRequest email={email} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="">
        <img
          src="/logos/magicalcx-appicon-dark.png"
          alt=""
          className="rounded-md size-12"
        />
        <h1 className="text-4xl md:text-3xl leading-tight mt-6 mb-4">
          {/* Welcome to the <br />
          HumanlyClear era. */}
          Sign in to MagicalCX
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-sm">
          {/* Empathy-first support that actually cares. Sign up to start
          orchestration. */}
          Start delivering empathy-first customer service at scale.
        </p>
      </div>

      <div className="space-y-4 pt-4">
        <Button
          variant="default"
          type="button"
          className="w-full h-14 gap-3 shadow-sm hover:shadow transition-all text-base font-medium rounded-xl"
          disabled={signInGoogle.isPending}
          onClick={handleGoogleSignIn}
        >
          {signInGoogle.isPending ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <GoogleLogo className="w-5 h-5" />
          )}
          Continue with Google
        </Button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-medium tracking-wider">
              Or
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Continue with work email"
              required
              disabled={sendLoginEmail.isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 px-4 transition-colors rounded-xl text-base pr-12"
            />
            <button
              type="submit"
              disabled={sendLoginEmail.isPending || !email}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all disabled:opacity-50"
            >
              {sendLoginEmail.isPending ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function VerifyRequest({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="rounded-full bg-green-50 p-5 ring-8 ring-green-50/50">
        <Mail className="h-10 w-10 text-green-600" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl tracking-tight text-black">Check your email</h1>
        <p className="text-muted-foreground w-full mx-auto text-base">
          We have sent a sign-in link to{" "}
          <span className="font-medium text-black block mt-1">{email}</span>
        </p>
      </div>

      <div className="w-full border-t border-gray-100 pt-8">
        <p className="text-sm text-gray-500 mb-6">
          Click the link in the email to sign in.
        </p>
        <Button
          variant="ghost"
          className="text-sm hover:bg-gray-50 text-black"
          onClick={() => window.location.reload()}
        >
          Back to sign in
        </Button>
      </div>
    </div>
  );
}
