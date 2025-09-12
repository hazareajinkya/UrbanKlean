import { v4 } from "uuid";

export interface IWorkflow {
  id: string;
  name: string;
  trigger: string;
  instructions: string;
  aid: string;
  wid: string;
  toolIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const generateDefaultWorkflow = (
  wid: string,
  aid: string,
  name: string,
  trigger: string,
  instructions: string,
  toolIds: string[]
): IWorkflow => {
  return {
    id: v4(),
    name,
    trigger,
    instructions,
    aid,
    wid,
    toolIds,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
