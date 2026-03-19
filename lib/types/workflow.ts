import { v4 } from "uuid";

export type IWorkflowType = "internal" | "user" | "app-workflow";
export interface IWorkflow {
  id: string;
  wid: string;
  type: IWorkflowType;
  name: string;
  trigger: string;
  instructions: string;
  appIds?: string[];
  originalId?: string;
  referenceId?: string | null;
  toolIds: string[];
  aids: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const generateDefaultWorkflow = ({
  wid,
  instructions,
  name,
  referenceId,
  toolIds,
  trigger,
  type,
}: {
  wid: string;
  type: IWorkflowType;
  name: string;
  referenceId?: string;
  trigger: string;
  instructions: string;
  toolIds: string[];
}): IWorkflow => {
  return {
    id: v4(),
    wid,
    name,
    referenceId: referenceId || null,
    type,
    aids: [],
    trigger,
    instructions,
    toolIds,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
