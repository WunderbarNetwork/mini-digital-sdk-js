/**
 * Represents an Analytics Event for the **Mini Digital** API Server.
 *
 * These are properties expected to be supplied by the SDK consumer. Additional properties will be automatically attached to the event
 * by the SDK (such as the unique Event ID, timestamp in UTC time, etc.)
 */
export interface AnalyticsEvent {
  /**
   * Mandatory field. The name of the event you are tracking (e.g. "account_created" or "crown_minted" - usually it is `entityType_action`).
   */
  eventName: string;
  /**
   * Mandatory field. Event category can be one of the following:
   * - screen_view_event - used when users navigate to a page/screen
   * - user_outcome_event - used when a user has completed a significant action in the product (e.g. user completed sign up, user uploaded a file)
   * - system_outcome_event - when something happens within the system, not immediately initialized by the user (e.g. a scheduled task gets completed)
   * - content_event - content was interacted with (e.g. an image or video were displayed to the user)
   * - interaction_event - when users interact with UI elements (e.g. user clicks a button)
   */
  eventCategory: "screen_view_event" | "user_outcome_event" | "system_outcome_event" | "content_event" | "interaction_event";
  /**
   * Optional: Id of the entity this event relates to (e.g. ID of an account, or CID of an IPFS resource)
   */
  entityId?: string;
  /**
   * Optional: Type of the entity this event relates to (e.g. "account", "crown", "IPFS resource", etc.)
   */
  entityType?: string;
  /**
   * The action this event represents (e.g. "visited", "created", "minted", etc.)
   */
  action?: string;
  /**
   * The source that has generated this event (e.g. "Website.WunderbarNetwork.Router")
   */
  eventSource: string;
  /**
   * Primary identifier of the user (distinct ID, wallet address, DID, etc.)
   *
   * Optional field. If left empty, and the `anonymousUser` property is set to true, will be automatically populated with an anonymous trackingId.
   * If the `anonymousUser` property is set to `false` or omitted, then the `primaryIdentifier` has to be provided.
   *
   * It is also allowed to set `anonymousUser` to `true` and provide the anonymous ID manually by populating this field, or using the
   * `EventTrackingUtil` class to generate an anonymous ID manually.
   */
  primaryIdentifier?: string;
  /**
   * Optional: Any additional identifiers, in the form `{[ identifierName: identifierValue ]}`
   */
  additionalIdentifiers?: any;
  /**
   * If the user is an anonymous user. See the description of the {@link primaryIdentifier} field.
   */
  anonymousUser?: boolean;
  /**
   * Any additional arbitrary JSON properties to attach to the event.
   *
   * Note that if the event originates from the browser, the SDK will automatically attach several fields by default:
   * - userAgent - the user agent string
   * - localTimezone - the local time zone from the browser, in the format e.g. "Pacific/Auckland"
   * - currentPage - the full URL from which the event was captured
   * - screenWidth and screenHeight - obtained from the browser
   * - referrer - the document referrer (only if {@link eventCategory} is `screen_view_event` or `content_event`)
   *
   * Any of these fields can be overwritten with a custom value if specified before the event is passed to the SDK.
   */
  eventProperties?: any;
}
