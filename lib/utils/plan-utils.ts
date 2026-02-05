import { IWorkspace } from "../types/workspace";
import { IUser, IPlanId, IUserSubscription } from "../types/user";

const activeStatuses: IUserSubscription["status"][] = ["active", "trialing"];

export const hasActiveSubscription = (user?: IUser | null): boolean => {
  const planId = user?.subscription?.planId;
  if (!planId || planId === "none") return false;
  return activeStatuses.includes(user?.subscription?.status);
};

export const isWorkspacePlanActive = (
  workspace?: IWorkspace | null
): boolean => {
  if (!workspace) return false;
  return workspace.planId !== "none";
};
