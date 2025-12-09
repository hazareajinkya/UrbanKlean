import { v4 } from "uuid";

export interface IFolder {
  id: string;
  wid: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  itemCount: {
    documents: number;
    websites: number;
    texts: number;
    teach: number;
    total: number;
  };
}

export const generateDefaultFolder = (wid: string, name: string): IFolder => {
  return {
    id: v4(),
    wid,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    itemCount: {
      documents: 0,
      websites: 0,
      texts: 0,
      teach: 0,
      total: 0,
    },
  };
};

