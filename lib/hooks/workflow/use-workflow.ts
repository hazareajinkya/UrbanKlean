import workflowService from "@/lib/services/workflow-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const workflowKey = (aid: string, workflowId: string) => [
  "workflows",
  aid,
  workflowId,
];
export const workflowsKey = (aid: string) => ["workflows", aid];

export const useWorkflows = (aid: string) => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: workflowsKey(aid),
    queryFn: () =>
      workflowService.getWorkflows(aid).then((workflows) => {
        workflows.map((workflow) =>
          qc.setQueryData(workflowKey(aid, workflow.id), workflow)
        );
        return workflows;
      }),
  });

  return {
    workflows: query.data,
    ...query,
  };
};

export const useWorkflow = (aid: string, workflowId: string) => {
  const query = useQuery({
    queryKey: workflowKey(aid, workflowId),
    queryFn: () => workflowService.getWorkflow(aid, workflowId),
  });

  return {
    workflow: query.data,
    ...query,
  };
};
