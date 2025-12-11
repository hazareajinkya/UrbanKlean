import { v4 } from "uuid";

export interface IFolder {
  id: string;
  wid: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const generateDefaultFolder = (wid: string, name: string): IFolder => {
  return {
    id: v4(),
    wid,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
