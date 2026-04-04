import { v4 } from "uuid";
import { normEmail, normPhone } from "../utils";
import { IChannelProvider } from "./channel";

export type IFollowUpScheduleInput =
  | {
      type: "once";
      date: string;
      time: string;
    }
  | {
      type: "interval";
      every: number;
      unit: "min" | "hour";
    };

export type IFollowUpStatus = "scheduled" | "sent" | "failed" | "canceled";

export interface IFollowUpTemplateConfig {
  name: string;
  languageCode: string;
  components?: any[];
  previewText?: string;
}

export interface IFollowUpJob {
  id: string;
  type: "once" | "cron";
  providerJobId: string;
  timezone: string;
  phone: string;
  schedule: IFollowUpScheduleInput & { cron?: string; notBefore?: string };
  template: IFollowUpTemplateConfig;
  status: IFollowUpStatus;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  error?: string;
}

export interface IPerson {
  id: string;

  //identity info
  name: string;
  emails: { value: string; verified: boolean }[];
  phones: { value: string; verified: boolean }[];
  ips: string[];

  //external ids like whatsapp, instagram, shopify customer id
  externalIds: IExternalIds;

  //company info
  company: string;
  title: string;
  location: string;

  //tags like vip, high ltv
  tags: string[];

  //interests of users
  interests: string[];

  //insights about conversations and issues about the person
  memories: string[];

  //short all time summary of the person like told by friend
  summary: string;

  //human notes about the person
  notes: string[];

  //prev references to sessions
  pastSessionIds: { aid: string; sid: string }[];

  //ids of people that are identical to this person
  identicalPersonIds: string[];

  metadata?: {
    [key: string]: {
      username?: string[];
      name?: string[];
      profilePic?: string[];
    };
  };

  followUp?: IFollowUpJob[];

  createdAt: string;
  updatedAt: string;
}

export type IExternalIds = { provider: IChannelProvider; id: string }[];
export const generateDefaultPerson = ({
  name,
  email,
  phone,
  externalIds,
  sessionId,
  aid,
  metadata,
  ip,
}: {
  name?: string;
  email?: { value: string; verified: boolean };
  phone?: { value: string; verified: boolean };
  externalIds?: IExternalIds;
  sessionId?: string;
  aid?: string;
  ip?: string;
  metadata?: {
    [key: string]: {
      username?: string[];
      name?: string[];
      profilePic?: string[];
    };
  };
}): IPerson => {
  const emailN = email ? normEmail(email.value) : undefined;
  const phoneN = phone ? normPhone(phone.value) : undefined;

  return {
    id: v4(),
    name: name ?? "",
    emails:
      email && emailN ? [{ value: emailN, verified: email.verified }] : [],
    phones:
      phone && phoneN ? [{ value: phoneN, verified: phone.verified }] : [],
    ips: ip ? [ip] : [],
    externalIds: externalIds ?? [],
    company: "",
    title: "",
    location: "",
    tags: [],
    interests: [],
    memories: [],
    summary: "",
    notes: [],
    metadata: metadata ?? {},
    followUp: [],
    identicalPersonIds: [],
    pastSessionIds: sessionId && aid ? [{ aid, sid: sessionId }] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
