import { useMutation } from "@tanstack/react-query";
import peopleService from "@/lib/services/people-service";
import peopleServiceV2 from "@/lib/services/people-service-v2";
import { toast } from "sonner";
import { IPerson } from "@/lib/types/person";
import queryClient from "@/lib/clients/query-client";
import {
  peopleCountKey,
  peopleKey,
  allIdenticalPersonsKey,
} from "./use-people";
import { mergeService } from "@/lib/services/merge-service";

export const usePeopleActions = () => {
  const updatePerson = useMutation({
    mutationFn: async ({
      wid,
      personId,
      updates,
    }: {
      wid: string;
      personId: string;
      updates: Partial<IPerson>;
    }) => {
      return await peopleService.replacePersonDetails(wid, personId, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: peopleKey(variables.wid) });
      queryClient.invalidateQueries({
        queryKey: peopleCountKey(variables.wid),
      });

      toast.success("Customer updated successfully");
    },
    onError: (error: any) => {
      console.error("Error updating person:", error);
      toast.error("Failed to update customer");
    },
  });

  const mergePerson = useMutation({
    mutationFn: async ({
      wid,
      personAId,
      personBId,
    }: {
      wid: string;
      personAId: string;
      personBId: string;
    }) => {
      return await peopleServiceV2.directMergePerson({
        wid,
        personAId,
        personBId,
      });
    },
    onSuccess: (mergedPerson, variables) => {
      queryClient.invalidateQueries({
        queryKey: peopleKey(variables.wid),
      });
      queryClient.invalidateQueries({
        queryKey: peopleCountKey(variables.wid),
      });
      queryClient.invalidateQueries({
        queryKey: allIdenticalPersonsKey(variables.wid),
      });

      toast.success("Persons merged successfully");
      return mergedPerson;
    },
    onError: (error: any) => {
      console.error("Error merging persons:", error);
      toast.error(error?.message || "Failed to merge persons");
    },
  });

  const notMergePersons = useMutation({
    mutationFn: async ({
      wid,
      personAId,
      personBId,
    }: {
      wid: string;
      personAId: string;
      personBId: string;
    }) => {
      return await mergeService.notMergePersons(wid, personAId, personBId);
    },
    onSuccess: (_, variables) => {
      toast.success("Persons not merged successfully");
      queryClient.invalidateQueries({
        queryKey: allIdenticalPersonsKey(variables.wid),
      });
      queryClient.invalidateQueries({
        queryKey: peopleCountKey(variables.wid),
      });
    },
    onError: (error: any) => {
      console.error("Error not merging persons:", error);
      toast.error(error?.message || "Failed to not merge persons");
    },
  });

  return {
    updatePerson,
    mergePerson,
    notMergePersons,
  };
};
