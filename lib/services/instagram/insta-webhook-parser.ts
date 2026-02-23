import { IInstaMessage } from "@/lib/types/insta-api";

// Returns null for messages that should be silently ignored
const parseMessage = (body: any): IInstaMessage | null => {
  const data = body?.entry?.[0]?.messaging?.[0];
  if (!data?.message) return null;

  const { message, sender, recipient, timestamp } = data;

  // Ignore echo (our own sent messages), deleted, and unsupported messages
  if (message.is_echo || message.is_deleted || message.is_unsupported) return null;

  const base = {
    id: message.mid,
    from: sender.id,
    to: recipient.id,
    timestamp,
  };

  const attachment = message.attachments?.[0];

  if (attachment) {
    // Ephemeral (view-once) has no payload — Meta policy: do not store
    if (attachment.type === "ephemeral") return null;

    // Only handle direct image attachments for now; URL is self-authenticated (signature in query params)
    if (attachment.type === "image" && attachment.payload?.url) {
      return { ...base, type: "image", imageUrl: attachment.payload.url };
    }

    // video, audio, file, share, story_mention, ig_reel — not yet supported, ignore silently
    return null;
  }

  // Only process if there's actual text
  if (!message.text) return null;

  return { ...base, type: "text", text: message.text };
};

const instaParser = { parseMessage };
export default instaParser;
