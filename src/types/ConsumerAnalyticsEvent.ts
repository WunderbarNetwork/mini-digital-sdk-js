import type { AnalyticsEvent } from "./AnalyticsEvent.js";

export type ConsumerAnalyticsEvent = Pick<
  AnalyticsEvent,
  "eventName" | "eventCategory" | "eventSource" | "entityId" | "entityType" | "action" | "additionalIdentifiers" | "eventProperties"
> & {
  /** Primary identifier of the user (distinct ID, wallet address, DID, etc.) If anonymous, same as `trackingId`. */
  primaryIdentifier?: string;
};
