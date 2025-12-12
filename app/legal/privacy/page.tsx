"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { useScroll } from "framer-motion";
import { useRef } from "react";

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 border-x section-container section-content-padding w-full ">
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
            Privacy Policy
          </h1>

          <div className="p-8 bg-muted/30 rounded-lg border border-border text-center">
            <h2 className="text-xl font-medium mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">
              Our Privacy Policy is currently being updated to ensure full
              compliance with the latest regulations. Please check back soon for
              the complete policy details.
            </p>
            <p className="text-muted-foreground mt-4">
              If you have immediate questions regarding your data privacy,
              please contact us at support@magicalcx.com.
            </p>
          </div>
        </div>
      </main>

      <div className="bg-background dark">
        <Footer />
      </div>
    </div>
  );
}
