export type FirebaseAnalyticsEvent =
  | "page_view"
  | "sign_up"
  | "login"
  | "workspace_created"
  | "workspace_switched"
  | "agent_created"
  | "agent_updated"
  | "conversation_started"
  | "conversation_closed"
  | "template_sent"
  | "knowledge_base_updated"
  | "plan_upgraded"
  | "plan_downgraded"
  | "onboarding_completed"
  | "feature_used";

export interface FirebaseAnalyticsUserProperties {
  workspace_id?: string;
  plan_type?: string;
  user_role?: string;
  [key: string]: string | number | boolean | undefined;
}
