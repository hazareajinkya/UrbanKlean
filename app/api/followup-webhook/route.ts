import { NextRequest } from "next/server";
import { z } from "zod";
import {
  errorResponse,
  successResponse,
  validateBody,
} from "@/lib/types/api-response";
import channelService from "@/lib/services/channel-service";
import peopleService from "@/lib/services/people-service";
import waService from "@/lib/services/whatsapp/wa-service";

const zTemplatePayload = z.object({
  name: z.string().min(1, "template name is required"),
  languageCode: z.string().min(1, "languageCode is required"),
  components: z.array(z.any()).optional(),
});

const zWebhookBody = z.object({
  wid: z.string().min(1, "wid is required"),
  personId: z.string().min(1, "personId is required"),
  followUpId: z.string().min(1, "followUpId is required"),
  phone: z.string().min(1, "phone is required"),
  scheduleType: z.enum(["once", "interval"]),
  template: z.union([zTemplatePayload, z.null()]),
});

export async function POST(req: NextRequest) {
  try {
    const { wid, personId, followUpId, phone, scheduleType, template } =
      await validateBody(req, zWebhookBody);

    const now = new Date().toISOString();

    const persistFollowUpSuccess = async () => {
      const person = await peopleService.getPerson(wid, personId);
      if (!person) {
        return errorResponse("Person not found", 404);
      }

      const followUp = Array.isArray(person.followUp)
        ? person.followUp.map((item) => {
            if (item.id !== followUpId) {
              return item;
            }

            const nextStatus =
              scheduleType === "once"
                ? ("sent" as const)
                : ("scheduled" as const);

            return {
              ...item,
              status: nextStatus,
              updatedAt: now,
              lastRunAt: now,
              error: "",
            };
          })
        : [];

      await peopleService.update({
        wid,
        personId,
        updates: {
          followUp,
          updatedAt: now,
        },
      });

      return successResponse({ ok: true });
    };

    const persistFollowUpFailed = async (message: string) => {
      const person = await peopleService.getPerson(wid, personId);

      if (person && Array.isArray(person.followUp)) {
        const followUp = person.followUp.map((item) => {
          if (item.id !== followUpId) {
            return item;
          }

          return {
            ...item,
            status: "failed" as const,
            updatedAt: now,
            error: message,
          };
        });

        await peopleService.update({
          wid,
          personId,
          updates: {
            followUp,
            updatedAt: now,
          },
        });
      }

      return errorResponse(message, 500);
    };

    if (template === null) {
      return persistFollowUpSuccess();
    }

    try {
      const channels = await channelService.getChannels(wid);
      const waChannel = channels.find((channel) => channel.provider === "whatsapp");

      if (!waChannel) {
        return errorResponse("No WhatsApp channel found for this workspace", 404);
      }

      const phoneId = waChannel.metadata.phone_number_id;
      const accessToken = waChannel.credentials.access_token;

      if (!phoneId || !accessToken) {
        return errorResponse("WhatsApp channel credentials incomplete", 400);
      }

      await waService.sendTemplateTestMessage({
        to: phone,
        phoneId,
        accessToken,
        templateName: template.name,
        languageCode: template.languageCode,
        components: template.components,
      });

      return persistFollowUpSuccess();
    } catch (error: any) {
      return persistFollowUpFailed(
        error?.message || "Failed to send follow-up",
      );
    }
  } catch (error: any) {
    return errorResponse(error?.message || "Invalid webhook payload", 400);
  }
}
