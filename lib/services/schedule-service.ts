import upstash from "../clients/upstash";
import { coreConf } from "../utils/conf";
import { IFollowUpScheduleInput } from "../types/person";

export type IScheduleCreateResult = {
  type: "once" | "cron";
  id: string;
  meta: Record<string, any>;
};

const toCron = (every: number, unit: "min" | "hour") => {
  if (!Number.isInteger(every) || every <= 0) {
    throw new Error("Invalid interval");
  }

  if (unit === "min") return `*/${every} * * * *`;
  if (unit === "hour") return `0 */${every} * * *`;
  throw new Error("Invalid unit");
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
  const iso = `${date}T${time}:00`;
  const localDate = new Date(iso);

  if (Number.isNaN(localDate.getTime())) {
    throw new Error("Invalid date/time");
  }

  const localAsTzText = localDate.toLocaleString("en-US", {
    timeZone: timezone,
    hour12: false,
  });

  const zonedDate = new Date(localAsTzText);

  if (Number.isNaN(zonedDate.getTime())) {
    throw new Error("Invalid timezone");
  }

  const offsetMs = localDate.getTime() - zonedDate.getTime();
  return new Date(localDate.getTime() + offsetMs).toISOString();
};

const create = async ({
  input,
  payload,
  timezone,
}: {
  input: IFollowUpScheduleInput;
  payload: Record<string, any>;
  timezone: string;
}): Promise<IScheduleCreateResult> => {
  try {
    const url = `${coreConf.baseUrl}/api/followup-webhook`;

    if (input.type === "once") {
      const notBefore = toNotBefore({
        date: input.date,
        time: input.time,
        timezone,
      });

      const notBeforeTimestamp = Math.floor(new Date(notBefore).getTime() / 1000);

      const res = await upstash.publishJSON({
        url,
        body: payload,
        notBefore: notBeforeTimestamp,
      });

      const messageId =
        "messageId" in res
          ? res.messageId
          : (res as any).messageIds?.[0];

      if (!messageId) {
        throw new Error("Failed to get message id from QStash publish response");
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

    if (input.type === "interval") {
      const cron = toCron(input.every, input.unit);

      const res = await upstash.schedules.create({
        destination: url,
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        cron,
      });

      return {
        type: "cron",
        id: res.scheduleId,
        meta: {
          every: input.every,
          unit: input.unit,
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
  toCron,
  toNotBefore,
  create,
  cancel,
};

export default scheduleService;
