"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, MessageCircle, Zap, Heart, ShieldCheck, Menu, X, Play, BarChart3, Globe, Cpu, Search, Bell, Settings, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// --- Components ---

const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Animated Grid Pattern */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }}
    />
    
    {/* Gradient Orbs */}
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" 
         style={{ animationDuration: '4s' }} />
    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" 
         style={{ animationDuration: '6s', animationDelay: '1s' }} />
    <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" 
         style={{ animationDuration: '5s', animationDelay: '2s' }} />
    
    {/* Radial Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/50 to-white" />
    
    {/* Top and Bottom Fade */}
    <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/90" />
  </div>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-200 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            M
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">MagicalCX</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {["Product", "Solutions", "Resources", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="#" className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors">
            Log in
          </Link>
          <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-5 h-10 text-sm font-medium shadow-lg shadow-slate-900/10 transition-all hover:shadow-slate-900/20 hover:-translate-y-0.5">
            Start Free Trial
          </Button>
        </div>

        <button className="md:hidden text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Mobile Menu */}
       {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-6 md:hidden flex flex-col space-y-4 shadow-xl"
        >
          {["Product", "Solutions", "Resources", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-slate-900 text-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
           <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
            <Link href="#" className="text-slate-900 text-base font-medium">Log in</Link>
            <Button className="bg-blue-600 text-white w-full rounded-lg h-11 text-base font-medium shadow-lg shadow-blue-600/20">
                Start Free Trial
            </Button>
           </div>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <GridBackground />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            New: Voice AI 2.0 is now live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8 max-w-4xl leading-[1.1]"
          >
            Customer support that <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">actually feels human.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed"
          >
            MagicalCX resolves 80% of support tickets instantly with AI that understands context, emotion, and nuance. No more robotic responses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button className="h-14 px-8 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-lg font-semibold shadow-xl shadow-blue-600/20 transition-all hover:scale-105">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" className="h-14 px-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-lg font-medium hover:text-slate-900 transition-all">
              <Play className="mr-2 w-5 h-5 fill-slate-700" />
              Watch Demo
            </Button>
          </motion.div>
        </div>

        {/* Hero Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-xl shadow-2xl shadow-slate-200/50 p-2">
            <div className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                {/* Mockup Header */}
                <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 justify-between">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                        <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md text-xs font-medium text-slate-500">
                        <ShieldCheck className="w-3 h-3" />
                        magicalcx.app
                    </div>
                    <div className="w-16" />
                </div>
                
                {/* Mockup Body */}
                <div className="grid md:grid-cols-12 h-[500px]">
                    {/* Sidebar */}
                    <div className="hidden md:block col-span-3 bg-white border-r border-slate-200 p-4">
                        <div className="flex items-center gap-3 mb-8 px-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">M</div>
                            <span className="font-bold text-slate-900">MagicalCX</span>
                        </div>
                        <div className="space-y-1">
                            {[
                                { icon: MessageCircle, label: "Inbox", active: true },
                                { icon: Zap, label: "Automations" },
                                { icon: BarChart3, label: "Analytics" },
                                { icon: User, label: "Customers" },
                                { icon: Settings, label: "Settings" },
                            ].map((item, i) => (
                                <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${item.active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="col-span-12 md:col-span-9 bg-slate-50/50 flex flex-col relative">
                        {/* Chat Header */}
                        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">JD</div>
                                <div>
                                    <div className="font-semibold text-slate-900 text-sm">John Doe</div>
                                    <div className="text-xs text-slate-500">Order #2929 • via Chat</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-8 text-xs">View Order</Button>
                                <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700">Resolve</Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-6 space-y-6 overflow-hidden">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 text-xs font-bold">JD</div>
                                <div className="max-w-md">
                                    <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm text-slate-700 text-sm leading-relaxed">
                                        Hi, I ordered the Premium Plan last week but I still haven't received my activation key. Can you help?
                                    </div>
                                    <div className="text-xs text-slate-400 mt-2 ml-1">10:42 AM</div>
                                </div>
                            </div>

                            <div className="flex gap-4 flex-row-reverse">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">AI</div>
                                <div className="max-w-md">
                                    <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-md shadow-blue-600/10 text-white text-sm leading-relaxed">
                                        Hello John! I can certainly help with that. I've located your order #2929. It looks like the activation email bounced.
                                        <br/><br/>
                                        I've just resent the key to <strong>john@example.com</strong>. Let me know if you receive it!
                                    </div>
                                    <div className="text-xs text-slate-400 mt-2 mr-1 text-right">10:42 AM • AI Generated</div>
                                </div>
                            </div>
                            
                            <div className="flex justify-center">
                                <div className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full">
                                    Ticket resolved by MagicalCX
                                </div>
                            </div>
                        </div>
                        
                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Type a message..." 
                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-12 top-20 bg-white p-4 rounded-xl shadow-xl border border-slate-100 hidden lg:block"
          >
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg text-green-600"><Zap className="w-4 h-4" /></div>
                <div>
                    <div className="text-xs font-bold text-slate-900">Response Time</div>
                    <div className="text-xs text-slate-500">Instant</div>
                </div>
            </div>
            <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-full bg-green-500 rounded-full" />
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-12 bottom-40 bg-white p-4 rounded-xl shadow-xl border border-slate-100 hidden lg:block"
          >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Heart className="w-4 h-4" /></div>
                <div>
                    <div className="text-xs font-bold text-slate-900">CSAT Score</div>
                    <div className="text-lg font-bold text-slate-900">4.9/5.0</div>
                </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ title, description, icon: Icon }: any) => (
    <div className="group p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-300">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
            <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
);

const Features = () => {
    return (
        <section className="py-24 bg-slate-50/50 relative">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Built for complex conversations</h2>
                    <p className="text-lg text-slate-600">Most chatbots fail when things get real. MagicalCX thrives on context, nuance, and empathy.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard 
                        title="Context Aware" 
                        description="Remembers previous conversations, orders, and preferences. No more repeating information."
                        icon={Cpu}
                    />
                    <FeatureCard 
                        title="Multi-Channel" 
                        description="Seamlessly switches between Voice, SMS, Email, and Chat without losing context."
                        icon={Globe}
                    />
                    <FeatureCard 
                        title="Human Tone" 
                        description="Understands sarcasm, urgency, and frustration. Responds with genuine empathy."
                        icon={Heart}
                    />
                </div>
            </div>
        </section>
    );
};

const TrustedBrands = () => (
  <section className="py-12 border-b border-slate-100 bg-white">
    <div className="container mx-auto px-6 max-w-7xl text-center">
      <p className="text-sm font-medium text-slate-500 mb-8">TRUSTED BY 100+ FORWARD-THINKING BRANDS</p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        {/* Placeholder Logos - In a real app, use SVGs */}
        {["Acme Corp", "GlobalBank", "Nebula", "Trio", "FoxRun", "Circle"].map((brand, i) => (
            <div key={i} className="text-xl md:text-2xl font-bold text-slate-400 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-200" />
                {brand}
            </div>
        ))}
      </div>
    </div>
  </section>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <Hero />
      <TrustedBrands />
      <Features />
      {/* Footer would go here */}
    </div>
  );
}
