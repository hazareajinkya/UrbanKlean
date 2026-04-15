"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { AudioLines, MessageCircle, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Orb, type AgentState } from "@/components/ui/orb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getLocalDeviceId,
  getLocalSession,
  saveLocalDeviceId,
  saveLocalSession,
} from "@/components/chat/chat-utils";
import { VAPI_ASSISTANT_ID } from "@/lib/utils/conf";
import { v4 } from "uuid";

export default function AgentPreviewTabs({
  aid,
  wid,
  botName,
}: {
  aid: string;
  wid: string;
  botName: string;
}) {
  const fromPage =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.href)
      : "";
  const vapiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  const vapiRef = useRef<Vapi | null>(null);
  const [voiceState, setVoiceState] = useState<
    "idle" | "connecting" | "listening" | "talking" | "error"
  >("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
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
    const handleCallStart = () => {
      setVoiceError(null);
      setVoiceState("listening");
    };
    const handleCallEnd = () => {
      setVoiceState("idle");
      setVoiceVolume(0);
      setIsMuted(false);
    };
    const handleSpeechStart = () => setVoiceState("talking");
    const handleSpeechEnd = () => setVoiceState("listening");
    const handleVolume = (volume: number) => setVoiceVolume(volume);
    const handleError = (error: { error?: { message?: string } }) => {
      setVoiceState("error");
      setVoiceError(error?.error?.message ?? "Voice session failed.");
    };
    vapiRef.current = vapi;
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("volume-level", handleVolume);
    vapi.on("error", handleError);
    return () => {
      vapi.removeListener("call-start", handleCallStart);
      vapi.removeListener("call-end", handleCallEnd);
      vapi.removeListener("speech-start", handleSpeechStart);
      vapi.removeListener("speech-end", handleSpeechEnd);
      vapi.removeListener("volume-level", handleVolume);
      vapi.removeListener("error", handleError);
      void vapi.stop();
      vapiRef.current = null;
    };
  }, [vapiKey]);

  const handleStartVoice = async () => {
    if (!vapiKey || !vapiRef.current) {
      setVoiceState("error");
      setVoiceError("Add NEXT_PUBLIC_VAPI_PUBLIC_KEY to enable Voice tab.");
      return;
    }
    if (voiceState === "connecting" || isVoiceConnected) return;
    const sessionId = getLocalSession(aid) || v4();
    const deviceId = getLocalDeviceId(wid) || v4();
    saveLocalSession(aid, sessionId);
    saveLocalDeviceId(wid, deviceId);
    setVoiceError(null);
    setVoiceState("connecting");
    try {
      await vapiRef.current.start(VAPI_ASSISTANT_ID, {
        variableValues: {
          aid,
          wid,
          sessionId,
          deviceId,
          fromPage:
            typeof window !== "undefined" ? window.location.href : undefined,
        },
      });
    } catch (error) {
      setVoiceState("error");
      setVoiceError(
        error instanceof Error ? error.message : "Unable to start assistant.",
      );
    }
  };

  const handleEndVoice = async () => {
    if (!vapiRef.current || !isVoiceConnected) return;
    await vapiRef.current.stop();
    setVoiceState("idle");
    setVoiceVolume(0);
    setIsMuted(false);
  };

  const handleToggleMute = () => {
    if (!vapiRef.current || !isVoiceConnected) return;
    const nextMuted = !isMuted;
    vapiRef.current.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  return (
    <Tabs defaultValue="chat" className="w-full max-w-[371px] flex flex-col items-center">
      <TabsList className="w-fit shadow-md h-auto rounded-full border border-border bg-card p-0.5 gap-0.5">
        <TabsTrigger
          value="chat"
          className="cursor-pointer rounded-full border border-transparent px-5 py-1 gap-1.5 text-muted-foreground data-[state=active]:border-border data-[state=active]:bg-muted data-[state=active]:text-foreground"
        >
          <MessageCircle className="size-4 shrink-0" aria-hidden />
          Chat
        </TabsTrigger>
        <TabsTrigger
          value="voice"
          className="cursor-pointer rounded-full border border-transparent px-5 py-1 gap-1.5 text-muted-foreground data-[state=active]:border-border data-[state=active]:bg-muted data-[state=active]:text-foreground"
        >
          <AudioLines className="size-4 shrink-0" aria-hidden />
          Voice
        </TabsTrigger>
      </TabsList>
      <TabsContent value="chat" className="mt-4">
        <div className="relative flex justify-center">
          <div className="bg-gray-900 p-2 rounded-2xl shadow-2xl">
            <div className="bg-white rounded-xl overflow-hidden">
              <iframe
                src={`/chat/${aid}?fromPage=${fromPage}`}
                className="w-[355px] h-[647px] border-0"
                title={`Chat interface for ${botName}`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
              />
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="voice" className="mt-4">
        <div className="relative flex justify-center">
          <div className="bg-gray-900 p-2 rounded-2xl shadow-2xl">
            <div className="w-[355px] h-[647px] rounded-xl overflow-hidden bg-white p-6 flex flex-col">
              <div className="text-sm text-muted-foreground text-center">Live conversation</div>
              <h3 className="text-lg font-medium mt-1 text-center">Talk with {botName}</h3>
              <div className="mt-6 flex-1 rounded-2xl border bg-slate-50/80">
                <Orb
                  className="h-full w-full"
                  colors={["#CADCFC", "#91A7FF"]}
                  agentState={orbState}
                  volumeMode="manual"
                  manualInput={voiceVolume}
                  manualOutput={voiceVolume}
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                {voiceState === "connecting"
                  ? "Connecting..."
                  : voiceState === "listening"
                    ? "Listening..."
                    : voiceState === "talking"
                      ? "Assistant is talking..."
                      : `Tap Start to talk with ${botName}.`}
              </p>
              {voiceError ? <p className="mt-2 text-xs text-red-600 text-center">{voiceError}</p> : null}
              {isVoiceConnected ? (
                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <Button type="button" className="w-full min-w-0" onClick={handleStartVoice} disabled>
                    Start
                  </Button>
                  <div className="flex shrink-0 justify-center">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 w-14 shrink-0 px-0"
                      onClick={handleToggleMute}
                      aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                      aria-pressed={isMuted}
                    >
                      {isMuted ? (
                        <MicOff className="size-4" aria-hidden />
                      ) : (
                        <Mic className="size-4" aria-hidden />
                      )}
                    </Button>
                  </div>
                  <Button type="button" className="w-full min-w-0" variant="outline" onClick={handleEndVoice}>
                    End
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  className="mt-4 w-full"
                  onClick={handleStartVoice}
                  disabled={voiceState === "connecting"}
                >
                  {voiceState === "connecting" ? "Connecting..." : "Start"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
