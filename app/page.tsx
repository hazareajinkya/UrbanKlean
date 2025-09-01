"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const handleGoToWorkspaces = () => {
    router.push("/workspaces");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center space-y-12">
        {/* Main Title */}
        <div className="space-y-6">
          <h1 className="text-6xl md:text-7xl font-light tracking-tight text-slate-900 leading-none">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-medium">
              SuperCX
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 font-light max-w-lg mx-auto leading-relaxed">
            Experience customer excellence like never before
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-8">
          <Button
            onClick={handleGoToWorkspaces}
            variant="default"
            size="lg"
            className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105"
          >
            Go to Workspaces
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Subtle decoration */}
        <div className="pt-16 opacity-60">
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse animation-delay-200" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
