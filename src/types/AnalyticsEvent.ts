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
  /** ID of the contract to validate the event schema against */
  contractId: string;
  /** Version of the contract to validate the event schema against */
  contractVersion: string;
  /** User ID of the user performing the action (e.g. SS58 Polkadot wallet address, DID, or bespoke to service) */
  userId: string;
  /** Optional: Id of the author of the event (if different from the user id) */
  authorId?: string;
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
}
