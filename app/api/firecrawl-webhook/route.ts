import knowledgeService from "@/lib/services/knowledge-service";
import { IWebPropsMetadata } from "@/lib/types/knowledge";
import { doc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("X-Firecrawl-Signature");
    const webhookSecret = process.env.FIRECRAWL_WEBHOOK_SECRET;

    const e = request.body;

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 402 });
    }

    // Get raw body for signature verification
    const body = await request.text();

    // Verify signature
    if (!verifySignature(signature, body, webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse and process verified webhook
    const event = JSON.parse(body);

    const { wid, docId } = event.metadata;

    if (!wid || !docId) {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    if (event.type === "batch_scrape.page") {
      const result = event.data[0];
      const content = (result.markdown ?? "") + (result.metadata ?? "");

      const me: IWebPropsMetadata = {
        url: (result.metadata?.url as string) ?? "",
        title: result.metadata?.title ?? "",
      };

      const { chunkSize, points } = await knowledgeService.embedWeb(
        wid,
        content,
        me
      );

      await knowledgeService.saveMultiUrlKnowledge(
        wid,
        docId,
        me,
        points,
        chunkSize
      );

      return NextResponse.json({ status: "ok" });
    } else if (event.type === "batch_scrape.completed") {
      await knowledgeService.compeletedTraining(wid, docId);
      return NextResponse.json({ status: "ok" });
    }
  } catch (error) {
    console.error("Error handling firecrawl webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const verifySignature = (
  signature: string,
  body: string,
  secret: string
): boolean => {
  try {
    // Extract hash from signature header
    const [algorithm, hash] = signature.split("=");
    if (algorithm !== "sha256") {
      return false;
    }

    // Compute expected signature
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    // Verify signature using timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
};
