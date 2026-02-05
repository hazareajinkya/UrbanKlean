import { DEFAULT_PROFILE_PIC } from "../constants";
import { PLANS } from "../plans";

export interface IUserWorkspace {
  id: string;
  name: string;
  role: string;
}

export interface ICreditBalance {
  recurring: number;
  purchased: number;
}

export type IPlanId = "none" | keyof typeof PLANS;

export interface IUserSubscription {
  subscriptionId?: string;
  customerId?: string;
  planId?: IPlanId;
  tierId?: string;
  razorpayPlanId?: string;
  polarSubscriptionId?: string;
  status?: "active" | "canceled" | "past_due" | "paused" | "trialing";
  recurringQuota?: number;
  trialEndsAt?: string;
  trialUsed?: boolean;
  startedAt?: string;
  renewsAt?: string;
  canceledAt?: string;
  canceledAtPeriodEnd?: boolean;
  lastPaymentAt?: string;
  nextPaymentAt?: string;
}

export interface IUser {
  id: string;
  email: string;
  name?: string;
  photoUrl?: string;
  workspaces: IUserWorkspace[];
  credit: ICreditBalance;
  subscription?: IUserSubscription;
  lastCreditEmailSent?: string;
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
    credit: {
      recurring: 0,
      purchased: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
