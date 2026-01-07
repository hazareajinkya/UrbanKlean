import { DEFAULT_PROFILE_PIC } from "../constants";

export interface IUserWorkspace {
  id: string;
  name: string;
  role: string;
}

export interface ICreditBalance {
  recurring: number;
  purchased: number;
}

export interface IUserSubscription {
  subscriptionId?: string;
  customerId?: string;
  planId?: string;
  tierId?: string;
  paddlePriceId?: string;
  razorpayPlanId?: string;
  status?: "active" | "canceled" | "past_due" | "paused" | "trialing";
  recurringQuota?: number;
  trialEndsAt?: string;
  trialUsed?: boolean;
  startedAt?: string;
  renewsAt?: string;
  canceledAt?: string;
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
