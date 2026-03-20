export const emailNeedToReplyPrompt = (
  postmarkMsg: { from: string; subject: string },
  truncatedContent: string,
) => `Classify if this customer support email needs a human reply.

shouldReply=true: Sender asks a specific question, reports a problem, or requests action about our product/service.

shouldReply=false: Notifications, receipts, newsletters, vendor pitches, demo deliveries, or any email whose PRIMARY purpose is to inform/promote — even if it contains soft phrases like "curious what you think" or "let me know your feedback".

Core test: Is the sender seeking help FROM us, or informing/pitching TO us?

From: ${postmarkMsg.from}
Subject: ${postmarkMsg.subject}
Content: """${truncatedContent}"""

Return ONLY JSON:
{"shouldReply":boolean,"reason":"one sentence","confidence":0-1}`;
