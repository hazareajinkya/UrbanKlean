import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const ASSISTANT_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";

const USER_VOICE_ID =
  process.env.ELEVENLABS_USER_VOICE_ID || "TX3LPaxmHKxFdv7VOQHJ";

type Role = "assistant" | "user";

const VOICE_SETTINGS: Record<
  Role,
  {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  }
> = {
  assistant: {
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.4,
    use_speaker_boost: true,
  },
  user: {
    stability: 0.6,
    similarity_boost: 0.85,
    style: 0.35,
    use_speaker_boost: true,
  },
};

export async function POST(request: NextRequest) {
  try {
    const { text, role } = (await request.json()) as {
      text?: string;
      role?: Role;
    };

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const speakerRole: Role = role === "user" ? "user" : "assistant";
    const voiceId =
      speakerRole === "user" ? USER_VOICE_ID : ASSISTANT_VOICE_ID;
    const voiceSettings = VOICE_SETTINGS[speakerRole];

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let parsed: {
        detail?: { status?: string; message?: string; code?: string };
      } | null = null;
      try {
        parsed = JSON.parse(errorText);
      } catch {
        parsed = null;
      }
      const detail = parsed?.detail;
      const reason = detail?.code || detail?.status || "unknown";
      console.error(
        `[tts] ${speakerRole} voice "${voiceId}" failed (${response.status} / ${reason}): ${detail?.message || errorText}`
      );
      return NextResponse.json(
        {
          error: detail?.message || "Failed to generate speech",
          code: reason,
        },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
