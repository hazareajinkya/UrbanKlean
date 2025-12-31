import { v4 } from "uuid";
import { normEmail, normPhone } from "../utils";
import { IChannelProvider } from "./channel";

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
  ip,
}: {
  name?: string;
  email?: string;
  phone?: string;
  externalIds?: IExternalIds;
  sessionId?: string;
  aid?: string;
  ip?: string;
}): IPerson => {
  const emailN = normEmail(email);
  const phoneN = normPhone(phone);

  return {
    id: v4(),
    name: name ?? "",
    emails: emailN ? [{ value: emailN, verified: false }] : [],
    phones: phoneN ? [{ value: phoneN, verified: false }] : [],
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
    identicalPersonIds: [],
    pastSessionIds: sessionId && aid ? [{ aid, sid: sessionId }] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
