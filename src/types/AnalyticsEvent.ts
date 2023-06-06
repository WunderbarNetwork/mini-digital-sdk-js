/**
 * Represents an Analytics Event for the **Mini Digital Gateway**
 */
export interface AnalyticsEvent {
  /** ID of the event - needs to be unique (ideally UUID), otherwise could overwrite event with same ID */
  eventId: string;
  /** Tha name of the event you are tracking (e.g. "account_created" or "crown_minted" - usually it is `entityType`.`action`) */
  eventName: string;
  /** Timestamp is ISO format */
  timestamp: string;
  /** Event category */
  eventCategory: "screen_view_event" | "user_outcome_event" | "system_outcome_event" | "content_event" | "interaction_event";
  /** Optional: Id of the entity this event relates to (e.g. CID of an IPFS resource) */
  entityId?: string;
  /** Optional: Type of the entity this event relates to (e.g. "account" or "crown") */
  entityType?: string;
  /** The action this event represents (e.g. "created" or "minted") */
  action?: string;
  /** The source that has generated this event (e.g. "Website.WunderbarNetwork.Router") */
  eventSource: string;
  /** Any additional arbitrary JSON properties to attach to the event */
  eventProperties?: any;
  /** Mini Digital Tracking ID */
  trackingId: string;
  /** Primary identifier of the user (distinct ID, wallet address, DID, etc.) If anonymous, same as `trackingId`. */
  primaryIdentifier: string;
  /** Optional: Any additional identifiers, in the form `{[ identifierName: identifierValue ]}` */
  additionalIdentifiers?: any;
  /** If the user is an anonymous user (1 = true, 0 = false) */
  anonymousUser: string;
  /** The version of this SDK */
  sdkVersion: string;
  /** The version of the Mini Digital core schema */
  schemaVersion: string;
}

/** The (core) schema version that corresponds to this `AnalyticsEvent` type */
export const SCHEMA_VERSION: string = "1.0.0";
