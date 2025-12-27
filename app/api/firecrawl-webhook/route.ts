import { backendClient } from "@/lib/clients/axios-client";
import knowledgeService from "@/lib/services/knowledge-service";
import { IWebPropsMetadata } from "@/lib/types/knowledge";
import { doc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("X-Firecrawl-Signature");
    const webhookSecret = process.env.FIRECRAWL_WEBHOOK_SECRET;

    const bodyRaw = await request.text();

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 402 });
    }

    if (!verifySignature(signature, bodyRaw, webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(bodyRaw);
    const { wid, workspaceType, urlMetadata: metaRaw } = event.metadata;

    let urlMetadata: Record<
      string,
      { folderId: string; knowledgeId: string }
    > | null = null;
    if (metaRaw) {
      try {
        urlMetadata =
          typeof metaRaw === "string" ? JSON.parse(metaRaw) : metaRaw;
      } catch (e) {
        console.error("Failed to parse urlMetadata", e);
      }
    }

    if (!wid) {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    if (event.type === "batch_scrape.page") {
      const result = event.data[0];
      const content = (result.markdown ?? "") + (result.metadata ?? "");

      const me: IWebPropsMetadata = {
        url: (result.metadata?.url as string) ?? "",
        title: result.metadata?.title ?? "",
      };

      let folderId = event.metadata.folderId;
      let websiteId = event.metadata.docId;

      if (urlMetadata && me.url) {
        const exact = urlMetadata[me.url];
        const altUrl = me.url.endsWith("/")
          ? me.url.slice(0, -1)
          : me.url + "/";
        const alt = urlMetadata[altUrl];

        const match = exact || alt;
        if (match) {
          folderId = match.folderId;
          websiteId = match.knowledgeId;
        }
      }

      if (!folderId) {
        return NextResponse.json(
          { error: "Folder ID is required" },
          { status: 400 }
        );
      }

      if (!websiteId) {
        const existingKnowledge = await knowledgeService.getUrlKnowledgeByUrl(
          wid,
          folderId,
          me.url
        );
        websiteId = existingKnowledge ? existingKnowledge.id : v4();
      }

      const { chunkSize, points } = await knowledgeService.s_embedWeb(
        wid,
        folderId,
        websiteId,
        content,
        me
      );

      await knowledgeService.s_saveScrapedWebPage(
        wid,
        folderId,
        websiteId,
        me,
        points,
        chunkSize
      );

      return NextResponse.json({ status: "ok" });
    } else if (event.type === "batch_scrape.completed") {
      if (urlMetadata) {
        const uniqueEntries = Object.values(urlMetadata);
        const uniqueKnowledgeIds = new Set<string>();
        const updatePromises: Promise<void>[] = [];

        for (const entry of uniqueEntries) {
          if (!uniqueKnowledgeIds.has(entry.knowledgeId)) {
            uniqueKnowledgeIds.add(entry.knowledgeId);
            updatePromises.push(
              knowledgeService.s_completedTraining(
                wid,
                entry.folderId,
                entry.knowledgeId
              )
            );
          }
        }

        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
        }
      }
      if (workspaceType === "onboarding") {
        await backendClient.post("/onboard/webhook-training-complete", { wid });
      }
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
