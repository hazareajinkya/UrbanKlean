import workflowService from "@/lib/services/workflow-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const workflowKey = (wid: string, workflowId: string) => [
  "workflows",
  wid,
  workflowId,
];
export const workflowsKey = (wid: string) => ["workflows", wid];

export const useWorkflows = (wid: string) => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: workflowsKey(wid),
    queryFn: () =>
      workflowService.getWorkflows(wid).then((workflows) => {
        workflows.map((workflow) =>
          qc.setQueryData(workflowKey(wid, workflow.id), workflow),
        );
        return workflows;
      }),
    enabled: !!wid,
  });

  return {
    workflows: query.data,
    ...query,
  };
};

export const useWorkflow = (wid: string, workflowId: string) => {
  const query = useQuery({
    queryKey: workflowKey(wid, workflowId),
    queryFn: () => workflowService.getWorkflow(wid, workflowId),
    enabled: !!wid && !!workflowId,
  });

  return {
    workflow: query.data,
    ...query,
  };
};
