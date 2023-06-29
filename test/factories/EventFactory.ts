import { type AnalyticsEvent } from "../../src/types/AnalyticsEvent.js";

export const VALID_EVENT: AnalyticsEvent = {
  eventName: "test_event_parsed",
  eventCategory: "system_outcome_event",
  eventSource: "MiniDigitalSdk.Test",
  entityId: "1234",
  entityType: "test_event",
  action: "parsed",
  anonymousUser: true,
};

export const PRIMARY_IDENTIFIER_SET: AnalyticsEvent = {
  ...VALID_EVENT,
  anonymousUser: false,
  primaryIdentifier: "1234567",
};
