import { NextRequest } from "next/server";
import { z } from "zod";
import { v4 } from "uuid";
import {
  errorResponse,
  successResponse,
  validateBody,
} from "@/lib/types/api-response";
import peopleService from "@/lib/services/people-service";
import scheduleService, {
  IFollowUpWebhookPayload,
} from "@/lib/services/schedule-service";
import {
  IFollowUpJob,
  IFollowUpScheduleInput,
  IFollowUpTemplateConfig,
  IPerson,
} from "@/lib/types/person";

const zScheduleInput = z.union([
  z.object({
    type: z.literal("once"),
    date: z.string().min(1, "date is required"),
    time: z.string().min(1, "time is required"),
  }),
  z.object({
    type: z.literal("cron"),
    cron: z
      .string()
      .trim()
      .min(1, "cron is required")
      .refine((value) => value.split(/\s+/).length === 5, {
        message: "cron must have 5 parts",
      }),
  }),
]);

const zTemplate = z.object({
  name: z.string().min(1, "template name is required"),
  languageCode: z.string().min(1, "languageCode is required"),
  components: z.array(z.any()).optional(),
  previewText: z.string().optional(),
});

const zCreateFollowUp = z.object({
  wid: z.string().min(1, "wid is required"),
  personId: z.string().min(1, "personId is required"),
  phone: z.string().min(1, "phone is required"),
  timezone: z.string().min(1, "timezone is required"),
  isOnTest: z.boolean().optional().default(false),
  template: zTemplate.nullable().optional(),
  schedule: zScheduleInput,
});

const zUpdateFollowUp = z.object({
  wid: z.string().min(1, "wid is required"),
  personId: z.string().min(1, "personId is required"),
  followUpId: z.string().min(1, "followUpId is required"),
  phone: z.string().min(1, "phone is required"),
  timezone: z.string().min(1, "timezone is required"),
  isOnTest: z.boolean().optional().default(false),
  template: zTemplate.nullable().optional(),
  schedule: zScheduleInput,
});

const zCancelFollowUp = z.object({
  wid: z.string().min(1, "wid is required"),
  personId: z.string().min(1, "personId is required"),
  followUpId: z.string().min(1, "followUpId is required"),
});

const getFollowUps = (person: IPerson) => {
  return Array.isArray(person.followUp) ? person.followUp : [];
};

const buildFollowUpJob = ({
  followUpId,
  phone,
  timezone,
  isOnTest,
  template,
  schedule,
  scheduleResult,
}: {
  followUpId: string;
  phone: string;
  timezone: string;
  isOnTest: boolean;
  template: IFollowUpTemplateConfig | null;
  schedule: IFollowUpScheduleInput;
  scheduleResult: {
    type: "once" | "cron";
    id: string;
    meta: Record<string, any>;
  };
}): IFollowUpJob => {
  const now = new Date().toISOString();

  return {
    id: followUpId,
    type: scheduleResult.type,
    providerJobId: scheduleResult.id,
    timezone,
    phone,
    schedule:
      schedule.type === "once"
        ? {
            type: "once",
            date: schedule.date,
            time: schedule.time,
            notBefore: scheduleResult.meta.notBefore,
          }
        : {
            type: "cron",
            cron: scheduleResult.meta.cron,
          },
    template,
    status: "scheduled",
    createdAt: now,
    updatedAt: now,
  };
};

const buildWebhookPayload = ({
  wid,
  personId,
  followUpId,
  phone,
  timezone,
  schedule,
  isOnTest,
  template,
}: {
  wid: string;
  personId: string;
  followUpId: string;
  phone: string;
  timezone: string;
  schedule: IFollowUpScheduleInput;
  isOnTest: boolean;
  template: IFollowUpTemplateConfig | null;
}) => {
  const payload: IFollowUpWebhookPayload = {
    wid,
    personId,
    followUpId,
    phone,
    timezone,
    isOnTest,
    scheduleType: schedule.type,
    template,
  };

  return payload;
};

export async function POST(req: NextRequest) {
  try {
    const { wid, personId, phone, timezone, isOnTest, template, schedule } =
      await validateBody(req, zCreateFollowUp);

    const person = await peopleService.getPerson(wid, personId);

    if (!person) {
      return errorResponse("Person not found", 404);
    }

    const effectiveIsOnTest = scheduleService.isOnTesting || isOnTest;
    const resolvedTemplate: IFollowUpTemplateConfig | null = effectiveIsOnTest
      ? null
      : (template ?? null);
    if (!effectiveIsOnTest && !resolvedTemplate) {
      return errorResponse(
        "Template is required when test mode is disabled",
        400,
      );
    }

    const followUpId = v4();
    const scheduleResult = await scheduleService.create({
      input: schedule,
      timezone,
      payload: buildWebhookPayload({
        wid,
        personId,
        followUpId,
        phone,
        timezone,
        schedule,
        isOnTest: effectiveIsOnTest,
        template: resolvedTemplate,
      }),
    });

    const nextJob = buildFollowUpJob({
      followUpId,
      phone,
      timezone,
      isOnTest: effectiveIsOnTest,
      template: resolvedTemplate,
      schedule,
      scheduleResult,
    });

    const existingFollowUps = getFollowUps(person);
    const followUp = [...existingFollowUps, nextJob];

    const updatedPerson = await peopleService.update({
      wid,
      personId,
      updates: {
        followUp,
        updatedAt: new Date().toISOString(),
      },
    });

    return successResponse({
      followUp: nextJob,
      person: updatedPerson,
      schedule: {
        type: scheduleResult.type,
        id: scheduleResult.id,
        meta: scheduleResult.meta,
      },
    });
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to create follow-up", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const {
      wid,
      personId,
      followUpId,
      phone,
      timezone,
      isOnTest,
      template,
      schedule,
    } = await validateBody(req, zUpdateFollowUp);
    const effectiveIsOnTest = scheduleService.isOnTesting || isOnTest;
    const resolvedTemplate: IFollowUpTemplateConfig | null = effectiveIsOnTest
      ? null
      : (template ?? null);
    if (!effectiveIsOnTest && !resolvedTemplate) {
      return errorResponse(
        "Template is required when test mode is disabled",
        400,
      );
    }

    const person = await peopleService.getPerson(wid, personId);

    if (!person) {
      return errorResponse("Person not found", 404);
    }

    const existingFollowUps = getFollowUps(person);
    const targetFollowUp = existingFollowUps.find(
      (item) => item.id === followUpId,
    );

    if (!targetFollowUp) {
      return errorResponse("Follow-up not found", 404);
    }

    if (targetFollowUp.status === "scheduled") {
      await scheduleService.cancel({
        job: {
          type: targetFollowUp.type,
          id: targetFollowUp.providerJobId,
        },
      });
    }

    const scheduleResult = await scheduleService.create({
      input: schedule,
      timezone,
      payload: buildWebhookPayload({
        wid,
        personId,
        followUpId,
        phone,
        timezone,
        schedule,
        isOnTest: effectiveIsOnTest,
        template: resolvedTemplate,
      }),
    });

    const replacement = buildFollowUpJob({
      followUpId,
      phone,
      timezone,
      isOnTest: effectiveIsOnTest,
      template: resolvedTemplate,
      schedule,
      scheduleResult,
    });

    replacement.createdAt = targetFollowUp.createdAt;

    const followUp = existingFollowUps.map((item) =>
      item.id === followUpId ? replacement : item,
    );

    const updatedPerson = await peopleService.update({
      wid,
      personId,
      updates: {
        followUp,
        updatedAt: new Date().toISOString(),
      },
    });

    return successResponse({
      followUp: replacement,
      person: updatedPerson,
      schedule: {
        type: scheduleResult.type,
        id: scheduleResult.id,
        meta: scheduleResult.meta,
      },
    });
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to update follow-up", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { wid, personId, followUpId } = await validateBody(
      req,
      zCancelFollowUp,
    );

    const person = await peopleService.getPerson(wid, personId);

    if (!person) {
      return errorResponse("Person not found", 404);
    }

    const existingFollowUps = getFollowUps(person);
    const targetFollowUp = existingFollowUps.find(
      (item) => item.id === followUpId,
    );

    if (!targetFollowUp) {
      return errorResponse("Follow-up not found", 404);
    }

    if (targetFollowUp.status === "scheduled") {
      await scheduleService.cancel({
        job: {
          type: targetFollowUp.type,
          id: targetFollowUp.providerJobId,
        },
      });
    }

    const now = new Date().toISOString();
    const followUp = existingFollowUps.map((item) => {
      if (item.id !== followUpId) {
        return item;
      }

      return {
        ...item,
        status: "canceled" as const,
        updatedAt: now,
      };
    });

    const updatedPerson = await peopleService.update({
      wid,
      personId,
      updates: {
        followUp,
        updatedAt: now,
      },
    });

    return successResponse({ person: updatedPerson });
  } catch (error: any) {
    return errorResponse(error?.message || "Failed to cancel follow-up", 500);
  }
}
