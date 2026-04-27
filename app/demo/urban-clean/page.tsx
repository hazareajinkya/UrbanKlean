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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 } from "uuid";

type BookingStep =
  | "idle"
  | "greeting"
  | "service_selection"
  | "quantity_selection"
  | "slot_selection"
  | "confirmation"
  | "payment"
  | "success"
  | "out_of_area";

type Service = {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: number;
  selected?: boolean;
};

type TimeSlot = {
  date: string;
  time: string;
  available: boolean;
};

const SERVICES: Service[] = [
  { id: "bathroom", name: "Bathroom Cleaning", icon: <Bath className="size-6" />, price: 500 },
  { id: "deep", name: "Deep Cleaning", icon: <Sparkles className="size-6" />, price: 1500 },
  { id: "sofa", name: "Sofa Cleaning", icon: <Sofa className="size-6" />, price: 800 },
  { id: "home", name: "Full Home Cleaning", icon: <Home className="size-6" />, price: 2500 },
];

const TIME_SLOTS: TimeSlot[] = [
  { date: "Apr 27, 2026", time: "9:00 AM", available: true },
  { date: "Apr 27, 2026", time: "11:00 AM", available: true },
  { date: "Apr 27, 2026", time: "2:00 PM", available: false },
  { date: "Apr 27, 2026", time: "4:00 PM", available: true },
  { date: "Apr 28, 2026", time: "9:00 AM", available: true },
  { date: "Apr 28, 2026", time: "11:00 AM", available: true },
  { date: "Apr 28, 2026", time: "2:00 PM", available: true },
  { date: "Apr 28, 2026", time: "4:00 PM", available: false },
];

export default function UrbanCleanDemo() {
  const vapiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  const vapiAssistantId = process.env.NEXT_PUBLIC_URBAN_CLEAN_ASSISTANT_ID || "";
  const vapiRef = useRef<Vapi | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const abortSimulationRef = useRef(false);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      
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

  const speakWithElevenLabs = useCallback(async (text: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.warn("ElevenLabs unavailable, falling back to browser TTS");
        return false;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return new Promise((resolve) => {
        if (!audioRef.current) {
          resolve(false);
          return;
        }

        audioRef.current.src = audioUrl;
        
        if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
        volumeIntervalRef.current = setInterval(() => {
          setVoiceVolume(0.3 + Math.random() * 0.5);
        }, 80);

        audioRef.current.onended = () => {
          if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
          setVoiceVolume(0);
          URL.revokeObjectURL(audioUrl);
          resolve(true);
        };

        audioRef.current.onerror = () => {
          if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
          setVoiceVolume(0);
          URL.revokeObjectURL(audioUrl);
          resolve(false);
        };

        audioRef.current.play().catch(() => resolve(false));
      });
    } catch (error) {
      console.warn("ElevenLabs error:", error);
      return false;
    }
  }, []);

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
    // Check if simulation was aborted
    if (abortSimulationRef.current) {
      throw new Error("Simulation aborted");
    }
    
    if (isSpeakerMuted) {
      await new Promise(resolve => setTimeout(resolve, text.length * 40));
      return;
    }

    if (useElevenLabs) {
      const success = await speakWithElevenLabs(text);
      if (success) return;
      setUseElevenLabs(false);
    }

    await speakWithBrowser(text);
  }, [isSpeakerMuted, useElevenLabs, speakWithElevenLabs, speakWithBrowser]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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
    if (isSimulating) {
      runSimulation();
      return;
    }
    
    if (!vapiKey || !vapiRef.current || !vapiAssistantId) {
      runSimulation();
      return;
    }
    
    setVoiceState("connecting");
    try {
      await vapiRef.current.start(vapiAssistantId, {
        variableValues: {
          sessionId: v4(),
          customerName,
          customerAddress,
        },
      });
    } catch {
      runSimulation();
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
    setSelectedService(null);
    setQuantity(1);
    setSelectedSlot(null);
    setBookingId("");
    setCustomerName("");
    setCustomerAddress("");
  };

  // Helper function to calculate user "speaking" time based on text length
  const getUserSpeakTime = (text: string) => {
    const words = text.split(' ').length;
    return Math.max(1500, words * 300); // ~300ms per word, minimum 1.5s
  };

  const runSimulation = async () => {
    // Reset abort flag at start
    abortSimulationRef.current = false;
    setIsSimulating(true);
    setVoiceState("connecting");
    
    try {
    await delay(1500);
    
    // Step 1: Greeting (don't assume we know the customer)
    const greeting = "Hi! I'm Priya from Urban Clean. Welcome! How can I assist you today?";
    setVoiceState("talking");
    setCurrentStep("greeting");
    addTranscript("assistant", greeting);
    await speak(greeting);
    
    // User thinks before responding
    setVoiceState("listening");
    await delay(2000);
    
    // User responds - show text and wait for "speaking" time
    const userMsg1 = "Hi, I need bathroom cleaning service";
    addTranscript("user", userMsg1);
    await delay(getUserSpeakTime(userMsg1));
    
    // Agent processes and responds
    await delay(800);
    const nameMsg = "Sure, I'd be happy to help with bathroom cleaning. May I know your name please?";
    setVoiceState("talking");
    addTranscript("assistant", nameMsg);
    await speak(nameMsg);
    
    // User thinks
    setVoiceState("listening");
    await delay(1500);
    
    // User provides name
    const userMsg2 = "My name is Arwin";
    addTranscript("user", userMsg2);
    setCustomerName("Arwin");
    await delay(getUserSpeakTime(userMsg2));
    
    // Agent responds
    await delay(600);
    const addressMsg = "Thank you Arwin! Could you please share your address for the service?";
    setVoiceState("talking");
    addTranscript("assistant", addressMsg);
    await speak(addressMsg);
    
    // User thinks
    setVoiceState("listening");
    await delay(2000);
    
    // User provides address
    const userMsg3 = "Block 1, Flat 1101, My Home Mangala, Kondapur";
    addTranscript("user", userMsg3);
    setCustomerAddress(userMsg3);
    await delay(getUserSpeakTime(userMsg3));
    
    // Step 2: Service Selection
    await delay(800);
    const serviceMsg = "Perfect! I'm displaying our services on your screen. We have Bathroom Cleaning at 500 rupees, Deep Cleaning, Sofa Cleaning, and Full Home Cleaning. Which service would you like?";
    setVoiceState("talking");
    setCurrentStep("service_selection");
    addTranscript("assistant", serviceMsg.replace("500 rupees", "₹500"));
    await speak(serviceMsg);
    
    // User looks at options
    setVoiceState("listening");
    await delay(3000);
    
    // User selects service
    const userMsg4 = "Bathroom cleaning please";
    addTranscript("user", userMsg4);
    setSelectedService(SERVICES[0]);
    await delay(getUserSpeakTime(userMsg4));
    
    // Step 3: Quantity Selection
    await delay(600);
    const quantityMsg = "Great choice! How many bathrooms would you like us to clean?";
    setVoiceState("talking");
    setCurrentStep("quantity_selection");
    addTranscript("assistant", quantityMsg);
    await speak(quantityMsg);
    
    // User thinks
    setVoiceState("listening");
    await delay(1500);
    
    // User responds with quantity
    const userMsg5 = "2 bathrooms";
    addTranscript("user", userMsg5);
    setQuantity(2);
    await delay(getUserSpeakTime(userMsg5));
    
    // Step 4: Slot Selection
    await delay(800);
    const total = 500 * 2;
    const gst = Math.round(total * 0.18);
    const grandTotal = total + gst;
    const slotMsg = `Perfect! 2 Bathroom Cleaning will be ${total} rupees plus 18% GST, which comes to ${grandTotal} rupees. I'm now displaying available time slots on your screen. Please select your preferred date and time.`;
    setVoiceState("talking");
    setCurrentStep("slot_selection");
    addTranscript("assistant", slotMsg.replace(`${total} rupees`, `₹${total}`).replace(`${grandTotal} rupees`, `₹${grandTotal}`));
    await speak(slotMsg);
    
    // User looks at slots
    setVoiceState("listening");
    await delay(3500);
    
    // User selects slot
    const userMsg6 = "Tomorrow at 11 AM please";
    addTranscript("user", userMsg6);
    setSelectedSlot(TIME_SLOTS[1]);
    await delay(getUserSpeakTime(userMsg6));
    
    // Step 5: Confirmation
    await delay(800);
    const confirmMsg = `I'm displaying your booking summary on screen. You've selected 2 Bathroom Cleaning for ${TIME_SLOTS[1].date} at ${TIME_SLOTS[1].time}, total ${grandTotal} rupees. The service will be at Block 1, Flat 1101, My Home Mangala, Kondapur. Please review and confirm.`;
    setVoiceState("talking");
    setCurrentStep("confirmation");
    addTranscript("assistant", confirmMsg.replace(`${grandTotal} rupees`, `₹${grandTotal}`));
    await speak(confirmMsg);
    
    // User reviews
    setVoiceState("listening");
    await delay(2500);
    
    // User confirms
    const userMsg7 = "Yes, confirmed";
    addTranscript("user", userMsg7);
    await delay(getUserSpeakTime(userMsg7));
    
    // Step 6: Payment
    await delay(600);
    const paymentMsg = "Excellent! I'm sending you the payment link now. Please complete the payment to confirm your booking.";
    setVoiceState("talking");
    setCurrentStep("payment");
    addTranscript("assistant", paymentMsg);
    await speak(paymentMsg);
    
    // Wait for payment to complete (simulated)
    setVoiceState("listening");
    await delay(5000);
    
    // Step 7: Success
    const newBookingId = `UC${Date.now().toString().slice(-6)}`;
    setBookingId(newBookingId);
    setCurrentStep("success");
    
    await delay(500);
    const successMsg = `Payment received! Your booking is confirmed. Your booking ID is ${newBookingId}. Our team will arrive at ${TIME_SLOTS[1].time} on ${TIME_SLOTS[1].date}. Thank you for choosing Urban Clean! Is there anything else I can help you with?`;
    setVoiceState("talking");
    addTranscript("assistant", successMsg);
    await speak(successMsg);
    
    // User thinks
    setVoiceState("listening");
    await delay(2000);
    
    // User says goodbye
    const userMsg8 = "No, that's all. Thank you!";
    addTranscript("user", userMsg8);
    await delay(getUserSpeakTime(userMsg8));
    
    // Final goodbye
    await delay(600);
    const byeMsg = "You're most welcome! We appreciate your trust in Urban Clean. Have a wonderful day!";
    setVoiceState("talking");
    addTranscript("assistant", byeMsg);
    await speak(byeMsg);
    
    await delay(2000);
    setVoiceState("idle");
    setIsSimulating(false);
    } catch {
      // Simulation was aborted - do nothing, cleanup already handled
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
  };

  const calculateTotal = () => {
    if (!selectedService) return { subtotal: 0, gst: 0, total: 0 };
    const subtotal = selectedService.price * quantity;
    const gst = Math.round(subtotal * 0.18);
    return { subtotal, gst, total: subtotal + gst };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#6b21a8] text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-[#facc15] flex items-center justify-center shadow-md">
              <span className="text-[#6b21a8] font-black text-sm">UK</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">URBAN KLEAN</h1>
              <p className="text-xs text-white/80">AI Voice Booking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
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
              <p className="text-sm text-gray-500">Talk to book your cleaning service</p>
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
                <Button
                  className="w-full max-w-sm mx-auto block rounded-full bg-[#facc15] hover:bg-[#eab308] text-gray-900 font-semibold h-12 text-base shadow-sm"
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
              )}

              {/* Transcript */}
              {transcript.length > 0 && (
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
                    <div className="text-center py-6">
                      <div className="size-16 rounded-full bg-[#facc15] flex items-center justify-center mx-auto mb-4 shadow-md">
                        <span className="text-[#6b21a8] font-black text-xl">UK</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">Welcome to Urban Klean!</h3>
                      <p className="text-gray-500 text-sm">How can we help you today?</p>
                    </div>
                    {customerAddress ? (
                      <div className="bg-purple-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="size-4 text-[#6b21a8]" />
                          <span className="text-gray-500 text-xs uppercase tracking-wide">Your Address</span>
                        </div>
                        <p className="text-gray-700">{customerAddress}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-2xl p-4 text-center">
                        <p className="text-gray-400 text-sm">Collecting customer details...</p>
                      </div>
                    )}
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

                {/* Slot Selection */}
                {currentStep === "slot_selection" && (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Calendar className="size-4 text-[#6b21a8]" />
                      Select Time Slot
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {TIME_SLOTS.map((slot, i) => (
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
                                : "border-gray-200 bg-white hover:border-purple-200"
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
                  <div className="space-y-4 animate-in fade-in duration-500 text-center py-6">
                    <div className="size-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                      <MapPin className="size-7 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Service Not Available</h3>
                    <p className="text-gray-500 text-sm">We're not yet serviceable in your area.</p>
                    <div className="bg-purple-50 rounded-2xl p-4 mt-4">
                      <p className="text-gray-500 text-xs mb-3">What services would you like in your area?</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {["Bathroom Cleaning", "Deep Cleaning", "Sofa Cleaning"].map((s) => (
                          <span key={s} className="px-3 py-1.5 bg-white text-[#6b21a8] rounded-full text-xs border border-purple-200">
                            {s}
                          </span>
                        ))}
                      </div>
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
