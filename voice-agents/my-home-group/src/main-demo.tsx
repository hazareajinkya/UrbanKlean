"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { Orb, type AgentState } from "@/components/ui/orb";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Loader,
  Volume2,
  VolumeX,
  Star,
  MessageSquare,
  AlertCircle,
  BarChart3,
  Bell,
  Home,
  Building2,
  IndianRupee,
  Users,
  TrendingUp,
  Sparkles,
  FileText,
  PhoneIncoming,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type DemoType = "lead_qualification" | "outbound_followup" | "site_visit" | "review";

type ConversationStep =
  | "idle"
  | "greeting"
  | "qualifying_bhk"
  | "qualifying_budget"
  | "qualifying_location"
  | "qualifying_timeline"
  | "property_match"
  | "slot_selection"
  | "confirmation"
  | "success"
  | "outbound_intro"
  | "outbound_qualifying"
  | "outbound_converted"
  | "review_intro"
  | "review_rating"
  | "review_comments"
  | "review_complete";

type Property = {
  id: string;
  name: string;
  location: string;
  bhk: string;
  priceLabel: string;
  priceMin: number;
  tag: string;
  highlight: string;
};

type SiteVisitSlot = {
  date: string;
  time: string;
  available: boolean;
};

type LeadProfile = {
  name: string;
  phone: string;
  bhk: string;
  budget: string;
  location: string;
  timeline: string;
  score: number;
};

const PROPERTIES: Property[] = [
  {
    id: "grava",
    name: "My Home Grava",
    location: "Neopolis, Kokapet",
    bhk: "4 BHK",
    priceLabel: "₹2.5 Cr onwards",
    priceMin: 25000000,
    tag: "Ultra Luxury",
    highlight: "City skyline views · Ready to move",
  },
  {
    id: "nishada",
    name: "My Home Nishada",
    location: "Neopolis, Kokapet",
    bhk: "3 & 4 BHK",
    priceLabel: "₹1.8 Cr onwards",
    priceMin: 18000000,
    tag: "Ultra Luxury",
    highlight: "Clubhouse · Infinity pool",
  },
  {
    id: "akrida",
    name: "My Home Akrida",
    location: "Gopanpally",
    bhk: "2, 2.5 & 3 BHK",
    priceLabel: "₹85 L onwards",
    priceMin: 8500000,
    tag: "Premium",
    highlight: "EV charging · Smart home features",
  },
  {
    id: "vipina",
    name: "My Home Vipina",
    location: "Tellapur",
    bhk: "2, 2.5 & 3 BHK",
    priceLabel: "₹75 L onwards",
    priceMin: 7500000,
    tag: "Premium Lifestyle",
    highlight: "Gated community · Kids play area",
  },
];

const SITE_VISIT_SLOTS: SiteVisitSlot[] = [
  { date: "May 10, 2026", time: "10:00 AM", available: true },
  { date: "May 10, 2026", time: "12:00 PM", available: false },
  { date: "May 10, 2026", time: "3:00 PM", available: true },
  { date: "May 11, 2026", time: "10:00 AM", available: true },
  { date: "May 11, 2026", time: "11:30 AM", available: true },
  { date: "May 11, 2026", time: "4:00 PM", available: false },
];

export default function MyHomeGroupDemo() {
  const vapiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  const vapiRef = useRef<Vapi | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortSimulationRef = useRef(false);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const [demoType, setDemoType] = useState<DemoType>("lead_qualification");
  const [voiceState, setVoiceState] = useState<"idle" | "connecting" | "listening" | "talking" | "error">("idle");
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [currentStep, setCurrentStep] = useState<ConversationStep>("idle");
  const [transcript, setTranscript] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [typingText, setTypingText] = useState<{ role: "user" | "assistant"; text: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const [leadProfile, setLeadProfile] = useState<Partial<LeadProfile>>({});
  const [matchedProperties, setMatchedProperties] = useState<Property[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SiteVisitSlot | null>(null);
  const [visitId, setVisitId] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      userAudioRef.current = new Audio();
      if (window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
        const load = () => setAvailableVoices(synthRef.current?.getVoices() || []);
        load();
        synthRef.current.onvoiceschanged = load;
      }
    }
    return () => {
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
      if (synthRef.current) synthRef.current.cancel();
      audioRef.current?.pause();
      userAudioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    const container = transcriptScrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
    const observer = new MutationObserver(() => { container.scrollTop = container.scrollHeight; });
    observer.observe(container, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const container = transcriptScrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [transcript, typingText?.text]);

  const getPreferredVoice = useCallback(() => {
    if (availableVoices.length === 0) return null;
    for (const name of ["Samantha", "Karen", "Moira", "Google UK English Female"]) {
      const v = availableVoices.find(v => v.name.includes(name));
      if (v) return v;
    }
    return availableVoices.find(v => v.lang.startsWith("en")) || availableVoices[0];
  }, [availableVoices]);

  const speakWithElevenLabs = useCallback(async (
    text: string,
    opts: { role?: "assistant" | "user"; animateOrb?: boolean } = {},
  ): Promise<boolean> => {
    const role = opts.role ?? "assistant";
    const animateOrb = opts.animateOrb ?? role === "assistant";
    const ref = role === "user" ? userAudioRef : audioRef;
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, role }),
      });
      if (!response.ok) return false;
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      return new Promise((resolve) => {
        if (!ref.current) { resolve(false); return; }
        ref.current.src = audioUrl;
        if (animateOrb) {
          if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
          volumeIntervalRef.current = setInterval(() => setVoiceVolume(0.3 + Math.random() * 0.5), 80);
        }
        ref.current.onended = () => {
          if (animateOrb) { if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current); setVoiceVolume(0); }
          URL.revokeObjectURL(audioUrl);
          resolve(true);
        };
        ref.current.onerror = () => {
          if (animateOrb) { if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current); setVoiceVolume(0); }
          URL.revokeObjectURL(audioUrl);
          resolve(false);
        };
        ref.current.play().catch(() => resolve(false));
      });
    } catch { return false; }
  }, []);

  const speakWithBrowser = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!synthRef.current || isSpeakerMuted) { setTimeout(resolve, text.length * 50); return; }
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getPreferredVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = setInterval(() => setVoiceVolume(0.3 + Math.random() * 0.5), 100);
      utterance.onend = () => { if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current); setVoiceVolume(0); resolve(); };
      utterance.onerror = () => { if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current); setVoiceVolume(0); resolve(); };
      synthRef.current.speak(utterance);
    });
  }, [getPreferredVoice, isSpeakerMuted]);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (abortSimulationRef.current) throw new Error("Simulation aborted");
    if (isSpeakerMuted) { await new Promise(r => setTimeout(r, text.length * 40)); return; }
    if (useElevenLabs) {
      const ok = await speakWithElevenLabs(text, { role: "assistant" });
      if (ok) return;
      setUseElevenLabs(false);
    }
    await speakWithBrowser(text);
  }, [isSpeakerMuted, useElevenLabs, speakWithElevenLabs, speakWithBrowser]);

  const speakAsUser = useCallback(async (text: string): Promise<void> => {
    if (abortSimulationRef.current) throw new Error("Simulation aborted");
    if (isSpeakerMuted) return;
    if (useElevenLabs) {
      const ok = await speakWithElevenLabs(text, { role: "user", animateOrb: false });
      if (ok) return;
    }
  }, [isSpeakerMuted, useElevenLabs, speakWithElevenLabs]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    if (userAudioRef.current) { userAudioRef.current.pause(); userAudioRef.current.currentTime = 0; }
    if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
    setVoiceVolume(0);
  }, []);

  const isVoiceConnected = voiceState === "listening" || voiceState === "talking";
  const orbState: AgentState =
    voiceState === "connecting" ? "thinking"
    : voiceState === "listening" ? "listening"
    : voiceState === "talking" ? "talking"
    : null;

  useEffect(() => {
    if (!vapiKey) return;
    const vapi = new Vapi(vapiKey);
    vapi.on("call-start", () => { setVoiceState("listening"); setCurrentStep("greeting"); });
    vapi.on("call-end", () => { setVoiceState("idle"); setVoiceVolume(0); setIsMuted(false); });
    vapi.on("speech-start", () => setVoiceState("talking"));
    vapi.on("speech-end", () => setVoiceState("listening"));
    vapi.on("volume-level", (v: number) => setVoiceVolume(v));
    vapi.on("error", () => setVoiceState("error"));
    vapiRef.current = vapi;
    return () => { void vapi.stop(); vapiRef.current = null; };
  }, [vapiKey]);

  const delay = (ms: number) => new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => {
      if (abortSimulationRef.current) reject(new Error("Simulation aborted"));
      else resolve();
    }, ms);
    if (abortSimulationRef.current) { clearTimeout(t); reject(new Error("Simulation aborted")); }
  });

  const typeText = useCallback(async (role: "user" | "assistant", text: string, speedMs = 30): Promise<void> => {
    if (abortSimulationRef.current) throw new Error("Simulation aborted");
    const words = text.split(" ");
    let current = "";
    for (let i = 0; i < words.length; i++) {
      if (abortSimulationRef.current) throw new Error("Simulation aborted");
      current += (i === 0 ? "" : " ") + words[i];
      setTypingText({ role, text: current });
      await new Promise(r => setTimeout(r, speedMs + Math.random() * 20));
    }
    setTranscript(prev => [...prev, { role, text }]);
    setTypingText(null);
  }, []);

  const speakAndType = async (text: string) => {
    await Promise.all([speak(text), typeText("assistant", text, 50)]);
  };

  const typeUserMessage = async (text: string) => {
    await Promise.all([speakAsUser(text), typeText("user", text, 55)]);
  };

  const resetDemo = () => {
    stopSpeaking();
    setVoiceState("idle");
    setVoiceVolume(0);
    setCurrentStep("idle");
    setTranscript([]);
    setTypingText(null);
    setLeadProfile({});
    setMatchedProperties([]);
    setSelectedSlot(null);
    setVisitId("");
    setReviewRating(0);
    setReviewComment("");
  };

  // ==================== LEAD QUALIFICATION ====================
  const runLeadQualificationSimulation = async () => {
    abortSimulationRef.current = false;
    setIsSimulating(true);
    setVoiceState("connecting");

    try {
      await delay(1500);
      setVoiceState("talking");
      setCurrentStep("greeting");
      await speakAndType("Hello! Thank you for calling My Home Group. I'm Priya, your personal property advisor. How can I help you today?");

      setVoiceState("listening");
      await delay(1500);
      await typeUserMessage("Hi, I'm looking for a 3BHK apartment in Hyderabad. I saw your projects online.");

      await delay(500);
      setCurrentStep("qualifying_bhk");
      setLeadProfile(prev => ({ ...prev, bhk: "3 BHK" }));
      setVoiceState("talking");
      await speakAndType("Wonderful! A 3BHK is an excellent choice. Could you tell me your name so I can personalise this for you?");

      setVoiceState("listening");
      await delay(1500);
      await typeUserMessage("I'm Rahul Sharma");
      setLeadProfile(prev => ({ ...prev, name: "Rahul Sharma" }));

      await delay(500);
      setVoiceState("talking");
      await speakAndType("Great to speak with you Rahul! And what is your approximate budget range for this property?");

      setVoiceState("listening");
      await delay(2000);
      await typeUserMessage("I'm looking in the range of 1 to 1.5 crore rupees");
      setCurrentStep("qualifying_budget");
      setLeadProfile(prev => ({ ...prev, budget: "₹1 Cr – ₹1.5 Cr" }));

      await delay(500);
      setVoiceState("talking");
      await speakAndType("Perfect, that's a great range. Do you have a preferred location in Hyderabad? We have projects in Kokapet, Gopanpally, Tellapur, and more.");

      setVoiceState("listening");
      await delay(2000);
      await typeUserMessage("I prefer the Kokapet or Gopanpally area — close to the financial district");
      setCurrentStep("qualifying_location");
      setLeadProfile(prev => ({ ...prev, location: "Kokapet / Gopanpally" }));

      await delay(500);
      setVoiceState("talking");
      await speakAndType("Excellent choice, very close to the Financial District and Gachibowli tech corridor. And what is your timeline — are you looking for immediate possession or are you okay with an under-construction property?");

      setVoiceState("listening");
      await delay(2000);
      await typeUserMessage("I need possession within the next 12 to 18 months");
      setCurrentStep("qualifying_timeline");
      setLeadProfile(prev => ({ ...prev, timeline: "12–18 months", score: 87 }));

      await delay(800);
      const matched = PROPERTIES.filter(p =>
        p.location.toLowerCase().includes("kokapet") || p.location.toLowerCase().includes("gopanpally")
      );
      setMatchedProperties(matched);
      setCurrentStep("property_match");
      setVoiceState("talking");
      await speakAndType(`Rahul, based on your preferences I have two perfect matches for you. My Home Nishada in Kokapet offers stunning 3 and 4 BHK ultra-luxury apartments starting at 1.8 crores. And My Home Akrida in Gopanpally has beautiful 3BHK premium homes starting at 85 lakhs — well within budget. I'd love to show you both in person. Would you be open to a site visit this weekend?`);

      setVoiceState("listening");
      await delay(2000);
      await typeUserMessage("Yes, that sounds great! I can come on Sunday morning");

      await delay(500);
      setCurrentStep("slot_selection");
      setVoiceState("talking");
      await speakAndType("Perfect! I have a Sunday 10 AM slot available at My Home Nishada. Shall I confirm that for you?");

      setVoiceState("listening");
      await delay(1500);
      await typeUserMessage("Yes please, 10 AM on Sunday works for me");
      setSelectedSlot(SITE_VISIT_SLOTS[3]);

      await delay(500);
      const id = `MHG${Date.now().toString().slice(-6)}`;
      setVisitId(id);
      setCurrentStep("confirmation");
      setVoiceState("talking");
      await speakAndType(`Excellent! Site visit confirmed for Sunday May 11th at 10 AM at My Home Nishada, Kokapet. Your visit ID is ${id}. Our relationship manager Vikram will personally escort you through the project. You'll receive a WhatsApp confirmation shortly. Is there anything else I can help with?`);

      setVoiceState("listening");
      await delay(1500);
      await typeUserMessage("That's perfect, thank you so much!");

      await delay(500);
      setCurrentStep("success");
      setVoiceState("talking");
      await speakAndType("You're most welcome Rahul! We look forward to meeting you. My Home Group has been building dream homes for over 35 years and we're certain you'll love what we have to show you. See you Sunday!");

      await delay(2000);
      setVoiceState("idle");
      setIsSimulating(false);
    } catch {
      console.log("Simulation ended");
    }
  };

  // ==================== OUTBOUND FOLLOW-UP ====================
  const runOutboundFollowupSimulation = async () => {
    abortSimulationRef.current = false;
    setIsSimulating(true);
    setVoiceState("connecting");
    setLeadProfile({ name: "Pooja Mehta", phone: "+91 98765 43210", bhk: "2 BHK", budget: "₹70L – ₹90L", location: "Tellapur" });

    try {
      await delay(1500);
      setCurrentStep("outbound_intro");
      setVoiceState("talking");
      await speakAndType("Hello, am I speaking with Pooja Mehta? This is Priya calling from My Home Group. You had enquired about 2BHK apartments on our website two days ago. Is this a good time to talk?");

      setVoiceState("listening");
      await delay(1500);
      await typeUserMessage("Yes hi, this is Pooja. Yes I was looking at some apartments");

      await delay(500);
      setCurrentStep("outbound_qualifying");
      setVoiceState("talking");
      await speakAndType("Wonderful Pooja! I saw you were interested in 2BHK homes. Based on your enquiry I believe My Home Vipina in Tellapur could be perfect — premium gated community, 2 and 3 BHK starting at 75 lakhs, with possession in 12 months. Does that match what you're looking for?");

      setVoiceState("listening");
      await delay(2000);
      await typeUserMessage("Yes that does sound interesting. My budget is around 80 lakhs. Is there flexibility on pricing?");
      setLeadProfile(prev => ({ ...prev, budget: "~₹80L", score: 78 }));

      await delay(500);
      setVoiceState("talking");
      await speakAndType("Absolutely Pooja! We have limited early-bird pricing right now with a special home loan tie-up at 8.4% with HDFC. For a 80 lakh budget you'd actually get a very spacious 2BHK with a beautiful view. Would you like to come for a site visit to see the actual flat?");

      setVoiceState("listening");
      await delay(2000);
      await typeUserMessage("Yes I would love to come for a site visit. When are you available?");

      await delay(500);
      setSelectedSlot(SITE_VISIT_SLOTS[0]);
      setCurrentStep("outbound_converted");
      setVoiceState("talking");
      await speakAndType("Fantastic! I can arrange Saturday May 10th at 10 AM at My Home Vipina, Tellapur. Our sales team will pick you up from the nearest metro station if you prefer. Shall I confirm this?");

      setVoiceState("listening");
      await delay(1500);
      await typeUserMessage("Yes please confirm that. That works for me!");

      await delay(500);
      const id = `MHG${Date.now().toString().slice(-6)}`;
      setVisitId(id);
      setCurrentStep("success");
      setVoiceState("talking");
      await speakAndType("Confirmed Pooja! Site visit booked for Saturday 10 AM at My Home Vipina. Your visit ID is MHG confirmed. We'll send all details on WhatsApp. Looking forward to meeting you and showing you your future home!");

      await delay(2000);
      setVoiceState("idle");
      setIsSimulating(false);
    } catch {
      console.log("Simulation ended");
    }
  };

  // ==================== SITE VISIT BOOKING ====================
  const runSiteVisitSimulation = async () => {
    abortSimulationRef.current = false;
    setIsSimulating(true);
    setVoiceState("connecting");

    try {
      await delay(1500);
      setVoiceState("talking");
      setCurrentStep("greeting");
      await speakAndType("Hello! Thank you for calling My Home Group. I'm Priya. Are you calling to schedule a site visit or do you have a query about our projects?");

      setVoiceState("listening");
      await delay(1500);
      await typeUserMessage("Hi Priya, I want to schedule a site visit for My Home Grava. I've seen it online and it looks amazing.");

      await delay(500);
      setCurrentStep("slot_selection");
      setMatchedProperties([PROPERTIES[0]]);
      setVoiceState("talking");
      await speakAndType("Absolutely! My Home Grava is our ultra-luxury 4BHK project at Neopolis Kokapet — stunning skyline views and world-class amenities. May I know your name please?");

      setVoiceState("listening");
      await delay(1500);
      await typeUserMessage("I'm Arjun Nair");
      setLeadProfile(prev => ({ ...prev, name: "Arjun Nair", bhk: "4 BHK" }));

      await delay(500);
      setVoiceState("talking");
      await speakAndType("Lovely Arjun! We have site visits at Grava on Saturday May 10th — slots at 10 AM and 3 PM are open. And on Sunday May 11th at 10 AM and 11:30 AM. Which works best for you?");

      setVoiceState("listening");
      await delay(2000);
      await typeUserMessage("Sunday 11:30 AM works perfectly for me");
      setSelectedSlot(SITE_VISIT_SLOTS[4]);

      await delay(500);
      const id = `MHG${Date.now().toString().slice(-6)}`;
      setVisitId(id);
      setCurrentStep("confirmation");
      setVoiceState("talking");
      await speakAndType(`Perfect Arjun! Site visit confirmed at My Home Grava, Neopolis Kokapet on Sunday May 11th at 11:30 AM. Your booking reference is ${id}. Our luxury consultant will personally guide you through the sample flat and show you the panoramic city views. Shall I also email you the project brochure and location map?`);

      setVoiceState("listening");
      await delay(1500);
      await typeUserMessage("Yes please, that would be great");

      await delay(500);
      setCurrentStep("success");
      setVoiceState("talking");
      await speakAndType("Done! Brochure is on its way to your registered email. Parking is complimentary on the day of your visit. We look forward to welcoming you Arjun. Is there anything else I can assist you with?");

      setVoiceState("listening");
      await delay(1200);
      await typeUserMessage("No that's all, thank you!");

      await delay(500);
      setVoiceState("talking");
      await speakAndType("Perfect! See you Sunday. Thank you for choosing My Home Group — building dreams for over 35 years. Have a great day!");

      await delay(2000);
      setVoiceState("idle");
      setIsSimulating(false);
    } catch {
      console.log("Simulation ended");
    }
  };

  // ==================== REVIEW COLLECTION ====================
  const runReviewSimulation = async () => {
    abortSimulationRef.current = false;
    setIsSimulating(true);
    setVoiceState("connecting");
    setLeadProfile({ name: "Kiran Reddy" });

    try {
      await delay(1500);
      setCurrentStep("review_intro");
      setVoiceState("talking");
      await speakAndType("Hello, am I speaking with Kiran Reddy? This is Priya from My Home Group. You visited My Home Nishada last Saturday — I hope you loved the project! Do you have just 2 minutes to share your experience?");

      setVoiceState("listening");
      await delay(1500);
      await typeUserMessage("Yes hi Priya, I remember. The visit was really good actually");

      await delay(500);
      setCurrentStep("review_rating");
      setVoiceState("talking");
      await speakAndType("That's so great to hear Kiran! On a scale of 1 to 5 — where 5 is exceptional — how would you rate your overall experience at My Home Nishada?");

      setVoiceState("listening");
      await delay(2000);
      await typeUserMessage("I'd say 4 out of 5. The project is really impressive");
      setReviewRating(4);

      await delay(500);
      setVoiceState("talking");
      await speakAndType("A 4 out of 5 is wonderful, thank you! What could we have done to make it a perfect 5?");

      setVoiceState("listening");
      await delay(2000);
      setCurrentStep("review_comments");
      await typeUserMessage("The sample flat was beautiful but I wish there was more information about the payment plans. The sales person was a bit rushed");
      setReviewComment("More clarity on payment plans needed. Sales team seemed rushed.");

      await delay(500);
      setVoiceState("talking");
      await speakAndType("That's very valuable feedback Kiran, thank you! I completely understand — transparent payment planning is very important. I'll personally arrange a detailed call with our finance team to walk you through all options at your convenience. Can I schedule that for tomorrow?");

      setVoiceState("listening");
      await delay(1500);
      await typeUserMessage("Yes that would be very helpful, thank you");

      await delay(500);
      setCurrentStep("review_complete");
      setVoiceState("talking");
      await speakAndType("Wonderful! Our finance advisor will call you tomorrow at 11 AM. And as a thank you for your feedback, I've added a priority viewing slot for My Home Grava to your account — our most exclusive project. We truly value your trust, Kiran. Have a lovely day!");

      setVoiceState("listening");
      await delay(1200);
      await typeUserMessage("Thank you Priya, really appreciate it!");

      await delay(500);
      setVoiceState("talking");
      await speakAndType("Absolutely! Thank you for being a valued My Home Group customer. We look forward to helping you find your dream home soon!");

      await delay(2000);
      setVoiceState("idle");
      setIsSimulating(false);
    } catch {
      console.log("Simulation ended");
    }
  };

  const handleStartVoice = () => {
    if (demoType === "lead_qualification") runLeadQualificationSimulation();
    else if (demoType === "outbound_followup") runOutboundFollowupSimulation();
    else if (demoType === "site_visit") runSiteVisitSimulation();
    else if (demoType === "review") runReviewSimulation();
  };

  const handleEndVoice = async () => {
    abortSimulationRef.current = true;
    if (isSimulating) { setIsSimulating(false); resetDemo(); return; }
    if (vapiRef.current && isVoiceConnected) await vapiRef.current.stop();
    resetDemo();
  };

  const handleToggleMute = () => {
    if (!vapiRef.current || !isVoiceConnected) return;
    vapiRef.current.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#1e293b] bg-[#475569]/25";
    if (score >= 60) return "text-amber-400 bg-amber-950/40";
    return "text-slate-500 bg-slate-100";
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="bg-white/95 border-b border-slate-200 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white text-xs font-medium tracking-wider">MHG</span>
            </div>
            <div>
              <h1 className="text-sm font-medium text-slate-900">My Home Group</h1>
              <p className="text-xs text-slate-500">AI Voice · Real Estate</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-100 rounded-full p-0.5 mr-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-900 shadow-sm">
                Voice Demo
              </span>
              <Link
                href="/demo/my-home-group/triggers"
                className="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                <Bell className="size-3" />
                Triggers
              </Link>
              <Link
                href="/demo/my-home-group/analytics"
                className="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                <BarChart3 className="size-3" />
                Analytics
              </Link>
            </div>

            <div className="flex bg-slate-100 rounded-full p-0.5">
              {(["lead_qualification", "outbound_followup", "site_visit", "review"] as DemoType[]).map((type) => {
                const labels: Record<DemoType, string> = {
                  lead_qualification: "Lead Qualification",
                  outbound_followup: "Outbound Follow-up",
                  site_visit: "Site Visit",
                  review: "Review",
                };
                return (
                  <button
                    key={type}
                    onClick={() => { resetDemo(); setDemoType(type); }}
                    disabled={isSimulating}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all",
                      demoType === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {labels[type]}
                  </button>
                );
              })}
            </div>

            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium ml-2",
              isVoiceConnected ? "bg-[#475569]/20 text-[#1e293b]" : "bg-slate-100 text-slate-500"
            )}>
              {isVoiceConnected ? "● Live" : "Ready"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 lg:p-10">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: Voice Agent */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-medium text-slate-800">AI Voice Advisor</h2>
              <p className="text-sm text-slate-500">
                {demoType === "lead_qualification" && "Inbound enquiry — qualify lead & match properties"}
                {demoType === "outbound_followup" && "AI proactively follows up on website enquiry"}
                {demoType === "site_visit" && "Book a site visit for any My Home project"}
                {demoType === "review" && "Post-visit feedback & relationship nurturing"}
              </p>
            </div>

            {/* Agent Persona Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <div
                  className="size-12 shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-white text-base font-medium"
                  aria-hidden="true"
                >
                  P
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">Priya</p>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Online
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your personal property advisor · 35+ years · 10,000+ homes
                  </p>
                </div>
              </div>
            </div>

            {/* Orb — WebGL core + soft halo (no ring border) */}
            <div className="aspect-square max-w-[300px] mx-auto relative isolate">
              <div
                className="pointer-events-none absolute inset-0 rounded-full bg-sky-300/35 blur-3xl scale-[0.85]"
                style={{ animation: "voice-orb-halo 3.4s ease-in-out infinite" }}
              />
              <div className="relative z-10 h-full w-full overflow-hidden rounded-full">
              <Orb
                className="h-full w-full"
                colors={["#BAE6FD", "#38BDF8"]}
                noiseStrength={0.35}
                agentState={orbState}
                volumeMode="manual"
                manualInput={voiceVolume}
                manualOutput={voiceVolume}
              />
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center z-20">
                <span className="inline-block px-4 py-2 bg-slate-900/85 backdrop-blur-md rounded-full text-sm text-white shadow-[0_8px_32px_rgba(15,23,42,0.25)] border border-slate-700/40">
                  {voiceState === "connecting" && "Connecting..."}
                  {voiceState === "listening" && "Listening..."}
                  {voiceState === "talking" && "Priya is speaking..."}
                  {voiceState === "idle" && "Tap Start to begin"}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {isVoiceConnected || isSimulating ? (
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" size="lg" className="rounded-full px-6 border-slate-200 text-slate-500" disabled>
                    <Phone className="size-4 mr-2" />
                    Start
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full px-4 border-slate-200 text-slate-800" onClick={handleToggleMute}>
                    {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn("rounded-full px-4 border-slate-200 text-slate-800", isSpeakerMuted && "bg-[#475569]/20 border-[#475569]/30 text-[#1e293b]")}
                    onClick={() => { setIsSpeakerMuted(!isSpeakerMuted); if (!isSpeakerMuted) stopSpeaking(); }}
                  >
                    {isSpeakerMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                  </Button>
                  <Button size="lg" className="rounded-full px-6 bg-slate-900 hover:bg-slate-800 text-white" onClick={handleEndVoice}>
                    <PhoneOff className="size-4 mr-2" />
                    End
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button
                    className="w-full max-w-sm rounded-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-base shadow-sm font-medium"
                    onClick={handleStartVoice}
                    disabled={voiceState === "connecting"}
                  >
                    {voiceState === "connecting" ? (
                      <><Loader className="size-4 mr-2 animate-spin" />Connecting...</>
                    ) : (
                      <><Phone className="size-4 mr-2" />Start Conversation</>
                    )}
                  </Button>
                </div>
              )}

              {/* Transcript */}
              {(transcript.length > 0 || typingText) && (
                <div
                  ref={transcriptScrollRef}
                  className="max-h-72 min-h-32 overflow-y-auto overscroll-contain space-y-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
                  aria-label="Conversation transcript"
                >
                  {transcript.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "text-sm p-3 rounded-2xl",
                        msg.role === "assistant" ? "bg-[#475569]/20 text-slate-700" : "bg-slate-50 text-slate-700 ml-6"
                      )}
                    >
                      <span className="font-medium text-slate-900">{msg.role === "assistant" ? "Priya: " : "You: "}</span>
                      {msg.text}
                    </div>
                  ))}
                  {typingText && (
                    <div
                      className={cn(
                        "text-sm p-3 rounded-2xl",
                        typingText.role === "assistant" ? "bg-[#475569]/20 text-slate-700" : "bg-slate-50 text-slate-700 ml-6"
                      )}
                    >
                      <span className="font-medium text-slate-900">{typingText.role === "assistant" ? "Priya: " : "You: "}</span>
                      {typingText.text}
                      <span className="animate-pulse">|</span>
                    </div>
                  )}
                  <div ref={transcriptEndRef} aria-hidden="true" />
                </div>
              )}
            </div>
          </div>

          {/* Right: Visual Display */}
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h2 className="text-base font-medium text-slate-800">Live Property Console</h2>
                <p className="text-sm text-slate-500">Visual elements shown during the call</p>
              </div>

              <div className="p-5 min-h-[500px]">
                {/* Idle */}
                {currentStep === "idle" && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="size-14 rounded-full bg-[#475569]/20 flex items-center justify-center mb-4">
                      <Building2 className="size-6 text-[#334155]" />
                    </div>
                    <p className="text-slate-500 text-sm">Start a conversation to see the live property advisor in action</p>
                  </div>
                )}

                {/* Greeting */}
                {currentStep === "greeting" && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-6">
                      <div className="size-20 rounded-2xl bg-[#475569] flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white font-black text-xl">MHG</span>
                      </div>
                      <h3 className="text-xl font-medium text-slate-800 mb-1">Welcome to My Home Group</h3>
                      <p className="text-slate-500 text-sm">35+ years · 25+ landmark developments · Hyderabad</p>
                      <div className="flex justify-center gap-3 mt-4 flex-wrap">
                        {["Kokapet", "Gopanpally", "Tellapur", "Gachibowli"].map(loc => (
                          <span key={loc} className="text-[11px] px-2.5 py-1 rounded-full bg-[#475569]/20 text-[#1e293b] font-medium">
                            <MapPin className="size-2.5 inline mr-0.5" />
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Qualifying Steps - show growing lead profile */}
                {(currentStep === "qualifying_bhk" || currentStep === "qualifying_budget" || currentStep === "qualifying_location" || currentStep === "qualifying_timeline" || currentStep === "outbound_qualifying") && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium text-slate-800">Building Lead Profile</h3>
                      {leadProfile.score && (
                        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", getScoreColor(leadProfile.score))}>
                          Score: {leadProfile.score}/100
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {[
                        { key: "name", label: "Name", icon: Users },
                        { key: "bhk", label: "BHK Preference", icon: Home },
                        { key: "budget", label: "Budget Range", icon: IndianRupee },
                        { key: "location", label: "Preferred Location", icon: MapPin },
                        { key: "timeline", label: "Timeline", icon: Clock },
                      ].map(({ key, label, icon: Icon }) => {
                        const val = leadProfile[key as keyof typeof leadProfile];
                        return (
                          <div key={key} className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all",
                            val ? "border-[#475569]/20 bg-[#475569]/20" : "border-slate-200 bg-slate-50"
                          )}>
                            <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", val ? "bg-[#475569]/20" : "bg-slate-100")}>
                              <Icon className={cn("size-4", val ? "text-[#475569]" : "text-slate-500")} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500">{label}</p>
                              {val ? (
                                <p className="text-sm font-medium text-slate-800">{String(val)}</p>
                              ) : (
                                <p className="text-sm text-slate-500 italic">Collecting...</p>
                              )}
                            </div>
                            {val && <CheckCircle2 className="size-4 text-[#475569] shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Outbound Intro */}
                {currentStep === "outbound_intro" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="text-center py-3">
                      <div className="size-14 rounded-full bg-[#475569]/20 flex items-center justify-center mx-auto mb-3">
                        <PhoneIncoming className="size-7 text-[#475569]" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-800">Outbound Call Initiated</h3>
                      <p className="text-sm text-slate-500">Following up on website enquiry</p>
                    </div>
                    <div className="bg-[#475569]/20 rounded-2xl p-4 space-y-2">
                      <p className="text-[#475569] text-xs uppercase tracking-wide font-medium mb-2">CRM Lead Details</p>
                      {Object.entries({
                        Name: leadProfile.name,
                        "Enquiry Type": "2 BHK Apartment",
                        Location: "Tellapur",
                        "Source": "Website Form",
                        "Enquired": "2 days ago",
                      }).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-slate-500">{k}</span>
                          <span className="text-slate-800 font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Property Match */}
                {currentStep === "property_match" && matchedProperties.length > 0 && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-[#475569]" />
                      <h3 className="text-base font-medium text-slate-800">Matched Properties</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#475569]/20 text-[#1e293b]">{matchedProperties.length} found</span>
                    </div>
                    {matchedProperties.map(p => (
                      <div key={p.id} className="border border-[#475569]/20 rounded-2xl p-4 bg-white hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="size-3" />{p.location}
                            </p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#475569] text-white font-medium">{p.tag}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <p className="text-xs text-slate-500">{p.bhk}</p>
                            <p className="text-[#475569] font-medium text-sm">{p.priceLabel}</p>
                          </div>
                          <p className="text-xs text-slate-500 text-right max-w-32">{p.highlight}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Slot Selection */}
                {currentStep === "slot_selection" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <h3 className="text-base font-medium text-slate-800 flex items-center gap-2">
                      <Calendar className="size-4 text-[#475569]" />
                      Available Site Visit Slots
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {SITE_VISIT_SLOTS.map((slot, i) => (
                        <button
                          key={i}
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            "p-3 rounded-xl border transition-all text-left",
                            !slot.available ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                            : selectedSlot === slot ? "border-[#475569] bg-[#475569]/20"
                            : "border-slate-200 bg-white hover:border-[#475569]/35"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <Clock className="size-3.5 text-[#475569]" />
                            <span className="text-slate-800 text-sm font-medium">{slot.time}</span>
                          </div>
                          <p className="text-slate-500 text-xs">{slot.date}</p>
                          {!slot.available && <span className="text-[#334155] text-xs">Booked</span>}
                        </button>
                      ))}
                    </div>
                    {matchedProperties.length > 0 && (
                      <div className="bg-[#475569]/20 rounded-xl p-3 flex items-center gap-2">
                        <Building2 className="size-4 text-[#475569] shrink-0" />
                        <p className="text-sm text-slate-700">
                          Visiting: <span className="font-medium">{matchedProperties[0]?.name}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Confirmation */}
                {(currentStep === "confirmation" || currentStep === "outbound_converted") && selectedSlot && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <h3 className="text-base font-medium text-slate-800">Site Visit Confirmed</h3>
                    <div className="rounded-2xl divide-y divide-slate-200 border border-slate-200 overflow-hidden">
                      <div className="p-4 bg-white">
                        <p className="text-slate-500 text-xs uppercase tracking-wide">Visitor</p>
                        <p className="text-slate-800 font-medium">{leadProfile.name || "Customer"}</p>
                      </div>
                      <div className="p-4 bg-white">
                        <p className="text-slate-500 text-xs uppercase tracking-wide">Project</p>
                        <p className="text-slate-800 font-medium">{matchedProperties[0]?.name || "My Home Project"}</p>
                        <p className="text-slate-500 text-xs">{matchedProperties[0]?.location}</p>
                      </div>
                      <div className="p-4 bg-white">
                        <p className="text-slate-500 text-xs uppercase tracking-wide">Date & Time</p>
                        <p className="text-slate-800 font-medium">{selectedSlot.date} at {selectedSlot.time}</p>
                      </div>
                      <div className="p-4 bg-[#475569]/20">
                        <p className="text-slate-500 text-xs uppercase tracking-wide">Visit ID</p>
                        <p className="text-[#475569] font-medium font-mono">{visitId || "MHG000000"}</p>
                      </div>
                    </div>
                    <p className="text-center text-slate-500 text-xs">WhatsApp confirmation sent</p>
                  </div>
                )}

                {/* Success */}
                {currentStep === "success" && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-4">
                      <div className="size-16 rounded-full bg-[#475569]/20 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="size-9 text-[#475569]" />
                      </div>
                      <h3 className="text-xl font-medium text-slate-800 mb-1">Visit Booked!</h3>
                      <p className="text-[#475569] font-mono font-medium">#{visitId || "MHG000000"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                      {selectedSlot && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Project</span>
                            <span className="text-slate-800 font-medium">{matchedProperties[0]?.name || "My Home Project"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Date & Time</span>
                            <span className="text-slate-800 font-medium">{selectedSlot.date} at {selectedSlot.time}</span>
                          </div>
                        </>
                      )}
                      {leadProfile.score && (
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                          <span className="text-slate-500">Lead Score</span>
                          <span className={cn("font-medium", getScoreColor(leadProfile.score).split(" ")[0])}>
                            {leadProfile.score}/100 — Hot Lead
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="bg-[#475569] rounded-2xl p-4 text-center text-white">
                      <p className="font-medium text-sm">Our relationship manager will call you 1 hour before the visit</p>
                      <p className="text-white/80 text-xs mt-1">Parking & refreshments complimentary</p>
                    </div>
                  </div>
                )}

                {/* Review Intro */}
                {currentStep === "review_intro" && (
                  <div className="space-y-5 animate-in fade-in duration-500 text-center py-4">
                    <div className="size-16 rounded-full bg-[#475569]/20 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="size-8 text-[#475569]" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-800">Post-Visit Feedback Call</h3>
                    <div className="bg-[#475569]/20 rounded-2xl p-4">
                      <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Customer</p>
                      <p className="text-[#475569] font-medium">{leadProfile.name}</p>
                      <p className="text-slate-500 text-sm mt-2">Site Visit · My Home Nishada</p>
                      <p className="text-slate-500 text-xs mt-1">Visited last Saturday</p>
                    </div>
                  </div>
                )}

                {/* Review Rating */}
                {currentStep === "review_rating" && (
                  <div className="space-y-5 animate-in fade-in duration-500 text-center py-4">
                    <h3 className="text-lg font-medium text-slate-800">Rate Your Experience</h3>
                    <div className="flex justify-center gap-2 py-4">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={cn("size-10 transition-all", star <= reviewRating ? "text-[#475569] fill-[#475569]" : "text-slate-300")}
                        />
                      ))}
                    </div>
                    {reviewRating > 0 && (
                      <p className="text-[#475569] font-medium text-lg">
                        {reviewRating}/5 — {reviewRating >= 4 ? "Excellent!" : reviewRating >= 3 ? "Good" : "Could be better"}
                      </p>
                    )}
                  </div>
                )}

                {/* Review Comments */}
                {currentStep === "review_comments" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="text-center py-2">
                      <div className="flex justify-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={cn("size-6", star <= reviewRating ? "text-[#475569] fill-[#475569]" : "text-slate-300")} />
                        ))}
                      </div>
                      <h3 className="text-lg font-medium text-slate-800">Your Feedback</h3>
                    </div>
                    {reviewComment && (
                      <div className="bg-[#475569]/20 rounded-2xl p-4">
                        <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Comment</p>
                        <p className="text-slate-700 text-sm italic">"{reviewComment}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Complete */}
                {currentStep === "review_complete" && (
                  <div className="space-y-5 animate-in fade-in duration-500 text-center py-4">
                    <div className="size-16 rounded-full bg-[#475569]/20 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="size-9 text-[#475569]" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-800">Thank You!</h3>
                    <div className="bg-[#475569]/20 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={cn("size-5", star <= reviewRating ? "text-[#475569] fill-[#475569]" : "text-slate-300")} />
                        ))}
                      </div>
                      {reviewComment && <p className="text-slate-500 text-sm">"{reviewComment}"</p>}
                    </div>
                    <div className="bg-[#475569] rounded-2xl p-4 text-white">
                      <p className="font-medium text-sm">Priority access to My Home Grava added to your profile</p>
                      <p className="text-white/80 text-xs mt-1">Finance advisor call scheduled for tomorrow at 11 AM</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lead Profile Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-3">Lead Profile</p>
              {leadProfile.name ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#475569] flex items-center justify-center text-white font-medium shadow-sm">
                      {leadProfile.name[0]}
                    </div>
                    <div>
                      <p className="text-slate-800 font-medium">{leadProfile.name}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {leadProfile.bhk && <span className="text-xs text-slate-500">{leadProfile.bhk}</span>}
                        {leadProfile.budget && <span className="text-xs text-slate-500">· {leadProfile.budget}</span>}
                      </div>
                    </div>
                    {leadProfile.score && (
                      <span className={cn("ml-auto text-xs px-2.5 py-1 rounded-full font-medium", getScoreColor(leadProfile.score))}>
                        {leadProfile.score}
                      </span>
                    )}
                  </div>
                  {leadProfile.location && (
                    <div className="text-sm text-slate-500 pl-1 flex items-center gap-1">
                      <MapPin className="size-3.5 text-[#475569]" />
                      {leadProfile.location}
                    </div>
                  )}
                  {leadProfile.timeline && (
                    <div className="text-sm text-slate-500 pl-1 flex items-center gap-1">
                      <Clock className="size-3.5 text-[#475569]" />
                      Timeline: {leadProfile.timeline}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">New Enquiry</p>
                    <p className="text-slate-500 text-xs">Profile will be built during call</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
