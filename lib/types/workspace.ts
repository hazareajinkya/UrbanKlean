import { v4 } from "uuid";
import { getTagsForIndustry } from "../utils/industry-tags";

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
}
export interface IWorkspace {
  id: string;
  name: string;
  oneLiner: string;
  domains: string[];
  thumbnail: string;
  ownerId: string;
  folders: { id: string; name: string }[];
  availableTags: string[];
  type: IWorkspaceType;
  info: IWorkspaceInfo;
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
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
    },
    type: "default",
    thumbnail: getRandomThumbnail(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  };
};

const getRandomThumbnail = () => {
  const randomNumber = Math.floor(Math.random() * 21);
  return `https://firebasestorage.googleapis.com/v0/b/algotify-972f2.firebasestorage.app/o/3d-abstract%2F3d-abs-${randomNumber}-min.png?alt=media&token=d73ec356-39ee-4c0f-88a3-403608a18398`;
};
