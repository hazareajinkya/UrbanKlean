import { DEFAULT_PROFILE_PIC } from "../constants";

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
