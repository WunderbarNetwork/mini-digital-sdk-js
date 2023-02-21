export interface AnalyticsEvent {
  eventId: string;
  eventName: string;
  timestamp: string;
  contractId: string;
  contractVersion: string;
  rootAccountId: string;
  authorId?: string;
  eventCategory: "page_view_event" | "user_outcome_event";
  entityId?: string;
  entityType?: string;
  action?: string;
  eventSource: string;
  eventProperties?: any;
}
