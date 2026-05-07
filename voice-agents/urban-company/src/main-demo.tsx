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
  CreditCard,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Home,
  Scissors,
  Wind,
  Wrench,
  Loader,
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
  unit: string;
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
  { id: "home_cleaning", name: "Home Cleaning", icon: <Home className="size-6" />, price: 649, unit: "room" },
  { id: "salon", name: "Salon at Home", icon: <Scissors className="size-6" />, price: 499, unit: "session" },
  { id: "ac_service", name: "AC Service", icon: <Wind className="size-6" />, price: 399, unit: "AC" },
  { id: "appliance", name: "Appliance Repair", icon: <Wrench className="size-6" />, price: 299, unit: "appliance" },
];

const PERIODS: PeriodInfo[] = [
  { id: "morning", label: "Morning", range: "8 AM – 12 PM", icon: Sunrise },
  { id: "afternoon", label: "Afternoon", range: "12 PM – 5 PM", icon: Sun },
  { id: "evening", label: "Evening", range: "5 PM – 8 PM", icon: Moon },
];

const TIME_SLOTS: TimeSlot[] = [
  { date: "May 4, 2026", time: "9:00 AM", period: "morning", available: true },
  { date: "May 4, 2026", time: "10:00 AM", period: "morning", available: false },
  { date: "May 4, 2026", time: "11:00 AM", period: "morning", available: true },
  { date: "May 4, 2026", time: "12:00 PM", period: "afternoon", available: true },
  { date: "May 4, 2026", time: "2:00 PM", period: "afternoon", available: true },
  { date: "May 4, 2026", time: "4:00 PM", period: "afternoon", available: false },
  { date: "May 4, 2026", time: "5:00 PM", period: "evening", available: true },
  { date: "May 4, 2026", time: "6:30 PM", period: "evening", available: true },
  { date: "May 4, 2026", time: "7:30 PM", period: "evening", available: true },
];

/** Urban Company — black + dark purple accent */
const UC_PURPLE = "#4c1d95";
const UC_PURPLE_SOFT = "#a78bfa";

export default function UrbanCompanyDemo() {
  const vapiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  const vapiAssistantId = process.env.NEXT_PUBLIC_URBAN_COMPANY_ASSISTANT_ID || "";
  const vapiRef = useRef<Vapi | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const abortSimulationRef = useRef(false);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

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
  const [lastBookingId] = useState("UCP847291");
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
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (userAudioRef.current) { userAudioRef.current.pause(); userAudioRef.current = null; }
    };
  }, []);

  useEffect(() => {
    const container = transcriptScrollRef.current;
    if (!container) return;
    const stickToBottom = () => { container.scrollTop = container.scrollHeight; };
    stickToBottom();
    const observer = new MutationObserver(stickToBottom);
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
    const preferred = ["Samantha", "Karen", "Moira", "Veena", "Google UK English Female"];
    for (const name of preferred) {
      const voice = availableVoices.find(v => v.name.includes(name));
      if (voice) return voice;
    }
    return availableVoices.find(v => v.lang.startsWith("en")) || availableVoices[0];
  }, [availableVoices]);

  const speakWithElevenLabs = useCallback(
    async (text: string, opts: { role?: "assistant" | "user"; animateOrb?: boolean } = {}): Promise<boolean> => {
      const role = opts.role ?? "assistant";
      const animateOrb = opts.animateOrb ?? role === "assistant";
      const ref = role === "user" ? userAudioRef : audioRef;
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, role }),
        });
        if (!response.ok) { console.warn("ElevenLabs unavailable"); return false; }
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
            URL.revokeObjectURL(audioUrl); resolve(true);
          };
          ref.current.onerror = () => {
            if (animateOrb) { if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current); setVoiceVolume(0); }
            URL.revokeObjectURL(audioUrl); resolve(false);
          };
          ref.current.play().catch(() => resolve(false));
        });
      } catch { return false; }
    },
    [],
  );

  const speakWithBrowser = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!synthRef.current || isSpeakerMuted) { setTimeout(resolve, text.length * 50); return; }
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getPreferredVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 1.0; utterance.pitch = 1.1;
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = setInterval(() => setVoiceVolume(0.3 + Math.random() * 0.5), 100);
      utterance.onend = () => { if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current); setVoiceVolume(0); resolve(); };
      utterance.onerror = () => { if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current); setVoiceVolume(0); resolve(); };
      synthRef.current.speak(utterance);
    });
  }, [getPreferredVoice, isSpeakerMuted]);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (abortSimulationRef.current) throw new Error("Simulation aborted");
    if (isSpeakerMuted) { await new Promise(resolve => setTimeout(resolve, text.length * 40)); return; }
    if (useElevenLabs) {
      const success = await speakWithElevenLabs(text, { role: "assistant" });
      if (success) return;
      setUseElevenLabs(false);
    }
    await speakWithBrowser(text);
  }, [isSpeakerMuted, useElevenLabs, speakWithElevenLabs, speakWithBrowser]);

  const speakAsUser = useCallback(async (text: string): Promise<void> => {
    if (abortSimulationRef.current) throw new Error("Simulation aborted");
    if (isSpeakerMuted) return;
    if (useElevenLabs) {
      const success = await speakWithElevenLabs(text, { role: "user", animateOrb: false });
      if (success) return;
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
    vapi.on("volume-level", (volume: number) => setVoiceVolume(volume));
    vapi.on("error", () => setVoiceState("error"));
    vapiRef.current = vapi;
    return () => { void vapi.stop(); vapiRef.current = null; };
  }, [vapiKey]);

  const handleStartVoice = async () => {
    if (demoType === "booking") runBookingSimulation();
    else if (demoType === "out_of_service") runOutOfServiceSimulation();
    else if (demoType === "feedback") runFeedbackSimulation();
    else if (demoType === "language_switch") runLanguageSwitchSimulation();
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

  const resetDemo = () => {
    stopSpeaking();
    setVoiceState("idle"); setVoiceVolume(0); setCurrentStep("idle");
    setTranscript([]); setTypingText(null); setSelectedService(null);
    setQuantity(1); setSelectedSlot(null); setBookingId("");
    setCustomerName(""); setCustomerAddress(""); setRequestedServices([]);
    setFeedbackRating(0); setFeedbackComment(""); setActiveLanguage("en");
    setLanguageHistory([]); setSavedLanguage(null); setSelectedPeriod(null);
  };

  const getUserSpeakTime = (text: string) => Math.max(1500, text.split(" ").length * 300);

  const speakAndType = async (text: string) => {
    await Promise.all([speak(text), typeText("assistant", text, 50)]);
  };

  const typeUserMessage = async (text: string) => {
    await Promise.all([speakAsUser(text), typeText("user", text, 55)]);
  };

  // ==================== BOOKING SIMULATION ====================
  const runBookingSimulation = async () => {
    abortSimulationRef.current = false;
    setIsSimulating(true); setVoiceState("connecting");
    try {
      await delay(1500);
      setVoiceState("talking"); setCurrentStep("greeting");
      await speakAndType("Hi! I'm Kavya from Urban Company. How can I help you today?");

      setVoiceState("listening"); await delay(1500);
      await typeUserMessage("Hi, I need a home cleaning done");

      setSelectedService(SERVICES[0]);
      await delay(500); setVoiceState("talking"); setCurrentStep("quantity_selection");
      await speakAndType("Sure! Home cleaning is ₹649 per room. How many rooms would you like us to clean?");

      setVoiceState("listening"); await delay(1500);
      await typeUserMessage("2 rooms please"); setQuantity(2);

      await delay(500);
      const total = 649 * 2; const gst = Math.round(total * 0.18); const grandTotal = total + gst;
      setVoiceState("talking"); setCurrentStep("time_of_day_selection");
      await speakAndType(`Got it — 2 rooms, that comes to ${grandTotal} rupees including GST. Morning, afternoon, or evening works best for you?`);

      setVoiceState("listening"); await delay(1800);
      await typeUserMessage("Morning works best"); setSelectedPeriod("morning");

      await delay(500); setVoiceState("talking"); setCurrentStep("slot_selection");
      await speakAndType("Perfect! Here are tomorrow's morning slots — 9 AM and 11 AM are open, 10 AM is booked. Which would you prefer?");

      setVoiceState("listening"); await delay(2000);
      await typeUserMessage("11 AM please"); setSelectedSlot(TIME_SLOTS[2]);

      await delay(500); setVoiceState("talking");
      await speakAndType("Great! Could you share your name and address for the booking?");

      setVoiceState("listening"); await delay(2000);
      await typeUserMessage("Ajinkya, Flat 1101, My Home Mangala, Kondapur");
      setCustomerName("Ajinkya"); setCustomerAddress("Flat 1101, My Home Mangala, Kondapur");

      await delay(500); setVoiceState("talking"); setCurrentStep("confirmation");
      await speakAndType(`Thanks Ajinkya! Quick recap: 2 rooms tomorrow at 11 AM, total ${grandTotal} rupees, at My Home Mangala. Shall I confirm?`);

      setVoiceState("listening"); await delay(2000);
      await typeUserMessage("Yes, confirmed");

      await delay(500); setVoiceState("talking"); setCurrentStep("payment");
      await speakAndType("Wonderful! I've sent the payment link to your WhatsApp. Just a moment while it processes.");

      setVoiceState("listening"); await delay(1200);
      const newBookingId = `UCP${Date.now().toString().slice(-6)}`;
      setBookingId(newBookingId); setCurrentStep("success");

      await delay(300); setVoiceState("talking");
      await speakAndType("Payment received! Your booking is confirmed — our professional will arrive tomorrow at 11 AM. You'll get a WhatsApp reminder an hour before. Anything else I can help with?");

      setVoiceState("listening"); await delay(1500);
      await typeUserMessage("No, that's perfect. Thank you!");

      await delay(500); setVoiceState("talking");
      await speakAndType("You're most welcome! Thank you for choosing Urban Company. Have a wonderful day!");

      await delay(2000); setVoiceState("idle"); setIsSimulating(false);
    } catch { console.log("Simulation ended by user"); }
  };

  // ==================== OUT OF SERVICE SIMULATION ====================
  const runOutOfServiceSimulation = async () => {
    abortSimulationRef.current = false;
    setIsSimulating(true); setVoiceState("connecting");
    try {
      await delay(1500);
      setVoiceState("talking"); setCurrentStep("greeting");
      await speakAndType("Hi! I'm Kavya from Urban Company — your home services partner. How can I assist you today?");

      setVoiceState("listening"); await delay(1500);
      await typeUserMessage("Hi, I want to book a salon at home service");

      await delay(500); setVoiceState("talking");
      await speakAndType("Sure, I'd be happy to help! May I know your name please?");

      setVoiceState("listening"); await delay(1000);
      await typeUserMessage("I'm Ajinkya"); setCustomerName("Ajinkya");

      await delay(500); setVoiceState("talking");
      await speakAndType("Nice to meet you Ajinkya! Could you share your address so I can check availability?");

      setVoiceState("listening"); await delay(2000);
      await typeUserMessage("Tower B, Flat 2304, Srisailam Highway, Narsingi");
      setCustomerAddress("Tower B, Flat 2304, Srisailam Highway, Narsingi");

      await delay(800); setCurrentStep("out_of_area"); setVoiceState("talking");
      await speakAndType("I appreciate your interest Ajinkya! Unfortunately, Salon at Home isn't available in the Narsingi area yet. But we're expanding quickly! To help us prioritise, could you tell me which services you'd most like in your community?");

      setVoiceState("listening"); await delay(2000);
      await typeUserMessage("Salon at home, home cleaning, and maybe AC service");
      setRequestedServices(["Salon at Home", "Home Cleaning"]);

      await delay(500); setCurrentStep("collecting_preferences"); setVoiceState("talking");
      await speakAndType("Thank you! I've noted your interest in Salon at Home, Home Cleaning, and AC Service. Our team is actively expanding to Narsingi. We'll notify you on WhatsApp as soon as we go live in your area. Is there anything else you'd like?");

      setRequestedServices(prev => [...prev, "AC Service"]);
      setVoiceState("listening"); await delay(2000);
      await typeUserMessage("No, that's all. Thanks for letting me know!");

      await delay(500); setVoiceState("talking");
      await speakAndType("You're welcome Ajinkya! Thank you for your interest in Urban Company. We truly value your feedback and will reach out soon. Have a great day!");

      await delay(2000); setVoiceState("idle"); setIsSimulating(false);
    } catch { console.log("Simulation ended by user"); }
  };

  // ==================== FEEDBACK SIMULATION ====================
  const runFeedbackSimulation = async () => {
    abortSimulationRef.current = false;
    setIsSimulating(true); setVoiceState("connecting"); setCustomerName("Ajinkya");
    try {
      await delay(1500);
      setCurrentStep("feedback_intro"); setVoiceState("talking");
      await speakAndType("Hi Ajinkya! This is Kavya from Urban Company. I'm calling about your home cleaning which was done yesterday at 11 AM. Do you have a moment to share your feedback?");

      setVoiceState("listening"); await delay(1500);
      await typeUserMessage("Yes, sure. I have a few minutes");

      await delay(500); setCurrentStep("feedback_rating"); setVoiceState("talking");
      await speakAndType("Wonderful! On a scale of 1 to 5, where 5 is excellent, how would you rate your overall experience?");

      setVoiceState("listening"); await delay(2000);
      await typeUserMessage("I would give it a 4 out of 5"); setFeedbackRating(4);

      await delay(500); setVoiceState("talking");
      await speakAndType("Thank you! A 4 out of 5 is great. We're always striving for 5. Could you share what we could do better to earn that last star?");

      setVoiceState("listening"); await delay(2000);
      setCurrentStep("feedback_comments");
      await typeUserMessage("The cleaning was thorough but the professional arrived about 20 minutes late. Otherwise everything was perfect");
      setFeedbackComment("Professional arrived 20 minutes late. Cleaning quality was perfect.");

      await delay(500); setVoiceState("talking");
      await speakAndType("I really appreciate that, Ajinkya. Punctuality is very important to us and I'm noting this for our operations team right now. We'll work on this.");

      await delay(300);
      await speakAndType("Is there anything else you'd like to share?");

      setVoiceState("listening"); await delay(1500);
      await typeUserMessage("No, the work quality was genuinely great though");

      await delay(500); setCurrentStep("feedback_complete"); setVoiceState("talking");
      await speakAndType("That means a lot! Your feedback is recorded and will help us improve. As a thank you, we've added a 10% discount to your Urban Company account for your next booking. Thank you for choosing us, Ajinkya!");

      setVoiceState("listening"); await delay(1500);
      await typeUserMessage("Oh that's nice, thank you!");

      await delay(500); setVoiceState("talking");
      await speakAndType("You're most welcome! We look forward to serving you again. Have a wonderful day!");

      await delay(2000); setVoiceState("idle"); setIsSimulating(false);
    } catch { console.log("Simulation ended by user"); }
  };

  // ==================== LANGUAGE SWITCH SIMULATION ====================
  const runLanguageSwitchSimulation = async () => {
    abortSimulationRef.current = false;
    setIsSimulating(true); setVoiceState("connecting");
    setActiveLanguage("en"); setLanguageHistory(["en"]); setSavedLanguage(null);
    try {
      await delay(1500);
      setCurrentStep("language_intro"); setVoiceState("talking");
      await speakAndType("Hi! I'm Kavya from Urban Company — your home services partner. How can I assist you today?");

      setVoiceState("listening"); await delay(1500);
      await typeUserMessage("Hi, I want to book a home cleaning service");

      await delay(500); setVoiceState("talking");
      await speakAndType("Sure! May I know your name and address please?");

      setVoiceState("listening"); await delay(2000);
      await typeUserMessage("I'm Ajinkya. Flat 1207, My Home Mangala. Also, can you please talk to me in Telugu?");
      setCustomerName("Ajinkya"); setCustomerAddress("Flat 1207, My Home Mangala");

      await delay(800); setCurrentStep("language_switching");
      setActiveLanguage("te"); setLanguageHistory(prev => [...prev, "te"]); setVoiceState("talking");
      await speakAndType("తప్పకుండా అజింక్యా గారు! నేను ఇప్పుడు తెలుగులో మాట్లాడుతున్నాను. మీకు ఏ రోజు, ఏ సమయంలో హోమ్ క్లీనింగ్ కావాలి?");

      setVoiceState("listening"); await delay(2500);
      await typeUserMessage("Actually, please continue in Hindi, that's easier for me");

      await delay(800);
      setActiveLanguage("hi"); setLanguageHistory(prev => [...prev, "hi"]); setVoiceState("talking");
      await speakAndType("बिल्कुल अजिंक्या जी! मैं अब हिंदी में बात करूंगी। क्या आप कल सुबह 11 बजे का स्लॉट लेना चाहेंगे? होम क्लीनिंग 2 रूम्स के लिए 1,530 रुपये है।");

      setVoiceState("listening"); await delay(2000);
      await typeUserMessage("Yes, tomorrow 11 AM works for me");
      setSelectedService(SERVICES[0]); setSelectedSlot(TIME_SLOTS[2]);

      await delay(500); setVoiceState("talking");
      await speakAndType("ठीक है! आपकी बुकिंग कन्फर्म हो गई है। पेमेंट लिंक भेज रही हूं।");

      await delay(1500); setCurrentStep("language_saved"); setSavedLanguage("hi");
      setVoiceState("talking"); setActiveLanguage("en");
      await speakAndType("Booking confirmed! I've saved Hindi as your preferred language. Next time you call, I'll greet you in Hindi straight away. Have a great day!");

      await delay(2000); setVoiceState("idle"); setIsSimulating(false);
    } catch { console.log("Simulation ended by user"); }
  };

  const delay = (ms: number) => new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (abortSimulationRef.current) reject(new Error("Simulation aborted"));
      else resolve();
    }, ms);
    if (abortSimulationRef.current) { clearTimeout(timeout); reject(new Error("Simulation aborted")); }
  });

  const typeText = useCallback(async (role: "user" | "assistant", text: string, speedMs = 30): Promise<void> => {
    if (abortSimulationRef.current) throw new Error("Simulation aborted");
    const words = text.split(" ");
    let currentText = "";
    for (let i = 0; i < words.length; i++) {
      if (abortSimulationRef.current) throw new Error("Simulation aborted");
      currentText += (i === 0 ? "" : " ") + words[i];
      setTypingText({ role, text: currentText });
      await new Promise(resolve => setTimeout(resolve, speedMs + Math.random() * 20));
    }
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

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-black border-2 border-[#4c1d95] flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm tracking-tight">UC</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">URBAN COMPANY</h1>
              <p className="text-xs text-white/40">AI Voice Booking</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white/[0.08] rounded-full p-0.5 mr-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#4c1d95] text-white">Voice Demo</span>
              <Link href="/demo/urban-company/triggers"
                className="px-3 py-1 rounded-full text-xs font-medium text-white/50 hover:text-white flex items-center gap-1 transition-colors">
                <Bell className="size-3" />Triggers
              </Link>
              <Link href="/demo/urban-company/analytics"
                className="px-3 py-1 rounded-full text-xs font-medium text-white/50 hover:text-white flex items-center gap-1 transition-colors">
                <BarChart3 className="size-3" />Analytics
              </Link>
            </div>
            <div className="flex bg-white/[0.08] rounded-full p-0.5">
              {(["booking","out_of_service","feedback","language_switch"] as const).map((type, i) => (
                <button key={type}
                  onClick={() => { resetDemo(); setDemoType(type); }}
                  disabled={isSimulating}
                  className={cn("px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1",
                    demoType === type ? "bg-[#4c1d95] text-white" : "text-white/50 hover:text-white")}>
                  {i === 3 && <Languages className="size-3" />}
                  {["Booking","Out of Area","Feedback","Language"][i]}
                </button>
              ))}
            </div>
            <span className={cn("px-3 py-1 rounded-full text-xs font-medium ml-2",
              isVoiceConnected ? "bg-[#4c1d95] text-white" : "bg-white/[0.08] text-white/50")}>
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
              <h2 className="text-xl font-medium text-gray-900">Voice Assistant</h2>
              <p className="text-sm text-gray-400">
                {demoType === "booking" && "Complete booking flow with payment"}
                {demoType === "out_of_service" && "Area not serviceable — collecting preferences"}
                {demoType === "feedback" && "Post-service feedback collection"}
                {demoType === "language_switch" && "Live language switching: English → Telugu → Hindi"}
              </p>
            </div>

            {/* Kavya persona card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="size-12 rounded-full bg-[#4c1d95] flex items-center justify-center shadow-sm shrink-0">
                  <span className="text-white font-black text-lg">K</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">Kavya</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">AI · Urban Company</span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-500">
                      <span className="size-1.5 rounded-full bg-gray-400 animate-pulse" />Online 24×7
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Your home services assistant. Pan-India, knows your neighbourhood.</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center gap-1">
                      <Languages className="size-2.5" />EN · हिन्दी · తెలుగు
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium flex items-center gap-1">
                      <MapPin className="size-2.5" />50,000+ homes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Orb — monochrome black */}
            <div className="aspect-square max-w-[340px] mx-auto relative">
              <Orb
                className="h-full w-full"
                colors={[UC_PURPLE_SOFT, UC_PURPLE]}
                agentState={orbState}
                volumeMode="manual"
                manualInput={voiceVolume}
                manualOutput={voiceVolume}
              />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="inline-block px-4 py-2 bg-[#4c1d95]/90 backdrop-blur-sm rounded-full text-sm text-white">
                  {voiceState === "connecting" && "Connecting..."}
                  {voiceState === "listening" && "Listening..."}
                  {voiceState === "talking" && "Kavya is speaking..."}
                  {voiceState === "idle" && "Tap Start to begin"}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {isVoiceConnected || isSimulating ? (
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" size="lg" className="rounded-full px-6 border-gray-200 text-gray-300" disabled>
                    <Phone className="size-4 mr-2" />Start
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full px-4 border-gray-200 text-gray-700 hover:bg-gray-50" onClick={handleToggleMute}>
                    {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                  </Button>
                  <Button variant="outline" size="lg"
                    className={cn("rounded-full px-4 border-gray-200 text-gray-700 hover:bg-gray-50", isSpeakerMuted && "bg-gray-100 border-gray-300 text-gray-400")}
                    onClick={() => { setIsSpeakerMuted(!isSpeakerMuted); if (!isSpeakerMuted) stopSpeaking(); }}>
                    {isSpeakerMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                  </Button>
                  <Button size="lg" className="rounded-full px-6 bg-[#4c1d95] hover:bg-[#5b21b6] text-white" onClick={handleEndVoice}>
                    <PhoneOff className="size-4 mr-2" />End
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button
                    className="w-full max-w-sm rounded-full bg-[#4c1d95] hover:bg-[#5b21b6] text-white font-medium h-12 text-base"
                    onClick={handleStartVoice}
                    disabled={voiceState === "connecting"}
                  >
                    {voiceState === "connecting"
                      ? <><Loader className="size-4 mr-2 animate-spin" />Connecting...</>
                      : <><Phone className="size-4 mr-2" />Start Conversation</>}
                  </Button>
                </div>
              )}

              {/* Transcript */}
              {(transcript.length > 0 || typingText) && (
                <div ref={transcriptScrollRef}
                  className="max-h-72 min-h-32 overflow-y-auto overscroll-contain space-y-2 bg-gray-50 rounded-2xl p-4 border border-gray-200"
                  aria-label="Conversation transcript">
                  {transcript.map((msg, i) => (
                    <div key={i} className={cn("text-sm p-3 rounded-2xl",
                      msg.role === "assistant" ? "bg-white text-gray-700 border border-gray-200" : "bg-gray-100 text-gray-700 ml-6")}>
                      <span className="font-medium text-gray-900">{msg.role === "assistant" ? "Kavya: " : "You: "}</span>
                      {msg.text}
                    </div>
                  ))}
                  {typingText && (
                    <div className={cn("text-sm p-3 rounded-2xl",
                      typingText.role === "assistant" ? "bg-white text-gray-700 border border-gray-200" : "bg-gray-100 text-gray-700 ml-6")}>
                      <span className="font-medium text-gray-900">{typingText.role === "assistant" ? "Kavya: " : "You: "}</span>
                      {typingText.text}<span className="animate-pulse">|</span>
                    </div>
                  )}
                  <div ref={transcriptEndRef} aria-hidden="true" />
                </div>
              )}
            </div>
          </div>

          {/* Right: Visual Display */}
          <div className="space-y-5">
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">Booking Display</h2>
                <p className="text-sm text-gray-400">Visual elements shown during the call</p>
              </div>

              <div className="p-5 min-h-[480px]">
                {currentStep === "idle" && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="size-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Phone className="size-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">Start a conversation to see the booking flow</p>
                  </div>
                )}

                {currentStep === "greeting" && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-8">
                      <div className="size-16 rounded-xl bg-[#4c1d95] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#4c1d95]/25">
                        <span className="text-white font-black text-xl">UC</span>
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-1">Welcome to Urban Company</h3>
                      <p className="text-gray-400 text-sm">Tell Kavya what you need — she&apos;s listening</p>
                    </div>
                  </div>
                )}

                {currentStep === "service_selection" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <h3 className="text-base font-medium text-gray-900">Select a Service</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {SERVICES.map((service) => (
                        <button key={service.id} onClick={() => setSelectedService(service)}
                          className={cn("p-4 rounded-2xl border transition-all text-left",
                            selectedService?.id === service.id ? "border-[#4c1d95] bg-gray-50 shadow-sm" : "border-gray-200 hover:border-gray-400")}>
                          <div className="text-gray-700 mb-2">{service.icon}</div>
                          <p className="text-gray-900 font-medium text-sm">{service.name}</p>
                          <p className="text-gray-800 text-base font-medium mt-1">₹{service.price}<span className="text-xs text-gray-400 font-normal">/{service.unit}</span></p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === "quantity_selection" && selectedService && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Selected Service</p>
                      <p className="text-gray-900 font-medium">{selectedService.name}</p>
                      <p className="text-gray-500 text-sm">₹{selectedService.price} per {selectedService.unit}</p>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900 mb-4">How many {selectedService.unit}s?</h3>
                      <div className="flex items-center gap-4 justify-center py-2">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="size-11 rounded-full bg-gray-100 text-gray-700 text-xl hover:bg-gray-200 transition-colors font-medium border border-gray-200">−</button>
                        <span className="text-3xl font-medium text-gray-900 w-14 text-center">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)}
                          className="size-11 rounded-full bg-gray-100 text-gray-700 text-xl hover:bg-gray-200 transition-colors font-medium border border-gray-200">+</button>
                      </div>
                    </div>
                    <div className="bg-[#4c1d95] rounded-2xl p-4 text-center mt-4">
                      <p className="text-white/70 text-xs uppercase tracking-wide">Estimated Total</p>
                      <p className="text-2xl font-bold text-white">₹{calculateTotal().total}</p>
                      <p className="text-white/60 text-xs">(incl. 18% GST)</p>
                    </div>
                  </div>
                )}

                {currentStep === "time_of_day_selection" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Booking</p>
                        <p className="text-gray-900 font-medium text-sm">{quantity}× {selectedService?.name ?? "Service"}</p>
                      </div>
                      <p className="text-gray-900 font-medium text-lg">₹{calculateTotal().total}</p>
                    </div>
                    <h3 className="text-base font-medium text-gray-900">When works best for you?</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {PERIODS.map((p) => {
                        const Icon = p.icon;
                        const isActive = selectedPeriod === p.id;
                        return (
                          <button key={p.id} onClick={() => setSelectedPeriod(p.id)}
                            className={cn("flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all",
                              isActive ? "border-[#4c1d95] bg-gray-50" : "border-gray-200 hover:border-gray-400")}>
                            <Icon className={cn("size-7", isActive ? "text-[#4c1d95]" : "text-gray-400")} />
                            <p className="text-gray-900 font-medium text-sm">{p.label}</p>
                            <p className="text-gray-400 text-[11px]">{p.range}</p>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-center text-gray-400 text-xs">Say morning, afternoon, or evening</p>
                  </div>
                )}

                {currentStep === "slot_selection" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium text-gray-900 flex items-center gap-2">
                        <Calendar className="size-4 text-gray-600" />Available Slots
                      </h3>
                      {selectedPeriod && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 font-medium capitalize">{selectedPeriod}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {TIME_SLOTS.filter(s => !selectedPeriod || s.period === selectedPeriod).map((slot, i) => (
                        <button key={i} disabled={!slot.available} onClick={() => setSelectedSlot(slot)}
                          className={cn("p-3 rounded-xl border transition-all text-left",
                            !slot.available ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                            : selectedSlot === slot ? "border-[#4c1d95] bg-gray-50"
                            : "border-gray-200 hover:border-gray-400")}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <Clock className="size-3.5 text-gray-600" />
                            <span className="text-gray-900 text-sm font-medium">{slot.time}</span>
                          </div>
                          <p className="text-gray-400 text-xs">{slot.date}</p>
                          {!slot.available && <span className="text-gray-400 text-xs">Booked</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === "confirmation" && selectedService && selectedSlot && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <h3 className="text-base font-medium text-gray-900">Confirm Your Booking</h3>
                    <div className="rounded-2xl divide-y divide-gray-100 border border-gray-200 overflow-hidden">
                      {[
                        { label: "Service", value: `${quantity}× ${selectedService.name}` },
                        { label: "Date & Time", value: `${selectedSlot.date} at ${selectedSlot.time}` },
                        { label: "Address", value: customerAddress },
                      ].map(row => (
                        <div key={row.label} className="p-4">
                          <p className="text-gray-400 text-xs uppercase tracking-wide">{row.label}</p>
                          <p className="text-gray-900 font-medium">{row.value}</p>
                        </div>
                      ))}
                      <div className="p-4 bg-gray-50">
                        <div className="flex justify-between text-gray-500 text-sm"><span>Subtotal</span><span>₹{calculateTotal().subtotal}</span></div>
                        <div className="flex justify-between text-gray-500 text-sm mt-1"><span>GST (18%)</span><span>₹{calculateTotal().gst}</span></div>
                        <div className="flex justify-between text-gray-900 font-medium text-lg mt-3 pt-3 border-t border-gray-200">
                          <span>Total</span><span>₹{calculateTotal().total}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-gray-400 text-sm">Say &quot;Confirm&quot; to proceed</p>
                  </div>
                )}

                {currentStep === "payment" && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-4">
                      <div className="size-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="size-7 text-gray-700" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Complete Payment</h3>
                      <p className="text-gray-500 text-sm">Amount: <span className="font-medium text-gray-900">₹{calculateTotal().total}</span></p>
                    </div>
                    <div className="bg-[#4c1d95] rounded-2xl p-5 text-center">
                      <p className="text-white/60 text-xs uppercase tracking-wide mb-2">Payment Link</p>
                      <div className="bg-white/15 rounded-xl p-3 mb-4">
                        <p className="text-white font-mono text-sm break-all">pay.urbancompany.com/book/{Date.now().toString().slice(-6)}</p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="size-4 text-white/50 animate-spin" />
                        <span className="text-white/80 text-sm">Waiting for payment...</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === "success" && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-4">
                      <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="size-9 text-gray-700" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-1">Booking Confirmed!</h3>
                      <p className="text-gray-500 font-mono font-medium">#{bookingId || `UCP${Date.now().toString().slice(-6)}`}</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-200">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Service</span><span className="text-gray-900 font-medium">{quantity}× {selectedService?.name}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Date & Time</span><span className="text-gray-900 font-medium">{selectedSlot?.date} at {selectedSlot?.time}</span></div>
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-200"><span className="text-gray-500">Amount Paid</span><span className="text-gray-900 font-medium">₹{calculateTotal().total}</span></div>
                    </div>
                    <p className="text-center text-gray-400 text-sm">Our professional will arrive at the scheduled time. Thank you!</p>
                  </div>
                )}

                {currentStep === "out_of_area" && (
                  <div className="space-y-4 animate-in fade-in duration-500 text-center py-4">
                    <div className="size-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="size-7 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Service Not Available Yet</h3>
                    <p className="text-gray-500 text-sm">Salon at Home is currently unavailable in <span className="font-medium text-gray-700">Narsingi</span></p>
                    <div className="bg-gray-50 rounded-2xl p-4 mt-4 text-left border border-gray-200">
                      <p className="text-gray-600 text-xs uppercase tracking-wide mb-2">Expanding soon!</p>
                      <p className="text-gray-500 text-sm">Tell us which services you&apos;d like in your area.</p>
                    </div>
                  </div>
                )}

                {currentStep === "collecting_preferences" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="text-center py-2">
                      <h3 className="text-lg font-medium text-gray-900">Preferences Recorded</h3>
                      <p className="text-gray-500 text-sm">Thank you for your feedback!</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Services You Want</p>
                      <div className="flex flex-wrap gap-2">
                        {requestedServices.map((s) => (
                          <span key={s} className="px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm border border-gray-200 font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-200">
                      <p className="text-gray-600 text-sm">We&apos;ll notify you on WhatsApp when we go live in your area!</p>
                    </div>
                  </div>
                )}

                {currentStep === "feedback_intro" && (
                  <div className="space-y-5 animate-in fade-in duration-500 text-center py-4">
                    <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="size-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">Feedback Call</h3>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Previous Booking</p>
                      <p className="text-gray-700 font-mono font-medium">#{lastBookingId}</p>
                      <p className="text-gray-500 text-sm mt-2">Home Cleaning Service</p>
                    </div>
                  </div>
                )}

                {currentStep === "feedback_rating" && (
                  <div className="space-y-5 animate-in fade-in duration-500 text-center py-4">
                    <h3 className="text-lg font-medium text-gray-900">Rate Your Experience</h3>
                    <div className="flex justify-center gap-2 py-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={cn("size-10 transition-all",
                          star <= feedbackRating ? "text-gray-800 fill-gray-800" : "text-gray-200")} />
                      ))}
                    </div>
                    {feedbackRating > 0 && (
                      <p className="text-gray-700 font-medium text-lg">
                        {feedbackRating}/5 — {feedbackRating >= 4 ? "Great!" : feedbackRating >= 3 ? "Good" : "Thanks for feedback"}
                      </p>
                    )}
                  </div>
                )}

                {currentStep === "feedback_comments" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="text-center py-2">
                      <div className="flex justify-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={cn("size-6",
                            star <= feedbackRating ? "text-gray-800 fill-gray-800" : "text-gray-200")} />
                        ))}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Your Feedback</h3>
                    </div>
                    {feedbackComment && (
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Comment</p>
                        <p className="text-gray-700 text-sm italic">&ldquo;{feedbackComment}&rdquo;</p>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === "language_intro" && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-2">
                      <div className="size-16 rounded-xl bg-[#4c1d95] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#4c1d95]/25">
                        <Languages className="size-8 text-white" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-1">Multi-Language AI</h3>
                      <p className="text-gray-500 text-sm">Speaks 33+ languages. Switches mid-call.</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Currently speaking</p>
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-full bg-white border-2 border-[#4c1d95] flex items-center justify-center font-bold text-[#1a1a1a]">
                          {LANGUAGES[activeLanguage].flag}
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{LANGUAGES[activeLanguage].label}</p>
                          <p className="text-gray-500 text-sm">{LANGUAGES[activeLanguage].nativeLabel}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.values(LANGUAGES).map((lang) => (
                        <div key={lang.code} className={cn("p-3 rounded-xl border text-center transition-all",
                          activeLanguage === lang.code ? "border-[#4c1d95] bg-gray-50 scale-105" : "border-gray-200 opacity-60")}>
                          <p className="text-xs text-gray-500 mb-0.5">{lang.flag}</p>
                          <p className="text-sm font-medium text-gray-800">{lang.nativeLabel}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === "language_switching" && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Live Language Switch</h3>
                      <p className="text-gray-500 text-sm">AI adapting in real-time</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-200">
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Now Speaking</p>
                      <div className="size-20 rounded-xl bg-[#4c1d95] mx-auto flex items-center justify-center mb-3 shadow-lg shadow-[#4c1d95]/25 transition-all duration-500">
                        <span className="text-white font-black text-lg">{LANGUAGES[activeLanguage].flag}</span>
                      </div>
                      <p className="text-2xl font-medium text-gray-900">{LANGUAGES[activeLanguage].nativeLabel}</p>
                      <p className="text-sm text-gray-500 mt-1">{LANGUAGES[activeLanguage].label}</p>
                    </div>
                    {languageHistory.length > 1 && (
                      <div className="bg-white rounded-2xl p-4 border border-gray-200">
                        <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Conversation Path</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {languageHistory.map((lc, i) => (
                            <div key={`${lc}-${i}`} className="flex items-center gap-2">
                              <span className={cn("px-3 py-1.5 rounded-full text-xs font-medium border",
                                i === languageHistory.length - 1 ? "bg-[#4c1d95] text-white border-[#4c1d95]" : "bg-gray-100 text-gray-700 border-gray-200")}>
                                {LANGUAGES[lc].label}
                              </span>
                              {i < languageHistory.length - 1 && <span className="text-gray-300">→</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === "language_saved" && savedLanguage && (
                  <div className="space-y-5 animate-in fade-in duration-500">
                    <div className="text-center py-2">
                      <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="size-9 text-gray-700" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900">Language Preference Saved</h3>
                      <p className="text-gray-500 text-sm mt-1">Stored on customer profile</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-3">Customer Profile</p>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-full bg-[#4c1d95] flex items-center justify-center text-white font-bold">
                          {customerName ? customerName[0] : "A"}
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{customerName || "Ajinkya"}</p>
                          <p className="text-gray-500 text-xs">{customerAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                        <span className="text-gray-500 text-sm">Preferred Language</span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#4c1d95] text-white flex items-center gap-1.5">
                          <Languages className="size-3.5" />
                          {LANGUAGES[savedLanguage].label} · {LANGUAGES[savedLanguage].nativeLabel}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                      <p className="text-gray-700 text-sm">
                        <span className="font-medium">Next call:</span> Kavya will greet {customerName || "Ajinkya"} in Hindi automatically.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === "feedback_complete" && (
                  <div className="space-y-5 animate-in fade-in duration-500 text-center py-4">
                    <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="size-9 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">Feedback Submitted!</h3>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-200">
                      <div className="flex justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={cn("size-5",
                            star <= feedbackRating ? "text-gray-800 fill-gray-800" : "text-gray-200")} />
                        ))}
                      </div>
                      {feedbackComment && <p className="text-gray-600 text-sm">&ldquo;{feedbackComment}&rdquo;</p>}
                    </div>
                    <div className="bg-[#4c1d95] rounded-2xl p-4">
                      <p className="text-white font-medium">🎉 10% Discount Added!</p>
                      <p className="text-white/70 text-sm">For your next booking</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Customer Profile</p>
              {customerName ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#4c1d95] flex items-center justify-center text-white font-bold shadow-sm">
                      {customerName[0]}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{customerName}</p>
                      <p className="text-gray-500 text-xs">Verified</p>
                    </div>
                  </div>
                  {customerAddress && (
                    <div className="text-sm text-gray-500 pl-1">
                      <MapPin className="size-3.5 inline mr-1 text-gray-500" />
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
