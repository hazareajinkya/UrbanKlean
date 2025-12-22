import folderService from "@/lib/services/folder-service";
import { useQuery } from "@tanstack/react-query";

export const foldersKey = (wid: string) => ["folders", wid];
export const folderKey = (wid: string, folderId: string) => [
  "folder",
  wid,
  folderId,
];

export const useFolders = (wid: string) => {
  return useQuery({
    queryKey: foldersKey(wid),
    queryFn: () => folderService.getFolders(wid),
    enabled: Boolean(wid),
  });
};

export const useFolder = (wid: string, folderId: string) => {
  return useQuery({
    queryKey: folderKey(wid, folderId),
    queryFn: () => folderService.getFolder(wid, folderId),
    enabled: Boolean(wid) && Boolean(folderId),
  });
};
