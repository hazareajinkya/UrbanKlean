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

export const usePeopleActions = (wid?: string) => {
  const createPerson = useMutation({
    mutationFn: async ({
      wid: workspaceId,
      name,
      emails,
      phones,
      company,
      title,
      location,
      tags,
      interests,
      notes,
      summary,
    }: {
      wid: string;
      name: string;
      emails?: { value: string; verified: boolean }[];
      phones?: { value: string; verified: boolean }[];
      company?: string;
      title?: string;
      location?: string;
      tags?: string[];
      interests?: string[];
      notes?: string[];
      summary?: string;
    }) => {
      const person = await peopleServiceV2.createPerson({
        wid: workspaceId,
        name,
        emails: emails || [],
        phones: phones || [],
      });

      // Update additional fields after creation
      if (
        company ||
        location ||
        title ||
        tags?.length ||
        interests?.length ||
        notes?.length ||
        summary
      ) {
        await peopleService.replacePersonDetails(workspaceId, person.id, {
          company,
          location,
          title,
          tags,
          interests,
          notes,
          summary,
        });
      }

      return person;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: peopleKey(variables.wid) });
      queryClient.invalidateQueries({
        queryKey: peopleCountKey(variables.wid),
      });

      toast.success("Customer created successfully");
    },
    onError: (error: any) => {
      console.error("Error creating person:", error);
      toast.error("Failed to create customer");
    },
  });

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
    createPerson,
    updatePerson,
    mergePerson,
    notMergePersons,
  };
};
