import { v4 } from "uuid";

export type ITrainingStatus = "pending" | "trained" | "failed";

export interface ITextKnowledge {
  id: string;
  wid: string;
  points: string[];
  chunkSize: number;
  content: string;
  updatedAt: string;
  status: ITrainingStatus;
}

export interface IPdfKnowledge {
  files: {
    id: string;
    wid: string;
    docName: string;
    points: string[];
    docUrl: string;
    metadata: any;
    chunkSize: number;
    updatedAt: string;
    status: ITrainingStatus;
  }[];
}

export interface IWebKnowledge {
  urls: {
    id: string;
    wid: string;
    title: string;
    url: string;
    points: string[];
    updatedAt: string;
    status: ITrainingStatus;
  }[];
  chunkSize: number;
  updatedAt: string;
}

export interface IWebPropsMetadata {
  url: string;
  title: string;
}

export const generateDefaultTextKnowledge = (
  wid: string,
  points: string[],
  content: string,
  chunkSize: number
): ITextKnowledge => {
  return {
    id: v4(),
    wid,
    points,
    chunkSize,
    content,
    updatedAt: new Date().toISOString(),
    status: "trained",
  };
};

export const generateDefaultPdfKnowledge = (
  wid: string,
  points: string[],
  chunkSize: number
): IPdfKnowledge["files"][number] => {
  return {
    id: v4(),
    wid,
    points,
    docName: "",
    docUrl: "",
    metadata: null,
    chunkSize,
    updatedAt: new Date().toISOString(),
    status: "trained",
  };
};

export const generateDefaultWebKnowledge = (
  wid: string,
  title: string,
  url: string,
  points: string[]
): IWebKnowledge["urls"][number] => {
  return {
    id: v4(),
    wid,
    title,
    url,
    points,
    updatedAt: new Date().toISOString(),
    status: "trained",
  };
};
