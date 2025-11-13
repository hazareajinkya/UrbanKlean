import { v4 } from "uuid";
import { normEmail, normPhone } from "../utils";

export interface IPerson {
  id: string;

  //identity info
  name: string;
  emails: string[];
  phones: string[];

  //external ids like whatsapp, instagram, shopify customer id
  externalIds: Record<string, string>;

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
  pastSessionIds: string[];

  createdAt: string;
  updatedAt: string;
}

export const generateDefaultPerson = ({
  name,
  email,
  phone,
  externalIds,
  sessionId,
}: {
  name?: string;
  email?: string;
  phone?: string;
  externalIds?: Record<string, string>;
  sessionId?: string;
}): IPerson => {
  const emailN = normEmail(email);
  const phoneN = normPhone(phone);

  return {
    id: v4(),
    name: name ?? "",
    emails: emailN ? [emailN] : [],
    phones: phoneN ? [phoneN] : [],
    externalIds: externalIds ?? {},
    company: "",
    title: "",
    location: "",
    tags: [],
    interests: [],
    memories: [],
    summary: "",
    notes: [],
    pastSessionIds: sessionId ? [sessionId] : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
