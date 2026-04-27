"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { Orb, type AgentState } from "@/components/ui/orb";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Bath,
  Sofa,
  Home,
  Loader2,
  Volume2,
  VolumeX,
  Star,
  MessageSquare,
  AlertCircle,
  Languages,
  BarChart3,
  Bell,
  Sunrise,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type DemoType = "booking" | "out_of_service" | "feedback" | "language_switch";

type LangCode = "en" | "te" | "hi";

type LangInfo = {
  code: LangCode;
  label: string;
  nativeLabel: string;
  flag: string;
};

const LANGUAGES: Record<LangCode, LangInfo> = {
  en: { code: "en", label: "English", nativeLabel: "English", flag: "EN" },
  te: { code: "te", label: "Telugu", nativeLabel: "తెలుగు", flag: "TE" },
  hi: { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "HI" },
};

type BookingStep =
  | "idle"
  | "greeting"
  | "service_selection"
  | "quantity_selection"
  | "time_of_day_selection"
  | "slot_selection"
  | "confirmation"
  | "payment"
  | "success"
  | "out_of_area"
  | "collecting_preferences"
  | "feedback_intro"
  | "feedback_rating"
  | "feedback_comments"
  | "feedback_complete"
  | "language_intro"
  | "language_switching"
  | "language_saved";

type Service = {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: number;
  selected?: boolean;
};

type TimeOfDay = "morning" | "afternoon" | "evening";

type TimeSlot = {
  date: string;
  time: string;
  period: TimeOfDay;
  available: boolean;
};

type PeriodInfo = {
  id: TimeOfDay;
  label: string;
  range: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SERVICES: Service[] = [
  { id: "bathroom", name: "Bathroom Cleaning", icon: <Bath className="size-6" />, price: 500 },
  { id: "deep", name: "Deep Cleaning", icon: <Sparkles className="size-6" />, price: 1500 },
  { id: "sofa", name: "Sofa Cleaning", icon: <Sofa className="size-6" />, price: 800 },
  { id: "home", name: "Full Home Cleaning", icon: <Home className="size-6" />, price: 2500 },
];

const PERIODS: PeriodInfo[] = [
  { id: "morning", label: "Morning", range: "8 AM – 12 PM", icon: Sunrise },
  { id: "afternoon", label: "Afternoon", range: "12 PM – 5 PM", icon: Sun },
  { id: "evening", label: "Evening", range: "5 PM – 8 PM", icon: Moon },
];

const TIME_SLOTS: TimeSlot[] = [
  { date: "Apr 28, 2026", time: "9:00 AM", period: "morning", available: true },
  { date: "Apr 28, 2026", time: "10:00 AM", period: "morning", available: false },
  { date: "Apr 28, 2026", time: "11:00 AM", period: "morning", available: true },
  { date: "Apr 28, 2026", time: "12:00 PM", period: "afternoon", available: true },
  { date: "Apr 28, 2026", time: "2:00 PM", period: "afternoon", available: true },
  { date: "Apr 28, 2026", time: "4:00 PM", period: "afternoon", available: false },
  { date: "Apr 28, 2026", time: "5:00 PM", period: "evening", available: true },
  { date: "Apr 28, 2026", time: "6:30 PM", period: "evening", available: true },
  { date: "Apr 28, 2026", time: "7:30 PM", period: "evening", available: true },
];

export default function UrbanCleanDemo() {
  const vapiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  const vapiAssistantId = process.env.NEXT_PUBLIC_URBAN_CLEAN_ASSISTANT_ID || "";
  const vapiRef = useRef<Vapi | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const abortSimulationRef = useRef(false);

  const [demoType, setDemoType] = useState<DemoType>("booking");
  const [voiceState, setVoiceState] = useState<"idle" | "connecting" | "listening" | "talking" | "error">("idle");
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [currentStep, setCurrentStep] = useState<BookingStep>("idle");
  const [transcript, setTranscript] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [requestedServices, setRequestedServices] = useState<string[]>([]);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [lastBookingId] = useState("UC847291");
  const [typingText, setTypingText] = useState<{ role: "user" | "assistant"; text: string } | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<LangCode>("en");
  const [languageHistory, setLanguageHistory] = useState<LangCode[]>([]);
  const [savedLanguage, setSavedLanguage] = useState<LangCode | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimeOfDay | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      userAudioRef.current = new Audio();

      if (window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
        const loadVoices = () => {
          const voices = synthRef.current?.getVoices() || [];
          setAvailableVoices(voices);
        };
        loadVoices();
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
    
    return () => {
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
      if (synthRef.current) synthRef.current.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (userAudioRef.current) {
        userAudioRef.current.pause();
        userAudioRef.current = null;
      }
    };
  }, []);

  const getPreferredVoice = useCallback(() => {
    if (availableVoices.length === 0) return null;
    const preferredVoices = ["Samantha", "Karen", "Moira", "Veena", "Google UK English Female"];
    for (const name of preferredVoices) {
      const voice = availableVoices.find(v => v.name.includes(name));
      if (voice) return voice;
    }
    return availableVoices.find(v => v.lang.startsWith("en")) || availableVoices[0];
  }, [availableVoices]);

  const speakWithElevenLabs = useCallback(
    async (
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

        if (!response.ok) {
          console.warn("ElevenLabs unavailable, falling back to browser TTS");
          return false;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        return new Promise((resolve) => {
          if (!ref.current) {
            resolve(false);
            return;
          }

          ref.current.src = audioUrl;

          if (animateOrb) {
            if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
            volumeIntervalRef.current = setInterval(() => {
              setVoiceVolume(0.3 + Math.random() * 0.5);
            }, 80);
          }

          ref.current.onended = () => {
            if (animateOrb) {
              if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
              setVoiceVolume(0);
            }
            URL.revokeObjectURL(audioUrl);
            resolve(true);
          };

          ref.current.onerror = () => {
            if (animateOrb) {
              if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
              setVoiceVolume(0);
            }
            URL.revokeObjectURL(audioUrl);
            resolve(false);
          };

          ref.current.play().catch(() => resolve(false));
        });
      } catch (error) {
        console.warn("ElevenLabs error:", error);
        return false;
      }
    },
    [],
  );

  const speakWithBrowser = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!synthRef.current || isSpeakerMuted) {
        setTimeout(resolve, text.length * 50);
        return;
      }

      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getPreferredVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 1.0;
      utterance.pitch = 1.1;

      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = setInterval(() => {
        setVoiceVolume(0.3 + Math.random() * 0.5);
      }, 100);

      utterance.onend = () => {
        if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
        setVoiceVolume(0);
        resolve();
      };

      utterance.onerror = () => {
        if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
        setVoiceVolume(0);
        resolve();
      };

      synthRef.current.speak(utterance);
    });
  }, [getPreferredVoice, isSpeakerMuted]);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (abortSimulationRef.current) {
      throw new Error("Simulation aborted");
    }

    if (isSpeakerMuted) {
      await new Promise(resolve => setTimeout(resolve, text.length * 40));
      return;
    }

    if (useElevenLabs) {
      const success = await speakWithElevenLabs(text, { role: "assistant" });
      if (success) return;
      setUseElevenLabs(false);
    }

    await speakWithBrowser(text);
  }, [isSpeakerMuted, useElevenLabs, speakWithElevenLabs, speakWithBrowser]);

  const speakAsUser = useCallback(async (text: string): Promise<void> => {
    if (abortSimulationRef.current) {
      throw new Error("Simulation aborted");
    }

    if (isSpeakerMuted) return;

    if (useElevenLabs) {
      const success = await speakWithElevenLabs(text, {
        role: "user",
        animateOrb: false,
      });
      if (success) return;
    }
    // Silent fallback: when ElevenLabs is unavailable we just let the
    // typed message convey the customer's line — no browser TTS to
    // avoid a robotic-sounding male voice over the assistant's voice.
  }, [isSpeakerMuted, useElevenLabs, speakWithElevenLabs]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      userAudioRef.current.currentTime = 0;
    }
    if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
    setVoiceVolume(0);
  }, []);

  const isVoiceConnected = voiceState === "listening" || voiceState === "talking";
  const orbState: AgentState =
    voiceState === "connecting"
      ? "thinking"
      : voiceState === "listening"
        ? "listening"
        : voiceState === "talking"
          ? "talking"
          : null;

  useEffect(() => {
    if (!vapiKey) return;
    const vapi = new Vapi(vapiKey);
    
    vapi.on("call-start", () => {
      setVoiceState("listening");
      setCurrentStep("greeting");
    });
    vapi.on("call-end", () => {
      setVoiceState("idle");
      setVoiceVolume(0);
      setIsMuted(false);
    });
    vapi.on("speech-start", () => setVoiceState("talking"));
    vapi.on("speech-end", () => setVoiceState("listening"));
    vapi.on("volume-level", (volume: number) => setVoiceVolume(volume));
    vapi.on("error", () => setVoiceState("error"));
    
    vapiRef.current = vapi;
    
    return () => {
      void vapi.stop();
      vapiRef.current = null;
    };
  }, [vapiKey]);

  const handleStartVoice = async () => {
    if (demoType === "booking") {
      runBookingSimulation();
    } else if (demoType === "out_of_service") {
      runOutOfServiceSimulation();
    } else if (demoType === "feedback") {
      runFeedbackSimulation();
    } else if (demoType === "language_switch") {
      runLanguageSwitchSimulation();
    }
  };

  const handleEndVoice = async () => {
    // Set abort flag to stop simulation immediately
    abortSimulationRef.current = true;
    
    if (isSimulating) {
      setIsSimulating(false);
      resetDemo();
      return;
    }
    if (vapiRef.current && isVoiceConnected) {
      await vapiRef.current.stop();
    }
    resetDemo();
  };

  const handleToggleMute = () => {
    if (!vapiRef.current || !isVoiceConnected) return;
    vapiRef.current.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const resetDemo = () => {
    stopSpeaking();
    setVoiceState("idle");
    setVoiceVolume(0);
    setCurrentStep("idle");
    setTranscript([]);
    setTypingText(null);
    setSelectedService(null);
    setQuantity(1);
    setSelectedSlot(null);
    setBookingId("");
    setCustomerName("");
    setCustomerAddress("");
    setRequestedServices([]);
    setFeedbackRating(0);
    setFeedbackComment("");
    setActiveLanguage("en");
    setLanguageHistory([]);
    setSavedLanguage(null);
    setSelectedPeriod(null);
  };

  // Helper function to calculate user "speaking" time based on text length
  const getUserSpeakTime = (text: string) => {
    const words = text.split(' ').length;
    return Math.max(1500, words * 300); // ~300ms per word, minimum 1.5s
  };

  // Type and speak simultaneously for assistant
  const speakAndType = async (text: string) => {
    await Promise.all([
      speak(text),
      typeText("assistant", text, 50) // Type slightly slower to match speech
    ]);
  };

  // Type user message AND speak it with the male customer voice
  const typeUserMessage = async (text: string) => {
    await Promise.all([
      speakAsUser(text),
      typeText("user", text, 55),
    ]);
  };

  // ==================== BOOKING SIMULATION (Happy Path) ====================
  const runBookingSimulation = async () => {
    abortSimulationRef.current = false;
    setIsSimulating(true);
    setVoiceState("connecting");

    try {
    await delay(1500);

    // Step 1: Short, focused greeting — no name asked yet
    setVoiceState("talking");
    setCurrentStep("greeting");
    await speakAndType("Hi! I'm Priya from Urban Klean. How can I help you today?");

    setVoiceState("listening");
    await delay(1500);
    await typeUserMessage("Hi, I need a bathroom cleaning");

    // Step 2: Jump straight to quantity — bathroom already heard
    setSelectedService(SERVICES[0]);
    await delay(500);
    setVoiceState("talking");
    setCurrentStep("quantity_selection");
    await speakAndType("Sure! Bathroom cleaning is 500 rupees per bathroom. How many bathrooms would you like us to clean?");

    setVoiceState("listening");
    await delay(1500);
    await typeUserMessage("2 bathrooms");
    setQuantity(2);

    // Step 3: Quick price summary, then ask period
    await delay(500);
    const total = 500 * 2;
    const gst = Math.round(total * 0.18);
    const grandTotal = total + gst;
    setVoiceState("talking");
    setCurrentStep("time_of_day_selection");
    await speakAndType(`Got it — 2 bathrooms, that comes to ${grandTotal} rupees including GST. What time of day works best for you — morning, afternoon, or evening?`);

    setVoiceState("listening");
    await delay(1800);
    await typeUserMessage("Morning works best");
    setSelectedPeriod("morning");

    // Step 4: Show only morning slots
    await delay(500);
    setVoiceState("talking");
    setCurrentStep("slot_selection");
    await speakAndType("Perfect! Here are tomorrow's morning slots. 9 AM and 11 AM are open — 10 AM is already booked. Which one would you prefer?");

    setVoiceState("listening");
    await delay(2000);
    await typeUserMessage("11 AM please");
    setSelectedSlot(TIME_SLOTS[2]); // 11:00 AM morning slot

    // Step 5: Now ask for name + flat (only when needed)
    await delay(500);
    setVoiceState("talking");
    await speakAndType("Locked in for tomorrow at 11 AM. Could you share your name and flat details for the booking?");

    setVoiceState("listening");
    await delay(2000);
    await typeUserMessage("Ajinkya, Block 1, Flat 1101, My Home Mangala, Kondapur");
    setCustomerName("Ajinkya");
    setCustomerAddress("Block 1, Flat 1101, My Home Mangala, Kondapur");

    // Step 6: Confirmation summary
    await delay(500);
    setVoiceState("talking");
    setCurrentStep("confirmation");
    await speakAndType(`Thanks Ajinkya ji! Quick recap on your screen: 2 bathrooms tomorrow at 11 AM, total ${grandTotal} rupees, at My Home Mangala. Shall I confirm?`);

    setVoiceState("listening");
    await delay(2000);
    await typeUserMessage("Yes, confirmed");

    // Step 7: Payment
    await delay(500);
    setVoiceState("talking");
    setCurrentStep("payment");
    await speakAndType("Wonderful! I've sent the payment link to your WhatsApp. Just a moment while it processes.");
    
    setVoiceState("listening");
    await delay(4000);
    
    const newBookingId = `UC${Date.now().toString().slice(-6)}`;
    setBookingId(newBookingId);
    setCurrentStep("success");

    const bookedSlot = TIME_SLOTS[2]; // 11:00 AM morning slot
    await delay(500);
    setVoiceState("talking");
    await speakAndType(`Payment received! Your booking is confirmed — our Sevak will arrive tomorrow at ${bookedSlot.time}. You'll get a WhatsApp reminder an hour before. Anything else I can help you with?`);
    
    setVoiceState("listening");
    await delay(1500);
    await typeUserMessage("No, that's all. Thank you!");
    
    await delay(500);
    setVoiceState("talking");
    await speakAndType("You're most welcome! We appreciate your trust in Urban Clean. Have a wonderful day!");
    
    await delay(2000);
    setVoiceState("idle");
    setIsSimulating(false);
    } catch {
      console.log("Simulation ended by user");
    }
  };

  // ==================== OUT OF SERVICE SIMULATION ====================
  const runOutOfServiceSimulation = async () => {
    abortSimulationRef.current = false;
    setIsSimulating(true);
    setVoiceState("connecting");
    
    try {
    await delay(1500);
    
    setVoiceState("talking");
    setCurrentStep("greeting");
    await speakAndType("Hi! I'm Priya from Urban Klean — your friendly home-care helper. How can I assist you today?");
    
    setVoiceState("listening");
    await delay(1500);
    await typeUserMessage("Hi, I want to book a deep cleaning service");
    
    await delay(500);
    setVoiceState("talking");
    await speakAndType("Sure, I'd love to help! May I know your name please?");
    
    setVoiceState("listening");
    await delay(1000);
    await typeUserMessage("I'm Ajinkya");
    setCustomerName("Ajinkya");
    
    await delay(500);
    setVoiceState("talking");
    await speakAndType("Nice to meet you Ajinkya! Could you share your address so I can check service availability?");
    
    setVoiceState("listening");
    await delay(2000);
    await typeUserMessage("Tower B, Flat 2304, GHR Titania, Gachibowli");
    setCustomerAddress("Tower B, Flat 2304, GHR Titania, Gachibowli");
    
    await delay(800);
    setCurrentStep("out_of_area");
    setVoiceState("talking");
    await speakAndType("I appreciate your interest Ajinkya! Unfortunately, we're not yet servicing the GHR Titania area in Gachibowli. But don't worry, we're expanding soon! To help us prioritize, could you tell me which services you would like in your community?");
    
    setVoiceState("listening");
    await delay(2000);
    await typeUserMessage("I would really want deep cleaning and bathroom cleaning services");
    setRequestedServices(["Deep Cleaning", "Bathroom Cleaning"]);
    
    await delay(500);
    setCurrentStep("collecting_preferences");
    setVoiceState("talking");
    await speakAndType("Thank you for sharing that! I've noted your interest in Deep Cleaning and Bathroom Cleaning. Are there any other services you'd like us to offer in your area?");
    
    setVoiceState("listening");
    await delay(2000);
    await typeUserMessage("Maybe sofa cleaning as well, that would be helpful");
    setRequestedServices(prev => [...prev, "Sofa Cleaning"]);
    
    await delay(500);
    setVoiceState("talking");
    await speakAndType("Perfect! I've recorded your preferences for Deep Cleaning, Bathroom Cleaning, and Sofa Cleaning. Our team is working hard to expand to your area. We'll notify you as soon as we start servicing GHR Titania. Is there anything else I can help you with?");
    
    setVoiceState("listening");
    await delay(1500);
    await typeUserMessage("No, that's it. Thanks for the information!");
    
    await delay(500);
    setVoiceState("talking");
    await speakAndType("You're welcome Ajinkya! Thank you for your interest in Urban Clean. We truly value your feedback and will reach out soon. Have a great day!");
    
    await delay(2000);
    setVoiceState("idle");
    setIsSimulating(false);
    } catch {
      console.log("Simulation ended by user");
    }
  };

  // ==================== FEEDBACK SIMULATION ====================
  const runFeedbackSimulation = async () => {
    abortSimulationRef.current = false;
    setIsSimulating(true);
    setVoiceState("connecting");
    setCustomerName("Ajinkya");
    
    try {
    await delay(1500);
    
    setCurrentStep("feedback_intro");
    setVoiceState("talking");
    await speakAndType("Hi Ajinkya ji! This is Priya from Urban Klean. I'm calling to check on your bathroom cleaning service which you had on Saturday at 11 AM. Do you have a moment to share your feedback?");
    
    setVoiceState("listening");
    await delay(1500);
    await typeUserMessage("Yes, sure. I have a few minutes");
    
    await delay(500);
    setCurrentStep("feedback_rating");
    setVoiceState("talking");
    await speakAndType("Wonderful! On a scale of 1 to 5, where 5 is excellent, how would you rate your overall experience with our cleaning service?");
    
    setVoiceState("listening");
    await delay(2000);
    await typeUserMessage("I would give it a 4 out of 5");
    setFeedbackRating(4);
    
    await delay(500);
    setVoiceState("talking");
    await speakAndType("Thank you! A 4 out of 5 is great feedback. We're always striving to improve. Could you share what we could do better to earn that 5th star?");
    
    setVoiceState("listening");
    await delay(2000);
    setCurrentStep("feedback_comments");
    await typeUserMessage("The cleaning was thorough but the team arrived about 15 minutes late. Otherwise everything was perfect");
    setFeedbackComment("Team arrived 15 minutes late. Otherwise service was perfect.");
    
    await delay(500);
    setVoiceState("talking");
    await speakAndType("I really appreciate you sharing that Ajinkya. Punctuality is very important to us, and I'll make sure this feedback reaches our operations team. We'll work on improving our arrival times.");
    
    await delay(300);
    await speakAndType("Is there anything else you'd like to share about your experience?");
    
    setVoiceState("listening");
    await delay(1500);
    await typeUserMessage("No, that's all. The cleaning quality was really good though");
    
    await delay(500);
    setCurrentStep("feedback_complete");
    setVoiceState("talking");
    await speakAndType("That's wonderful to hear! Your feedback has been recorded and will help us serve you better. As a thank you, we've added a 10% discount to your account for your next booking. Thank you for choosing Urban Clean, Ajinkya!");
    
    setVoiceState("listening");
    await delay(1500);
    await typeUserMessage("Oh that's nice! Thank you!");
    
    await delay(500);
    setVoiceState("talking");
    await speakAndType("You're welcome! Have a great day, and we look forward to serving you again soon!");
    
    await delay(2000);
    setVoiceState("idle");
    setIsSimulating(false);
    } catch {
      console.log("Simulation ended by user");
    }
  };

  // ==================== MULTI-LANGUAGE SWITCH SIMULATION ====================
  const runLanguageSwitchSimulation = async () => {
    abortSimulationRef.current = false;
    setIsSimulating(true);
    setVoiceState("connecting");
    setActiveLanguage("en");
    setLanguageHistory(["en"]);
    setSavedLanguage(null);

    try {
      await delay(1500);

      setCurrentStep("language_intro");
      setVoiceState("talking");
      await speakAndType(
        "Hi! I'm Priya from Urban Klean — your friendly home-care helper. How can I assist you today?"
      );

      setVoiceState("listening");
      await delay(1500);
      await typeUserMessage("Hi, I want to book a deep cleaning service");

      await delay(500);
      setVoiceState("talking");
      await speakAndType(
        "Sure! May I know your name and address please?"
      );

      setVoiceState("listening");
      await delay(2000);
      await typeUserMessage(
        "I'm Ajinkya. Block 1, Flat 1207, My Home Mangala. Also, can you please talk to me in Telugu?"
      );
      setCustomerName("Ajinkya");
      setCustomerAddress("Block 1, Flat 1207, My Home Mangala");

      await delay(800);
      setCurrentStep("language_switching");
      setActiveLanguage("te");
      setLanguageHistory((prev) => [...prev, "te"]);
      setVoiceState("talking");
      // Speak in Telugu via ElevenLabs multilingual model
      await speakAndType(
        "తప్పకుండా అజింక్యా గారు! నేను ఇప్పుడు తెలుగులో మాట్లాడుతున్నాను. మీకు ఏ రోజు, ఏ సమయంలో డీప్ క్లీనింగ్ కావాలి?"
      );

      setVoiceState("listening");
      await delay(2500);
      await typeUserMessage(
        "Actually, please continue in Hindi, that's easier for me"
      );

      await delay(800);
      setActiveLanguage("hi");
      setLanguageHistory((prev) => [...prev, "hi"]);
      setVoiceState("talking");
      // Speak in Hindi
      await speakAndType(
        "बिल्कुल अजिंक्या जी! मैं अब हिंदी में बात करूंगी। क्या आप कल सुबह 11 बजे का स्लॉट लेना चाहेंगे? डीप क्लीनिंग की कीमत 1500 रुपये है।"
      );

      setVoiceState("listening");
      await delay(2000);
      await typeUserMessage("Yes, tomorrow 11 AM works for me");
      setSelectedService(SERVICES[1]); // deep cleaning
      setSelectedSlot(TIME_SLOTS[2]); // 11:00 AM morning slot

      await delay(500);
      setVoiceState("talking");
      await speakAndType(
        "ठीक है! आपकी बुकिंग कन्फर्म हो गई है। पेमेंट लिंक भेज रही हूं।"
      );

      await delay(1500);
      setCurrentStep("language_saved");
      setSavedLanguage("hi");
      setVoiceState("talking");
      // Switch back to English for the wrap-up so the user understands the takeaway
      setActiveLanguage("en");
      await speakAndType(
        "Booking confirmed! I've saved Hindi as your preferred language. Next time you call, I'll greet you in Hindi straight away. Have a great day!"
      );

      await delay(2000);
      setVoiceState("idle");
      setIsSimulating(false);
    } catch {
      console.log("Simulation ended by user");
    }
  };

  const delay = (ms: number) => new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (abortSimulationRef.current) {
        reject(new Error("Simulation aborted"));
      } else {
        resolve();
      }
    }, ms);
    
    // Check immediately if already aborted
    if (abortSimulationRef.current) {
      clearTimeout(timeout);
      reject(new Error("Simulation aborted"));
    }
  });

  const addTranscript = (role: "user" | "assistant", text: string) => {
    setTranscript(prev => [...prev, { role, text }]);
    setTypingText(null);
  };

  // Typewriter effect - types text progressively
  const typeText = useCallback(async (role: "user" | "assistant", text: string, speedMs = 30): Promise<void> => {
    if (abortSimulationRef.current) throw new Error("Simulation aborted");
    
    const words = text.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      if (abortSimulationRef.current) throw new Error("Simulation aborted");
      
      currentText += (i === 0 ? '' : ' ') + words[i];
      setTypingText({ role, text: currentText });
      
      // Vary the delay slightly for natural feel
      const delay = speedMs + Math.random() * 20;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // After typing complete, add to permanent transcript
    setTranscript(prev => [...prev, { role, text }]);
    setTypingText(null);
  }, []);

  const calculateTotal = () => {
    if (!selectedService) return { subtotal: 0, gst: 0, total: 0 };
    const subtotal = selectedService.price * quantity;
    const gst = Math.round(subtotal * 0.18);
    return { subtotal, gst, total: subtotal + gst };
  };

  const getDemoTitle = () => {
    switch (demoType) {
      case "booking": return "Happy Path - Booking";
      case "out_of_service": return "Out of Service Area";
      case "feedback": return "Post-Service Feedback";
      case "language_switch": return "Multi-Language Switch";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#6b21a8] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-[#facc15] flex items-center justify-center shadow-md">
              <span className="text-[#6b21a8] font-black text-sm">UK</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">URBAN KLEAN</h1>
              <p className="text-xs text-white/80">AI Voice Booking</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Cross-page navigation */}
            <div className="flex bg-white/10 rounded-full p-0.5 mr-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#facc15] text-[#6b21a8]">
                Voice Demo
              </span>
              <Link
                href="/demo/urban-clean/triggers"
                className="px-3 py-1 rounded-full text-xs font-medium text-white/70 hover:text-white flex items-center gap-1"
              >
                <Bell className="size-3" />
                Triggers
              </Link>
              <Link
                href="/demo/urban-clean/analytics"
                className="px-3 py-1 rounded-full text-xs font-medium text-white/70 hover:text-white flex items-center gap-1"
              >
                <BarChart3 className="size-3" />
                Analytics
              </Link>
            </div>

            {/* Demo Type Selector */}
            <div className="flex bg-white/10 rounded-full p-0.5">
              <button
                onClick={() => { resetDemo(); setDemoType("booking"); }}
                disabled={isSimulating}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all",
                  demoType === "booking" ? "bg-[#facc15] text-[#6b21a8]" : "text-white/70 hover:text-white"
                )}
              >
                Booking
              </button>
              <button
                onClick={() => { resetDemo(); setDemoType("out_of_service"); }}
                disabled={isSimulating}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all",
                  demoType === "out_of_service" ? "bg-[#facc15] text-[#6b21a8]" : "text-white/70 hover:text-white"
                )}
              >
                Out of Area
              </button>
              <button
                onClick={() => { resetDemo(); setDemoType("feedback"); }}
                disabled={isSimulating}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all",
                  demoType === "feedback" ? "bg-[#facc15] text-[#6b21a8]" : "text-white/70 hover:text-white"
                )}
              >
                Feedback
              </button>
              <button
                onClick={() => { resetDemo(); setDemoType("language_switch"); }}
                disabled={isSimulating}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1",
                  demoType === "language_switch" ? "bg-[#facc15] text-[#6b21a8]" : "text-white/70 hover:text-white"
                )}
              >
                <Languages className="size-3" />
                Language
              </button>
            </div>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium ml-2",
              isVoiceConnected ? "bg-[#facc15] text-[#6b21a8]" : "bg-white/10 text-white/70"
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
              <h2 className="text-xl font-semibold text-gray-800">Voice Assistant</h2>
              <p className="text-sm text-gray-500">
                {demoType === "booking" && "Complete booking flow with payment"}
                {demoType === "out_of_service" && "Area not serviceable - collecting preferences"}
                {demoType === "feedback" && "Post-service feedback collection"}
                {demoType === "language_switch" && "Live language switching: English → Telugu → Hindi"}
              </p>
            </div>

            {/* About Priya — persona card */}
            <div className="bg-white rounded-2xl shadow-sm p-4 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="size-12 rounded-full bg-gradient-to-br from-[#facc15] to-[#f59e0b] flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-[#6b21a8] font-black text-lg">P</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-800">Priya</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-[#6b21a8] font-medium">
                      AI · Urban Klean
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-green-600">
                      <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                      Online 24×7
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your friendly home-care helper. Hyderabad-based, knows your community.
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-medium flex items-center gap-1">
                      <Languages className="size-2.5" />
                      EN · हिन्दी · తెలుగు
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-[#6b21a8] font-medium flex items-center gap-1">
                      <MapPin className="size-2.5" />
                      8,000+ homes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Orb - No box around it */}
            <div className="aspect-square max-w-[340px] mx-auto relative">
              <Orb
                className="h-full w-full"
                colors={["#facc15", "#a855f7"]}
                agentState={orbState}
                volumeMode="manual"
                manualInput={voiceVolume}
                manualOutput={voiceVolume}
              />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="inline-block px-4 py-2 bg-[#6b21a8]/80 backdrop-blur-sm rounded-full text-sm text-white">
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
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-6 border-gray-200 text-gray-400"
                    disabled
                  >
                    <Phone className="size-4 mr-2" />
                    Start
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-4 border-gray-200"
                    onClick={handleToggleMute}
                  >
                    {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "rounded-full px-4 border-gray-200",
                      isSpeakerMuted && "bg-red-50 border-red-200 text-red-500"
                    )}
                    onClick={() => {
                      setIsSpeakerMuted(!isSpeakerMuted);
                      if (!isSpeakerMuted) stopSpeaking();
                    }}
                  >
                    {isSpeakerMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                  </Button>
                  <Button
                    size="lg"
                    className="rounded-full px-6 bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleEndVoice}
                  >
                    <PhoneOff className="size-4 mr-2" />
                    End
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button
                    className="w-full max-w-sm rounded-full bg-[#facc15] hover:bg-[#eab308] text-gray-900 font-semibold h-12 text-base shadow-sm"
                    onClick={handleStartVoice}
                    disabled={voiceState === "connecting"}
                  >
                    {voiceState === "connecting" ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Phone className="size-4 mr-2" />
                        Start Conversation
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Transcript */}
              {(transcript.length > 0 || typingText) && (
                <div className="max-h-44 overflow-y-auto space-y-2 bg-white rounded-2xl p-4 shadow-sm">
                  {transcript.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "text-sm p-3 rounded-2xl",
                        msg.role === "assistant"
                          ? "bg-purple-50 text-gray-700"
                          : "bg-yellow-50 text-gray-700 ml-6"
                      )}
                    >
                      <span className="font-medium text-gray-900">{msg.role === "assistant" ? "Priya: " : "You: "}</span>
                      {msg.text}
                    </div>
                  ))}
                  {/* Currently typing message */}
                  {typingText && (
                    <div
                      className={cn(
                        "text-sm p-3 rounded-2xl",
                        typingText.role === "assistant"
                          ? "bg-purple-50 text-gray-700"
                          : "bg-yellow-50 text-gray-700 ml-6"
                      )}
                    >
                      <span className="font-medium text-gray-900">{typingText.role === "assistant" ? "Priya: " : "You: "}</span>
                      {typingText.text}
                      <span className="animate-pulse">|</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Visual Display */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Booking Display</h2>
                <p className="text-sm text-gray-500">Visual elements shown during the call</p>
              </div>

              <div className="p-5 min-h-[480px]">
                {/* Idle State */}
                {currentStep === "idle" && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="size-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <Phone className="size-6 text-purple-400" />
                    </div>
                    <p className="text-gray-400 text-sm">Start a conversation to see the booking flow</p>
                  </div>
                )}

                {/* Greeting */}
                {currentStep === "greeting" && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-8">
                      <div className="size-16 rounded-full bg-[#facc15] flex items-center justify-center mx-auto mb-4 shadow-md">
                        <span className="text-[#6b21a8] font-black text-xl">UK</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Welcome to Urban Klean</h3>
                      <p className="text-gray-500 text-sm">Tell Priya what you need — she's listening</p>
                    </div>
                  </div>
                )}

                {/* Service Selection */}
                {currentStep === "service_selection" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <h3 className="text-base font-semibold text-gray-800">Select a Service</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {SERVICES.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={cn(
                            "p-4 rounded-2xl border transition-all text-left",
                            selectedService?.id === service.id
                              ? "border-[#facc15] bg-yellow-50 shadow-sm"
                              : "border-gray-200 bg-white hover:border-purple-200"
                          )}
                        >
                          <div className="text-[#6b21a8] mb-2">{service.icon}</div>
                          <p className="text-gray-800 font-medium text-sm">{service.name}</p>
                          <p className="text-[#6b21a8] text-base font-semibold mt-1">₹{service.price}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selection */}
                {currentStep === "quantity_selection" && selectedService && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="bg-purple-50 rounded-2xl p-4">
                      <p className="text-[#6b21a8] text-xs uppercase tracking-wide mb-1">Selected Service</p>
                      <p className="text-gray-800 font-semibold">{selectedService.name}</p>
                      <p className="text-gray-500 text-sm">₹{selectedService.price} per unit</p>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 mb-4">Select Quantity</h3>
                      <div className="flex items-center gap-4 justify-center py-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="size-11 rounded-full bg-purple-100 text-[#6b21a8] text-xl hover:bg-purple-200 transition-colors font-medium"
                        >
                          −
                        </button>
                        <span className="text-3xl font-semibold text-gray-800 w-14 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="size-11 rounded-full bg-purple-100 text-[#6b21a8] text-xl hover:bg-purple-200 transition-colors font-medium"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#facc15] rounded-2xl p-4 text-center mt-4">
                      <p className="text-gray-700 text-xs uppercase tracking-wide">Estimated Total</p>
                      <p className="text-2xl font-bold text-gray-900">₹{calculateTotal().total}</p>
                      <p className="text-gray-600 text-xs">(incl. 18% GST)</p>
                    </div>
                  </div>
                )}

                {/* Time of Day Preference */}
                {currentStep === "time_of_day_selection" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="bg-purple-50 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[#6b21a8] text-xs uppercase tracking-wide">Booking</p>
                        <p className="text-gray-800 font-medium text-sm">
                          {quantity}× Bathroom Cleaning
                        </p>
                      </div>
                      <p className="text-[#6b21a8] font-semibold text-lg">
                        ₹{calculateTotal().total}
                      </p>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">
                      When works best for you?
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {PERIODS.map((p) => {
                        const Icon = p.icon;
                        const isActive = selectedPeriod === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPeriod(p.id)}
                            className={cn(
                              "flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all",
                              isActive
                                ? "border-[#facc15] bg-yellow-50"
                                : "border-gray-200 bg-white hover:border-purple-200",
                            )}
                          >
                            <Icon
                              className={cn(
                                "size-7",
                                isActive ? "text-[#6b21a8]" : "text-gray-500",
                              )}
                            />
                            <p className="text-gray-800 font-medium text-sm">{p.label}</p>
                            <p className="text-gray-400 text-[11px]">{p.range}</p>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-center text-gray-400 text-xs">
                      Just say morning, afternoon, or evening
                    </p>
                  </div>
                )}

                {/* Slot Selection — filtered by chosen period */}
                {currentStep === "slot_selection" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="size-4 text-[#6b21a8]" />
                        Available Slots
                      </h3>
                      {selectedPeriod && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-[#6b21a8] font-medium capitalize">
                          {selectedPeriod}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {TIME_SLOTS.filter(
                        (s) => !selectedPeriod || s.period === selectedPeriod,
                      ).map((slot, i) => (
                        <button
                          key={i}
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            "p-3 rounded-xl border transition-all text-left",
                            !slot.available
                              ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                              : selectedSlot === slot
                                ? "border-[#facc15] bg-yellow-50"
                                : "border-gray-200 bg-white hover:border-purple-200",
                          )}
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <Clock className="size-3.5 text-[#6b21a8]" />
                            <span className="text-gray-800 text-sm font-medium">{slot.time}</span>
                          </div>
                          <p className="text-gray-400 text-xs">{slot.date}</p>
                          {!slot.available && (
                            <span className="text-red-400 text-xs">Booked</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirmation */}
                {currentStep === "confirmation" && selectedService && selectedSlot && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <h3 className="text-base font-semibold text-gray-800">Confirm Your Booking</h3>
                    <div className="rounded-2xl divide-y divide-gray-100 border border-gray-200 overflow-hidden">
                      <div className="p-4 bg-white">
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Service</p>
                        <p className="text-gray-800 font-medium">{quantity}x {selectedService.name}</p>
                      </div>
                      <div className="p-4 bg-white">
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Date & Time</p>
                        <p className="text-gray-800 font-medium">{selectedSlot.date} at {selectedSlot.time}</p>
                      </div>
                      <div className="p-4 bg-white">
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Address</p>
                        <p className="text-gray-700 text-sm">{customerAddress}</p>
                      </div>
                      <div className="p-4 bg-yellow-50">
                        <div className="flex justify-between text-gray-500 text-sm">
                          <span>Subtotal</span>
                          <span>₹{calculateTotal().subtotal}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-sm mt-1">
                          <span>GST (18%)</span>
                          <span>₹{calculateTotal().gst}</span>
                        </div>
                        <div className="flex justify-between text-gray-800 font-semibold text-lg mt-3 pt-3 border-t border-yellow-200">
                          <span>Total</span>
                          <span className="text-[#6b21a8]">₹{calculateTotal().total}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-gray-400 text-sm">Say "Confirm" to proceed</p>
                  </div>
                )}

                {/* Payment */}
                {currentStep === "payment" && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-4">
                      <div className="size-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="size-7 text-[#6b21a8]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Complete Payment</h3>
                      <p className="text-gray-500 text-sm">Amount: <span className="font-semibold text-[#6b21a8]">₹{calculateTotal().total}</span></p>
                    </div>
                    <div className="bg-[#6b21a8] rounded-2xl p-5 text-center">
                      <p className="text-white/70 text-xs uppercase tracking-wide mb-2">Payment Link</p>
                      <div className="bg-white/10 rounded-xl p-3 mb-4">
                        <p className="text-white font-mono text-sm break-all">
                          pay.urbanklean.in/book/{Date.now().toString().slice(-6)}
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 text-[#facc15] animate-spin" />
                        <span className="text-white/90 text-sm">Waiting for payment...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success */}
                {currentStep === "success" && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-4">
                      <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="size-9 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Booking Confirmed!</h3>
                      <p className="text-[#6b21a8] font-mono font-semibold">#{bookingId || `UC${Date.now().toString().slice(-6)}`}</p>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Service</span>
                        <span className="text-gray-800 font-medium">{quantity}x {selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date & Time</span>
                        <span className="text-gray-800 font-medium">{selectedSlot?.date} at {selectedSlot?.time}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-purple-100">
                        <span className="text-gray-500">Amount Paid</span>
                        <span className="text-green-600 font-semibold">₹{calculateTotal().total}</span>
                      </div>
                    </div>
                    <p className="text-center text-gray-400 text-sm">
                      Our team will arrive at the scheduled time. Thank you!
                    </p>
                  </div>
                )}

                {/* Out of Area */}
                {currentStep === "out_of_area" && (
                  <div className="space-y-4 animate-in fade-in duration-500 text-center py-4">
                    <div className="size-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="size-7 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Service Not Available Yet</h3>
                    <p className="text-gray-500 text-sm">We're not yet servicing <span className="font-medium">GHR Titania, Gachibowli</span></p>
                    <div className="bg-amber-50 rounded-2xl p-4 mt-4 text-left">
                      <p className="text-gray-600 text-xs uppercase tracking-wide mb-2">We're expanding soon!</p>
                      <p className="text-gray-500 text-sm">Tell us which services you'd like in your area.</p>
                    </div>
                  </div>
                )}

                {/* Collecting Preferences */}
                {currentStep === "collecting_preferences" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="text-center py-2">
                      <h3 className="text-lg font-semibold text-gray-800">Preferences Recorded</h3>
                      <p className="text-gray-500 text-sm">Thank you for your feedback!</p>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-4">
                      <p className="text-[#6b21a8] text-xs uppercase tracking-wide mb-3">Services You Want</p>
                      <div className="flex flex-wrap gap-2">
                        {requestedServices.map((s) => (
                          <span key={s} className="px-3 py-1.5 bg-white text-[#6b21a8] rounded-full text-sm border border-purple-200 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-2xl p-4 text-center">
                      <p className="text-gray-600 text-sm">We'll notify you when we start servicing your area!</p>
                    </div>
                  </div>
                )}

                {/* Feedback Intro */}
                {currentStep === "feedback_intro" && (
                  <div className="space-y-5 animate-in fade-in duration-500 text-center py-4">
                    <div className="size-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="size-8 text-[#6b21a8]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Feedback Call</h3>
                    <div className="bg-purple-50 rounded-2xl p-4">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Previous Booking</p>
                      <p className="text-[#6b21a8] font-mono font-semibold">#{lastBookingId}</p>
                      <p className="text-gray-500 text-sm mt-2">Bathroom Cleaning Service</p>
                    </div>
                  </div>
                )}

                {/* Feedback Rating */}
                {currentStep === "feedback_rating" && (
                  <div className="space-y-5 animate-in fade-in duration-500 text-center py-4">
                    <h3 className="text-lg font-semibold text-gray-800">Rate Your Experience</h3>
                    <div className="flex justify-center gap-2 py-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "size-10 transition-all",
                            star <= feedbackRating 
                              ? "text-[#facc15] fill-[#facc15]" 
                              : "text-gray-200"
                          )}
                        />
                      ))}
                    </div>
                    {feedbackRating > 0 && (
                      <p className="text-[#6b21a8] font-semibold text-lg">
                        {feedbackRating}/5 - {feedbackRating >= 4 ? "Great!" : feedbackRating >= 3 ? "Good" : "Thanks for feedback"}
                      </p>
                    )}
                  </div>
                )}

                {/* Feedback Comments */}
                {currentStep === "feedback_comments" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="text-center py-2">
                      <div className="flex justify-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "size-6",
                              star <= feedbackRating 
                                ? "text-[#facc15] fill-[#facc15]" 
                                : "text-gray-200"
                            )}
                          />
                        ))}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Your Feedback</h3>
                    </div>
                    {feedbackComment && (
                      <div className="bg-purple-50 rounded-2xl p-4">
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Comment</p>
                        <p className="text-gray-700 text-sm italic">"{feedbackComment}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Language Intro */}
                {currentStep === "language_intro" && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-2">
                      <div className="size-16 rounded-full bg-[#facc15] flex items-center justify-center mx-auto mb-3 shadow-md">
                        <Languages className="size-8 text-[#6b21a8]" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Multi-Language AI</h3>
                      <p className="text-gray-500 text-sm">Speaks 33+ languages. Switches mid-call.</p>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-4">
                      <p className="text-[#6b21a8] text-xs uppercase tracking-wide mb-3">Currently speaking</p>
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-white border-2 border-[#6b21a8] flex items-center justify-center font-bold text-[#6b21a8]">
                          {LANGUAGES[activeLanguage].flag}
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium">{LANGUAGES[activeLanguage].label}</p>
                          <p className="text-gray-500 text-sm">{LANGUAGES[activeLanguage].nativeLabel}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.values(LANGUAGES).map((lang) => (
                        <div
                          key={lang.code}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all",
                            activeLanguage === lang.code
                              ? "border-[#facc15] bg-yellow-50 scale-105"
                              : "border-gray-200 bg-white opacity-60"
                          )}
                        >
                          <p className="text-xs text-gray-500 mb-0.5">{lang.flag}</p>
                          <p className="text-sm font-medium text-gray-800">{lang.nativeLabel}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Language Switching */}
                {currentStep === "language_switching" && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-2">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">Live Language Switch</h3>
                      <p className="text-gray-500 text-sm">AI is adapting in real-time</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-yellow-50 rounded-2xl p-5 text-center">
                      <p className="text-[#6b21a8] text-xs uppercase tracking-wide mb-3">Now Speaking</p>
                      <div className="size-20 rounded-full bg-[#facc15] mx-auto flex items-center justify-center mb-3 shadow-md transition-all duration-500">
                        <span className="text-[#6b21a8] font-black text-lg">{LANGUAGES[activeLanguage].flag}</span>
                      </div>
                      <p className="text-2xl font-semibold text-gray-800">{LANGUAGES[activeLanguage].nativeLabel}</p>
                      <p className="text-sm text-gray-500 mt-1">{LANGUAGES[activeLanguage].label}</p>
                    </div>

                    {languageHistory.length > 1 && (
                      <div className="bg-white rounded-2xl p-4 border border-gray-100">
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Conversation Path</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {languageHistory.map((lc, i) => (
                            <div key={`${lc}-${i}`} className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-xs font-medium border",
                                  i === languageHistory.length - 1
                                    ? "bg-[#facc15] text-[#6b21a8] border-[#facc15]"
                                    : "bg-purple-50 text-[#6b21a8] border-purple-100"
                                )}
                              >
                                {LANGUAGES[lc].label}
                              </span>
                              {i < languageHistory.length - 1 && (
                                <span className="text-gray-300">→</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Language Saved */}
                {currentStep === "language_saved" && savedLanguage && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-2">
                      <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="size-9 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Language Preference Saved</h3>
                      <p className="text-gray-500 text-sm mt-1">Stored on customer profile</p>
                    </div>

                    <div className="bg-purple-50 rounded-2xl p-4">
                      <p className="text-[#6b21a8] text-xs uppercase tracking-wide mb-3">Customer Profile</p>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-full bg-[#facc15] flex items-center justify-center text-[#6b21a8] font-bold">
                          {customerName ? customerName[0] : "A"}
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium">{customerName || "Ajinkya"}</p>
                          <p className="text-gray-500 text-xs">{customerAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-purple-100 pt-3">
                        <span className="text-gray-500 text-sm">Preferred Language</span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#facc15] text-[#6b21a8] flex items-center gap-1.5">
                          <Languages className="size-3.5" />
                          {LANGUAGES[savedLanguage].label} · {LANGUAGES[savedLanguage].nativeLabel}
                        </span>
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-2xl p-4">
                      <p className="text-gray-700 text-sm">
                        <span className="font-medium">Next call:</span> Priya will greet Ajinkya in Hindi automatically.
                      </p>
                    </div>
                  </div>
                )}

                {/* Feedback Complete */}
                {currentStep === "feedback_complete" && (
                  <div className="space-y-5 animate-in fade-in duration-500 text-center py-4">
                    <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="size-9 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Feedback Submitted!</h3>
                    <div className="bg-purple-50 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "size-5",
                              star <= feedbackRating 
                                ? "text-[#facc15] fill-[#facc15]" 
                                : "text-gray-200"
                            )}
                          />
                        ))}
                      </div>
                      {feedbackComment && (
                        <p className="text-gray-600 text-sm">"{feedbackComment}"</p>
                      )}
                    </div>
                    <div className="bg-[#facc15] rounded-2xl p-4">
                      <p className="text-gray-800 font-semibold">🎉 10% Discount Added!</p>
                      <p className="text-gray-600 text-sm">For your next booking</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info Card */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Customer Profile</p>
              {customerName ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#facc15] flex items-center justify-center text-[#6b21a8] font-bold shadow-sm">
                      {customerName[0]}
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{customerName}</p>
                      <p className="text-green-600 text-xs">Verified</p>
                    </div>
                  </div>
                  {customerAddress && (
                    <div className="text-sm text-gray-500 pl-1">
                      <MapPin className="size-3.5 inline mr-1 text-[#6b21a8]" />
                      {customerAddress}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">New Customer</p>
                    <p className="text-gray-400 text-xs">Details will be collected</p>
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
