import type { AnalyticsEvent } from "./AnalyticsEvent.js";

/**
 * The schema to be sent to the Mini Digital API Server.
 * Consists of the `AnalyticsEvent` plus some additional (or modified) fields.
 */
export type EnrichedAnalyticsEvent = Pick<
  AnalyticsEvent,
  | "eventName"
  | "eventCategory"
  | "eventSource"
  | "entityId"
  | "entityType"
  | "action"
  | "primaryIdentifier"
  | "additionalIdentifiers"
  | "eventProperties"
> & {
  /** ID of the event - needs to be unique (ideally UUID), otherwise could overwrite event with same ID */
  eventId: string;
  /** Timestamp is ISO format */
  timestamp: string;
  /** Mini Digital Tracking ID */
  trackingId: string;
  /** If the user is an anonymous user (1 = true, 0 = false). Overrides the boolean value from the original interface. */
  anonymousUser: string;
  /** The name & version of this SDK */
  sdkVersion: string;
  /** The version of the Mini Digital core schema */
  schemaVersion: string;
};

/** The (core) schema version that corresponds to this `AnalyticsEvent` type */
export const SCHEMA_VERSION: string = "1.0.0";
