import { type AnalyticsEvent } from "../../src/types/AnalyticsEvent.js";

export const DUMMY_TRACKING_ID: string = "1234";
export const DUMMY_PRIMARY_IDENTIFIER: string = "5678";

/**
 * To make the event valid, it needs to manually attach either the `anonymousUser` or `primaryIdentifier` fields
 */
export const EVENT_NO_IDENTIFIERS: AnalyticsEvent = {
  eventName: "test_event_parsed",
  eventCategory: "system_outcome_event",
  eventSource: "MiniDigitalSdk.Test",
  entityId: "1234",
  entityType: "test_event",
  action: "parsed",
};

export const VALID_ANONYMOUS_EVENT: AnalyticsEvent = {
  ...EVENT_NO_IDENTIFIERS,
  anonymousUser: true,
};
