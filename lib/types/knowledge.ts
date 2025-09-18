import { v4 } from "uuid";

export type ITrainingStatus = "pending" | "trained" | "failed" | "training";

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
  id: string;
  wid: string;
  title: string;
  urls: {
    url: string;
    title: string;
  }[];
  points: string[];
  baseUrl: string;
  updatedAt: string;
  status: ITrainingStatus;
  chunkSize: number;
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
  id: string,
  wid: string,
  title: string,
  baseUrl: string,
  urls: {
    url: string;
    title: string;
  }[],
  chunkSize: number,
  points: string[]
): IWebKnowledge => {
  return {
    id,
    wid,
    title,
    baseUrl,
    urls,
    points,
    updatedAt: new Date().toISOString(),
    status: "trained",
    chunkSize,
  };
};
