import { DEFAULT_PROFILE_PIC } from "../constants";
import { ICredit } from "./credit";

export interface IUserWorkspace {
  id: string;
  name: string;
  role: string;
}

export interface IUser {
  id: string;
  email: string;
  name?: string;
  photoUrl?: string;
  workspaces: IUserWorkspace[];
  credit: ICredit;
  lastCreditEmailSent?: string;
  createdAt: string;
  updatedAt: string;
}

export const generateDefaultUser = (): IUser => {
  return {
    id: "",
    email: "",
    name: "",
    photoUrl: DEFAULT_PROFILE_PIC,
    workspaces: [],
    credit: {
      carry: 0,
      quota: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
