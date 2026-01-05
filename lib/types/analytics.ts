import { IChannelProvider } from "./channel";

// 6 time slots, 4 hours each
export interface IPeakHour {
  period: string;
  count: number;
}

export interface IAnalytics {
  date: string;
  totalConversations: number;
  channel: Record<IChannelProvider, number>;
  totalCreditsUsed: number;
  totalTokensUsed: number;
  averageCreditsPerConversation: number;
  totalCost: number;
  averageCostPerConversation: number;
  totalClosedConversations: number;
  resolution: {
    resolved: number;
    "partially-resolved": number;
    unresolved: number;
    escalated: number;
  };
  peakHours: IPeakHour[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface IWorkspaceAnalyticsSummary {
  totalConversations: number;
  totalCreditsUsed: number;
  totalCost: number;
  resolution: {
    resolved: number;
    "partially-resolved": number;
    unresolved: number;
    escalated: number;
  };
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  totalClosedConversations: number;
  totalTokensUsed: number;
  peakHours: IPeakHour[];
  avgCostPerConversation: number;
  avgCreditsPerConversation: number;
  lastUpdated: string;
}
