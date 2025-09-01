import { v4 } from "uuid";

export interface IWorkspace {
  id: string;
  name: string;
  thumbnail: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export const generateDefaultWorkspace = (): IWorkspace => {
  const id = v4();
  return {
    id: id,
    name: "",
    ownerId: "",
    thumbnail: getRandomThumbnail(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const getRandomThumbnail = () => {
  const randomNumber = Math.floor(Math.random() * 21);
  return `https://firebasestorage.googleapis.com/v0/b/algotify-972f2.firebasestorage.app/o/3d-abstract%2F3d-abs-${randomNumber}-min.png?alt=media&token=d73ec356-39ee-4c0f-88a3-403608a18398`;
};
