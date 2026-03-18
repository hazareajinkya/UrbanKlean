import userService from "@/lib/services/user-service";
import workspaceService from "@/lib/services/workspace-service";
import type { IUser } from "@/lib/types/user";

type CreditsSource = "user" | "workspace";

export interface CreditsTotals {
  planRecurringQuota: number;
  totalCredits: number;
  remainingCredits: number;
  recurringRemaining: number;
  purchasedRemaining: number;
  usedCredits: number;
  usedPercentage: number;
  remainingPercentage: number;
}

export interface CreditsResponse {
  source: CreditsSource;
  ownerId: string;
  user: IUser;
  totals: CreditsTotals;
}

const toNumber = (value: number | null | undefined) => Number(value) || 0;

const creditsService = {
  async getCredits(args: {
    userEmail?: string;
    wid?: string;
  }): Promise<CreditsResponse | null> {
    const userEmail = args.userEmail?.trim();
    let resolvedEmail = userEmail ?? "";
    let source: CreditsSource = "user";

    if (!resolvedEmail && args.wid) {
      const workspace = await workspaceService.fetchWorkspace(args.wid);
      resolvedEmail = workspace?.ownerId ?? "";
      source = "workspace";
    }

    if (!resolvedEmail) {
      return null;
    }

    const user = await userService.getUser(resolvedEmail);
    if (!user) {
      return null;
    }

    const recurringRemaining = toNumber(user.credit?.recurring);
    const purchasedRemaining = toNumber(user.credit?.purchased);
    const planRecurringQuota = toNumber(user.subscription?.recurringQuota);
    const totalCredits = planRecurringQuota;
    const remainingCredits = recurringRemaining + purchasedRemaining;
    const usedCredits = Math.max(0, totalCredits - remainingCredits);
    const denominator = totalCredits > 0 ? totalCredits : 0;
    const usedPercentage =
      denominator > 0 ? (usedCredits / denominator) * 100 : 0;
    const remainingPercentage =
      denominator > 0 ? (remainingCredits / denominator) * 100 : 0;

    return {
      source,
      ownerId: resolvedEmail,
      user,
      totals: {
        planRecurringQuota,
        totalCredits,
        remainingCredits,
        recurringRemaining,
        purchasedRemaining,
        usedCredits,
        usedPercentage,
        remainingPercentage,
      },
    };
  },
};

export default creditsService;
