import chatService from "@/lib/services/chat-service";
import { errorResponse, successResponse } from "@/lib/types/api-response";
import { defaultAImessage, defaultUserMessage, IChatMessage } from "@/lib/types/session";
import { createHmac, timingSafeEqual } from "crypto";

type VapiArtifactMessage = { role?: string; message?: string; text?: string; content?: string };

const normalizeRole = (role?: string) => {
  const r = role?.toLowerCase();
  if (r === "assistant" || r === "bot" || r === "system") return "assistant";
  if (r === "user" || r === "human" || r === "customer") return "user";
  return null;
};

const toIsoAtIndex = (base: string, index: number) => {
  const time = Date.parse(base);
  return Number.isNaN(time) ? base : new Date(time + index).toISOString();
};

const verifySignature = (payload: string, rawSignature: string, secret: string) => {
  const signature = rawSignature.replace(/^sha256=/, "");
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

const fetchCallArtifact = async (callId: string) => {
  const key = process.env.VAPI_PRIVATE_KEY || process.env.VAPI_API_KEY;
  if (!key) return null;
  const headers = { Authorization: `Bearer ${key}` };
  for (const url of [`https://api.vapi.ai/call/${callId}`, `https://api.vapi.ai/calls/${callId}`]) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) continue;
      const data = await res.json();
      return data?.artifact ? data : data?.call || null;
    } catch {}
  }
  return null;
};

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-vapi-signature") || "";
    const secret = process.env.VAPI_WEBHOOK_SECRET;
    if (secret && !verifySignature(rawBody, signature, secret)) {
      console.warn("[vapi-webhook] Invalid signature");
      return errorResponse("Invalid signature", 401);
    }

    const payload = JSON.parse(rawBody);
    const message = payload?.message ?? payload;
    const messageType = message?.type ?? payload?.type;
    const status = message?.status ?? payload?.status;
    const call = message?.call ?? payload?.call ?? {};
    let artifact = message?.artifact ?? call?.artifact ?? payload?.artifact ?? {};
    let artifactMessages = Array.isArray(artifact?.messages)
      ? (artifact.messages as VapiArtifactMessage[])
      : [];
    console.log("[vapi-webhook] Received event", {
      type: messageType || "unknown",
      status: status || null,
      callId: call?.id || null,
      hasMessageWrapper: !!payload?.message,
      hasTranscript: !!artifact?.transcript,
      artifactMessageCount: artifactMessages.length,
    });

    if (!["end-of-call-report", "call.ended", "status-update"].includes(messageType)) {
      console.log("[vapi-webhook] Event ignored", { type: messageType || "unknown" });
      return successResponse({ stored: false }, "Event ignored");
    }
    if (messageType === "status-update" && status && status !== "ended") {
      return successResponse({ stored: false }, "Status update ignored");
    }
    if (!artifactMessages.length && !artifact?.transcript && call?.id) {
      const fetchedCall = await fetchCallArtifact(call.id);
      artifact = fetchedCall?.artifact || artifact;
      artifactMessages = Array.isArray(artifact?.messages)
        ? (artifact.messages as VapiArtifactMessage[])
        : [];
      console.log("[vapi-webhook] Fetched call artifact", {
        callId: call.id,
        fetched: !!fetchedCall?.artifact,
      });
    }

    const variableValues = call?.assistantOverrides?.variableValues ?? call?.metadata ?? {};
    const aid = variableValues?.aid || variableValues?.agentId;
    const wid = variableValues?.wid || variableValues?.workspaceId;
    const sessionId = variableValues?.sessionId || variableValues?.sid;
    const deviceId = variableValues?.deviceId;
    const fromPage = variableValues?.fromPage;

    if (!aid || !wid || !sessionId) {
      console.log("[vapi-webhook] Missing routing context", {
        type: messageType,
        callId: call?.id || null,
        aid: aid || null,
        wid: wid || null,
        sessionId: sessionId || null,
      });
      return successResponse({ stored: false }, "Missing routing context");
    }

    await chatService.ensureSession(wid, aid, sessionId, undefined, deviceId || call?.id, fromPage);

    const baseTime = call?.endedAt || call?.updatedAt || new Date().toISOString();

    const messages: IChatMessage[] = artifactMessages
      .map((item, index) => {
        const role = normalizeRole(item.role);
        const text = String(item.message ?? item.text ?? item.content ?? "").trim();
        if (!role || !text) return null;
        const id = `${call?.id || sessionId}-${index}-${role}`;
        const createdAt = toIsoAtIndex(baseTime, index);
        const msg = role === "assistant" ? defaultAImessage(text) : defaultUserMessage(text);
        msg.id = id;
        msg.metadata = { ...msg.metadata, createdAt };
        return msg;
      })
      .filter(Boolean) as IChatMessage[];

    if (!messages.length && artifact?.transcript) {
      const transcriptMsg = defaultAImessage(String(artifact.transcript));
      transcriptMsg.id = `${call?.id || sessionId}-transcript`;
      transcriptMsg.metadata = { ...transcriptMsg.metadata, createdAt: baseTime };
      messages.push(transcriptMsg);
    }

    for (const msg of messages) await chatService.saveMessage(aid, sessionId, msg);
    console.log("[vapi-webhook] Stored messages", {
      type: messageType,
      callId: call?.id || null,
      aid,
      wid,
      sessionId,
      storedCount: messages.length,
      hasTranscriptFallback: !!artifact?.transcript && artifactMessages.length === 0,
    });

    return successResponse({ stored: true, count: messages.length }, "Webhook processed");
  } catch (error) {
    console.error("Error processing Vapi webhook:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
