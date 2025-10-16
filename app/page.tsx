"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/clients/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import GradientBlinds from "@/components/landing/gradient-blinds";
import { useIsMobile } from "@/hooks/use-mobile";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await setDoc(doc(db, "waitlist", email), {
        email,
        createdAt: new Date().toISOString(),
      });
      setIsSubmitted(true);
      toast.success("Successfully joined the waitlist!");
    } catch (error) {
      console.error("Error joining waitlist:", error);
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-black relative">
      {/* GradientBlinds as overlay with pointer-events-none so it always tracks mouse */}
      <div className="absolute inset-0 w-full h-full z-20 " aria-hidden="true">
        <GradientBlinds
          gradientColors={["#640d5f", "#5227FF"]}
          angle={20}
          noise={0}
          blindCount={isMobile ? 4 : 16}
          blindMinWidth={60}
          spotlightRadius={0.5}
          spotlightSoftness={1}
          spotlightOpacity={1}
          mouseDampening={0.15}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="lighten"
        />
      </div>

      {/* Content with pointer-events-auto to remain interactive */}
      <div className="h-screen relative z-30 h-max max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-12 text-white pointer-events-none">
        <div className="w-full flex flex-col items-center">
          <div className="flex justify-center gap-2 items-center mb-4">
            <img
              src="/magical-cx-logo.png"
              alt="Magical Logo"
              className="w-6 h-6"
            />
            <p className="">Magical CX</p>
          </div>

          <h1 className="text-4xl md:text-7xl font-semibold md:leading-20 tracking-tight mb-4">
            Greater sales <br /> for every business
            {/* Reimagining how AI feels in customer experience. */}
          </h1>

          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="px-4 text-base md:text-xl leading-7 md:leading-8 text-white">
              Because great experiences aren’t about automation — they’re about
              understanding. Magical CX creates AI that listens, feels, and
              responds like humans.
            </p>
          </div>
        </div>

        {!isSubmitted ? (
          <div className="space-y-4 w-full flex flex-col items-center">
            <form
              onSubmit={handleJoinWaitlist}
              className="flex pointer-events-auto flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 min-w-80 bg-card/40 text-gray-200 placeholder:text-gray-300"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Joining..." : "Join the waitlist"}
              </Button>
            </form>
            <p className="text-sm text-gray-300">
              Launching soon. Private beta.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto">
            <p className="text-green-800 font-medium">
              🎉 You're on the waitlist!
            </p>
            <p className="text-green-600 text-sm mt-1">
              We'll notify you when we launch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
