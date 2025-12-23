"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import {
  isBlockedCompanyDomain,
  normalizeDomain,
  validateDomain,
} from "@/lib/utils";
import { useState, useEffect } from "react";
import { useOnboardingActions } from "@/lib/hooks/onboarding/use-onboarding-actions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Mail,
  Globe,
  Search,
  Cog,
  Building2,
  Bot,
  CheckCircle2,
  Loader2,
  Terminal,
  Code2,
  Database,
  Lock,
  Zap,
} from "lucide-react";

type Step = "email" | "website" | "processing" | "complete";

const processingSteps = [
  { icon: Search, label: "Gathering information...", duration: 2000 },
  { icon: Database, label: "Generating information...", duration: 2000 },
  { icon: Building2, label: "Creating workspace...", duration: 1500 },
  { icon: Bot, label: "Creating Agent...", duration: 2500 },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [emailError, setEmailError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);

  const { startOnboarding } = useOnboardingActions();

  // Email validation
  const validateEmail = (value: string): boolean => {
    setEmailError("");
    if (!value.trim()) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Valid email required");
      return false;
    }
    return true;
  };

  // URL validation
  const validateUrl = (value: string): boolean => {
    setUrlError("");
    if (!value.trim()) {
      setUrlError("Website URL is required");
      return false;
    }
    const normalized = normalizeDomain(value);
    if (!validateDomain(normalized)) {
      setUrlError("Valid URL required");
      return false;
    }
    if (isBlockedCompanyDomain(normalized)) {
      setUrlError("Please use your company website");
      return false;
    }
    return true;
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      setStep("website");
    }
  };

  const handleWebsiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUrl(websiteUrl)) {
      setStep("processing");
      setCurrentProcessingStep(0);

      const url = websiteUrl.startsWith("http")
        ? websiteUrl
        : `https://${websiteUrl}`;

      try {
        const result = await startOnboarding.mutateAsync({ email, url });
        console.log(result);
        setEstimatedTime(result?.data?.estimatedTime ?? 0);
      } catch (error) {
        console.error("Onboarding error:", error);
      }
    }
  };

  useEffect(() => {
    if (step !== "processing") return;

    const timer = setTimeout(() => {
      if (currentProcessingStep < processingSteps.length - 1) {
        setCurrentProcessingStep((prev) => prev + 1);
      } else {
        setStep("complete");
      }
    }, processingSteps[currentProcessingStep].duration);

    return () => clearTimeout(timer);
  }, [step, currentProcessingStep]);

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-8 lg:pt-24 lg:pb-12 section-container mx-auto section-content-padding border-x w-full">
        <div
          className={`grid gap-8 items-center min-h-[75vh] lg:min-h-[600px] transition-all duration-500 ease-in-out ${
            step === "processing"
              ? "grid-cols-1 max-w-2xl mx-auto w-full"
              : "lg:grid-cols-2 lg:gap-24"
          }`}
        >
          <div
            className={`flex flex-col justify-center max-w-xl w-full ${
              step === "processing" ? "hidden" : "flex"
            }`}
          >
            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-8"
                >
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Step 1 of 2
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-3 lg:mb-4 text-foreground">
                      Welcome to the future of support.
                    </h1>
                    <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed font-normal">
                      Let's start by setting up your admin account. What's your
                      work email?
                    </p>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="email"
                          className="text-base font-medium"
                        >
                          Email Address
                        </Label>
                        {emailError && (
                          <span className="text-sm font-medium text-destructive">
                            {emailError}
                          </span>
                        )}
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) validateEmail(e.target.value);
                        }}
                        className="h-14 text-base px-4 rounded-lg bg-background font-normal"
                        autoFocus
                      />
                    </div>

                    <Button
                      type="submit"
                      className="h-12 px-6 text-base font-medium min-w-[140px] w-full sm:w-auto"
                    >
                      Next Step <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === "website" && (
                <motion.div
                  key="website"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-8"
                >
                  <div>
                    <Button
                      variant="ghost"
                      onClick={() => setStep("email")}
                      className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground mb-4 font-normal"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back to email
                    </Button>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Step 2 of 2
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-3 lg:mb-4 text-foreground">
                      Where does your business live?
                    </h1>
                    <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed font-normal">
                      We'll scan your website to automatically train your
                      support agent.
                    </p>
                  </div>

                  <form onSubmit={handleWebsiteSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="website"
                          className="text-base font-medium"
                        >
                          Company Website
                        </Label>
                        {urlError && (
                          <span className="text-sm font-medium text-destructive">
                            {urlError}
                          </span>
                        )}
                      </div>
                      <Input
                        id="website"
                        type="text"
                        placeholder="supercx.ai"
                        value={websiteUrl}
                        onChange={(e) => {
                          setWebsiteUrl(e.target.value);
                          if (urlError) validateUrl(e.target.value);
                        }}
                        className="h-14 text-base px-4 rounded-lg bg-background font-normal"
                        autoFocus
                      />
                    </div>

                    <Button
                      type="submit"
                      className="h-12 px-6 text-base font-medium min-w-[160px] w-full sm:w-auto"
                    >
                      <Sparkles className="mr-2 w-4 h-4" /> Generate Agent
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === "complete" && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <Bot className="w-3.5 h-3.5" />
                      Training in Progress
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground">
                      Your agent is being trained!
                    </h1>
                    <p className="text-lg text-muted-foreground font-normal">
                      We're training your AI agent with your company information
                      to provide personalized support.
                    </p>
                  </div>

                  {/* Training Info Card */}
                  <div className="bg-muted/30 border rounded-2xl p-6 space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Database className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          Training on your data
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Scanning {websiteUrl} for company information
                        </p>
                      </div>
                    </div>

                    {estimatedTime > 0 && (
                      <div className="flex items-center gap-4 pt-4 border-t border-dashed">
                        <div className="p-3 bg-orange-500/10 rounded-xl">
                          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            Estimated time
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Approximately {Math.ceil(estimatedTime / 60)}{" "}
                            minutes
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t border-dashed">
                      <div className="p-3 bg-green-500/10 rounded-xl">
                        <Mail className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          We'll notify you when ready
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          An email will be sent to{" "}
                          <span className="font-medium text-foreground">
                            {email}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    You can close this page. We'll email you when your agent is
                    ready!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT PANEL - DYNAMIC VISUALS */}
          <div
            className={`w-full bg-primary/5 rounded-2xl lg:rounded-[2.5rem] relative flex-col justify-center items-center overflow-hidden border border-primary/10 min-h-[350px] lg:min-h-[500px] transition-all duration-500 ${
              step === "processing" ? "flex shadow-2xl" : "hidden lg:flex"
            }`}
          >
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-primary/5 rounded-full blur-[100px]" />
              <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/10 rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            </div>

            <div className="relative z-10 w-full max-w-sm px-6 lg:px-8 py-6 lg:py-0">
              <AnimatePresence mode="wait">
                {(step === "email" || step === "website") && (
                  <motion.div
                    key="visual-hero"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-card/80 backdrop-blur-xl border border-primary/10 rounded-[2rem] p-6 shadow-2xl shadow-primary/5"
                  >
                    {/* Mock Chat Interface Visual */}
                    <div className="space-y-4">
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-background rounded-2xl rounded-tl-none p-4 shadow-sm border text-sm text-muted-foreground font-normal">
                          <div className="h-2 w-24 bg-primary/10 rounded-full mb-2" />
                          <div className="h-2 w-48 bg-muted rounded-full mb-2" />
                          <div className="h-2 w-32 bg-muted rounded-full" />
                        </div>
                      </div>
                      <div className="flex gap-3 items-start flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
                        </div>
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-4 shadow-lg shadow-primary/20 text-sm font-normal">
                          <div className="h-2 w-32 bg-primary-foreground/20 rounded-full mb-2" />
                          <div className="h-2 w-40 bg-primary-foreground/20 rounded-full" />
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-background rounded-2xl rounded-tl-none p-4 shadow-sm border text-sm text-muted-foreground font-normal">
                          <div className="flex gap-1 mb-1">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-75" />
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-dashed border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <Globe className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            Training Sources
                          </div>
                          <div className="text-xs text-muted-foreground font-normal">
                            {websiteUrl || "Waiting for input..."}
                          </div>
                        </div>
                        {websiteUrl && (
                          <div className="ml-auto">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded text-[10px] font-medium text-green-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              Active
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {(step === "processing" || step === "complete") && (
                  <motion.div
                    key="visual-processing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full relative"
                  >
                    <div className="relative w-full max-w-[380px] h-[400px] mx-auto flex items-center justify-center perspective-[1000px]">
                      <AnimatePresence mode="popLayout">
                        {step === "complete" ? (
                          <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="absolute inset-0 m-auto h-fit bg-background/80 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 shadow-2xl w-full text-center overflow-hidden z-50"
                          >
                            <div className="absolute inset-0 bg-green-500/5" />
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                delay: 0.2,
                                stiffness: 200,
                              }}
                              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20"
                            >
                              <Mail className="w-10 h-10 text-white" />
                            </motion.div>
                            <h3 className="text-2xl font-bold mb-2">
                              We'll Email You
                            </h3>
                            <p className="text-muted-foreground">
                              When your agent is ready to go!
                            </p>
                          </motion.div>
                        ) : (
                          processingSteps.map((item, index) => {
                            // Only render active and future steps
                            if (index < currentProcessingStep) return null;

                            const isCurrent = index === currentProcessingStep;
                            const offset = index - currentProcessingStep;

                            // Limit the stack depth visibility to keep DOM clean
                            if (offset > 2) return null;

                            return (
                              <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{
                                  opacity: isCurrent ? 1 : 1 - offset * 0.3,
                                  scale: isCurrent ? 1 : 1 - offset * 0.05,
                                  y: isCurrent ? 0 : offset * 20,
                                  z: isCurrent ? 0 : -offset * 50,
                                  rotateX: isCurrent ? 0 : -5,
                                  zIndex: 50 - index,
                                }}
                                exit={{
                                  opacity: 0,
                                  scale: 1.05,
                                  y: -100, // Fly up and away
                                  rotate: -5,
                                  transition: { duration: 0.4 },
                                }}
                                transition={{
                                  duration: 0.5,
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 20,
                                }}
                                className="absolute w-full top-0 origin-bottom"
                                style={{ transformStyle: "preserve-3d" }}
                              >
                                <div
                                  className={`relative bg-card border rounded-3xl p-8 shadow-2xl h-[360px] flex flex-col items-center justify-center text-center transition-colors duration-500 ${
                                    isCurrent
                                      ? "border-primary/20 shadow-primary/10"
                                      : "border-border/50 bg-muted/20"
                                  }`}
                                >
                                  {isCurrent && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl" />
                                  )}
                                  <div
                                    className={`relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center mb-8 transition-colors ${
                                      isCurrent
                                        ? "bg-primary/10 text-primary"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    <item.icon className="w-10 h-10" />
                                  </div>
                                  <h3
                                    className={`relative z-10 text-2xl font-bold mb-2 transition-colors ${
                                      isCurrent
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {item.label}
                                  </h3>
                                  <p className="relative z-10 text-muted-foreground text-sm">
                                    {isCurrent
                                      ? "Processing step..."
                                      : "Waiting in queue"}
                                  </p>

                                  {isCurrent && (
                                    <div className="relative z-10 w-full mt-8 max-w-[200px]">
                                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                          className="h-full bg-primary"
                                          initial={{ width: "0%" }}
                                          animate={{ width: "100%" }}
                                          transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <div className="bg-background dark">
        <Footer />
      </div>
    </div>
  );
}
