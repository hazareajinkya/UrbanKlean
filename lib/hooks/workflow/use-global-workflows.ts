import workflowService from "@/lib/services/workflow-service";
import { useQuery } from "@tanstack/react-query";

export const globalWorkflowsKey = () => ["global-workflows"];

export const useGlobalWorkflows = () => {
  const query = useQuery({
    queryKey: globalWorkflowsKey(),
    queryFn: () => workflowService.getGlobalWorkflows(),
  });

  return {
    globalWorkflows: query.data,
    ...query,
  };
};
