import { NextRequest } from "next/server";
import channelService from "@/lib/services/channel-service";
import waService from "@/lib/services/whatsapp/wa-service";
import {
  errorResponse,
  successResponse,
  validateBody,
} from "@/lib/types/api-response";
import { z } from "zod";

const WaTemplateComponentSchema = z.object({
  type: z.enum(["HEADER", "BODY", "FOOTER", "BUTTONS"]),
  format: z.string().optional(),
  text: z.string().optional(),
  example: z.any().optional(),
  buttons: z.array(z.any()).optional(),
});

const CreateTemplateSchema = z.object({
  wid: z.string().min(1, "wid is required"),
  name: z.string().min(1, "name is required"),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
  language: z.string().min(1, "language is required"),
  parameter_format: z.enum(["NAMED", "POSITIONAL"]).optional(),
  components: z.array(WaTemplateComponentSchema),
});

const EditTemplateSchema = z.object({
  wid: z.string().min(1, "wid is required"),
  templateId: z.string().min(1, "templateId is required"),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]).optional(),
  components: z.array(WaTemplateComponentSchema),
});
export async function GET(req: NextRequest) {
  try {
    const wid = req.nextUrl.searchParams.get("wid");
    if (!wid) return errorResponse("wid is required", 400);

    const channels = await channelService.getChannels(wid);
    const waChannel = channels.find((c) => c.provider === "whatsapp");
    if (!waChannel)
      return errorResponse("No WhatsApp channel found for this workspace", 404);

    const wabaId = waChannel.metadata.waba_id;
    const accessToken = waChannel.credentials.access_token;
    if (!wabaId || !accessToken)
      return errorResponse("WhatsApp channel credentials incomplete", 400);

    const sync = req.nextUrl.searchParams.get("sync") === "true";

    const templates = await waService.getTemplates({ wid, wabaId });

    if (sync || templates.length === 0) {
      const metaTemplates = await waService.getMetaTemplates({
        wabaId,
        accessToken,
      });

      if (sync && templates.length > 0) {
        await waService.deleteAllTemplates({ wid, wabaId });
      }

      await waService.saveTemplatesBatch({
        wid,
        wabaId,
        templates: metaTemplates,
      });
      return successResponse(
        metaTemplates,
        "Templates fetched and synced successfully",
      );
    }

    return successResponse(
      templates,
      "Templates fetched from local DB successfully",
    );
  } catch (error: any) {
    console.error("Error fetching templates:", error);
    return errorResponse(error?.message || "Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { wid, name, category, language, components } = await validateBody(
      req,
      CreateTemplateSchema,
    );

    const channels = await channelService.getChannels(wid);
    const waChannel = channels.find((c) => c.provider === "whatsapp");
    if (!waChannel)
      return errorResponse("No WhatsApp channel found for this workspace", 404);

    const wabaId = waChannel.metadata.waba_id;
    const accessToken = waChannel.credentials.access_token;
    if (!wabaId || !accessToken)
      return errorResponse("WhatsApp channel credentials incomplete", 400);

    const result = await waService.createMetaTemplate({
      wabaId,
      accessToken,
      templateData: { name, category, language, components },
    });

    await waService.saveTemplate({
      wid,
      template: {
        id: result.id,
        name,
        category,
        language,
        status: "PENDING",
        components,
        wabaId,
        wid,
      },
    });

    return successResponse(result, "Template created and synced successfully");
  } catch (error: any) {
    console.error("Error creating template:", error);
    const metaMessage = error?.response?.data?.error?.message || error?.message;
    return errorResponse(metaMessage || "Failed to create template", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { wid, templateId, category, components } = await validateBody(
      req,
      EditTemplateSchema,
    );

    const channels = await channelService.getChannels(wid);
    const waChannel = channels.find((c) => c.provider === "whatsapp");
    if (!waChannel)
      return errorResponse("No WhatsApp channel found for this workspace", 404);

    const wabaId = waChannel.metadata.waba_id;
    const accessToken = waChannel.credentials.access_token;
    if (!wabaId || !accessToken)
      return errorResponse("WhatsApp channel credentials incomplete", 400);

    const templateData: any = { components };
    if (category) {
      templateData.category = category;
    }

    const result = await waService.editMetaTemplate({
      templateId,
      accessToken,
      templateData,
    });

    await waService.updateTemplate({
      wid,
      templateId,
      components,
      category,
    });

    return successResponse(result, "Template updated successfully");
  } catch (error: any) {
    console.error("Error updating template:", error);
    const metaMessage = error?.response?.data?.error?.message || error?.message;
    return errorResponse(metaMessage || "Failed to edit template", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const wid = req.nextUrl.searchParams.get("wid");
    const templateName = req.nextUrl.searchParams.get("templateName");

    if (!wid) return errorResponse("wid is required", 400);
    if (!templateName) return errorResponse("templateName is required", 400);

    const channels = await channelService.getChannels(wid);
    const waChannel = channels.find((c) => c.provider === "whatsapp");
    if (!waChannel)
      return errorResponse("No WhatsApp channel found for this workspace", 404);

    const wabaId = waChannel.metadata.waba_id;
    const accessToken = waChannel.credentials.access_token;
    if (!wabaId || !accessToken)
      return errorResponse("WhatsApp channel credentials incomplete", 400);

    const result = await waService.deleteMetaTemplate({
      wabaId,
      accessToken,
      templateName,
    });

    await waService.deleteTemplateByName({ wid, templateName });

    return successResponse(result, "Template deleted and synced successfully");
  } catch (error: any) {
    console.error("Error deleting template:", error);
    const metaMessage = error?.response?.data?.error?.message || error?.message;
    return errorResponse(metaMessage || "Failed to delete template", 500);
  }
}
