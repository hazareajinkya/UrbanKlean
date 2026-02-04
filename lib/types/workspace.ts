import { v4 } from "uuid";
import { getTagsForIndustry } from "../utils/industry-tags";
import { IWorkspaceAnalyticsSummary } from "./analytics";
import { PLANS } from "../plans";
import { IPlanId } from "./user";

export type IWorkspaceType = "onboarding" | "default";
export interface IWorkspaceInfo {
  email: string;
  tagline: string;
  industry: string;
  businessType: string;
  description: string;
  toneGuidelines: string;
  targetAudience: string;
  primaryColor: string;
  logo: string;
  offerings: string;
  differentiators: string;
}
export interface IWorkspace {
  id: string;
  name: string;
  oneLiner: string;
  domains: string[];
  ownerId: string;
  folders: { id: string; name: string }[];
  availableTags: string[];
  type: IWorkspaceType;
  info: IWorkspaceInfo;
  analytics?: IWorkspaceAnalyticsSummary;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
  planId: IPlanId;
}

export const generateDefaultWorkspace = (): IWorkspace => {
  const id = v4();
  return {
    id: id,
    name: "",
    oneLiner: "",
    ownerId: "",
    folders: [],
    availableTags: getTagsForIndustry(),
    domains: [],
    planId: "none",
    info: {
      businessType: "",
      description: "",
      email: "",
      industry: "",
      tagline: "",
      toneGuidelines: "",
      targetAudience: "",
      primaryColor: "",
      logo: "",
      offerings: "",
      differentiators: "",
    },
    type: "default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };
};
