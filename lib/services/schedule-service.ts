import upstash from "../clients/upstash";
import { coreConf } from "../utils/conf";
import {
  IFollowUpScheduleInput,
  IFollowUpTemplateConfig,
} from "../types/person";

export type IScheduleCreateResult = {
  type: "once" | "cron";
  id: string;
  meta: Record<string, any>;
};

export type IFollowUpWebhookPayload = {
  wid: string;
  personId: string;
  followUpId: string;
  phone: string;
  timezone: string;
  scheduleType: "once" | "cron";
  isOnTest: boolean;
  template: IFollowUpTemplateConfig | null;
};

export const isOnTesting = false;

const validateCronExpression = (cron: string) => {
  const value = cron.trim();
  const parts = value.split(/\s+/);
  if (parts.length !== 5) {
    throw new Error("Cron expression must have 5 parts.");
  }
  return value;
};

const toNotBefore = ({
  date,
  time,
  timezone,
}: {
  date: string;
  time: string;
  timezone: string;
}) => {
  const [year, month, day] = date.split("-").map((part) => Number(part));
  const [hour, minute] = time.split(":").map((part) => Number(part));

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  ) {
    throw new Error("Invalid date/time");
  }

  new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());

  const getTzOffsetMs = (timestampMs: number) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date(timestampMs));
    const map = Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );

    const asUtc = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second),
    );

    return asUtc - timestampMs;
  };

  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const initialOffset = getTzOffsetMs(naiveUtc);
  let correctedTimestamp = naiveUtc - initialOffset;
  const correctedOffset = getTzOffsetMs(correctedTimestamp);

  if (correctedOffset !== initialOffset) {
    correctedTimestamp = naiveUtc - correctedOffset;
  }

  return new Date(correctedTimestamp).toISOString();
};

const create = async ({
  input,
  payload,
  timezone,
}: {
  input: IFollowUpScheduleInput;
  payload: IFollowUpWebhookPayload;
  timezone: string;
}): Promise<IScheduleCreateResult> => {
  try {
    const url = `${coreConf.baseUrl}/api/followup-webhook`;
    const resolvedPayload: IFollowUpWebhookPayload = isOnTesting
      ? {
          ...payload,
          isOnTest: true,
          template: null,
        }
      : payload;

    if (input.type === "once") {
      const notBefore = toNotBefore({
        date: input.date,
        time: input.time,
        timezone,
      });

      const notBeforeTimestamp = Math.floor(
        new Date(notBefore).getTime() / 1000,
      );
      const nowTimestamp = Math.floor(Date.now() / 1000);

      if (notBeforeTimestamp <= nowTimestamp) {
        throw new Error("One-time schedule must be in the future");
      }

      const res = await upstash.publishJSON({
        url,
        body: resolvedPayload,
        notBefore: notBeforeTimestamp,
      });

      const messageId =
        "messageId" in res ? res.messageId : (res as any).messageIds?.[0];

      if (!messageId) {
        throw new Error(
          "Failed to get message id from QStash publish response",
        );
      }

      return {
        type: "once",
        id: messageId,
        meta: {
          date: input.date,
          time: input.time,
          timezone,
          notBefore,
        },
      };
    }

    if (input.type === "cron") {
      const cron = validateCronExpression(input.cron);

      const res = await upstash.schedules.create({
        destination: url,
        body: JSON.stringify(resolvedPayload),
        headers: {
          "Content-Type": "application/json",
        },
        cron,
      });

      return {
        type: "cron",
        id: res.scheduleId,
        meta: {
          cron,
          timezone,
        },
      };
    }

    throw new Error("Invalid schedule type");
  } catch (error) {
    console.error("Error creating schedule:", error);
    throw error;
  }
};

const cancel = async ({
  job,
}: {
  job: { type: "once" | "cron"; id: string };
}) => {
  try {
    if (job.type === "once") {
      await upstash.messages.delete(job.id);
      return;
    }

    await upstash.schedules.delete(job.id);
  } catch (error) {
    console.error("Error canceling schedule:", error);
    throw error;
  }
};

const scheduleService = {
  isOnTesting,
  toNotBefore,
  create,
  cancel,
};

export default scheduleService;
