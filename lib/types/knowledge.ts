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
    docUrl: string;
    metadata: any;
    chunkSize: number;
    updatedAt: string;
    status: ITrainingStatus;
  }[];
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
