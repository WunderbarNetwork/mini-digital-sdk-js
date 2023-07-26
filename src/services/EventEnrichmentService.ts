import { type AnalyticsEvent } from "../types/AnalyticsEvent.js";
import { type EnrichedAnalyticsEvent, SCHEMA_VERSION } from "../types/EnrichedAnalyticsEvent.js";

import { config, COOKIE_NAME_TRACKING_ID, SDK_VERSION } from "../util/Config.js";
import { generateAnonymousUserId } from "../util/ConsumerUtil.js";

import * as Util from "../util/Util.js";

import Cookies from "js-cookie";

/**
 * Add additional data to the event before sending it to the server
 */
export default function eventEnrichment(event: AnalyticsEvent, isBrowser: boolean): EnrichedAnalyticsEvent {
  // Determine the identifiers
  const { primaryIdentifier, trackingId, isAnonymous } = determineIdentifiers(event, isBrowser);

  const analyticsEvent: EnrichedAnalyticsEvent = {
    eventId: Util.generateEventId(),
    eventName: event.eventName,
    eventCategory: event.eventCategory,
    eventSource: event.eventSource,
    entityId: event.entityId,
    entityType: event.entityType,
    action: event.action,
    trackingId,
    primaryIdentifier,
    additionalIdentifiers: {
      ...event.additionalIdentifiers,
    },
    anonymousUser: isAnonymous ? "1" : "0",
    timestamp: Util.generateEventTimestamp(),
    eventProperties: {
      ...event.eventProperties,
    },
    sdkVersion: SDK_VERSION,
    schemaVersion: SCHEMA_VERSION,
  };

  // Include additional properties if the SDK is used from within a browser.
  // If the property of the same name was already included, then skip that property (even if it is null).
  if (isBrowser) {
    if (analyticsEvent.eventProperties.userAgent === undefined) {
      analyticsEvent.eventProperties.userAgent = Util.getBrowserUserAgent();
    }
    if (analyticsEvent.eventProperties.localTimezone === undefined) {
      analyticsEvent.eventProperties.localTimezone = Util.getBrowserUserLocalTimeZone();
    }
    if (analyticsEvent.eventProperties.referrer === undefined) {
      // Referrer is added only for specific event types
      if (analyticsEvent.eventCategory === "screen_view_event" || analyticsEvent.eventCategory === "content_event") {
        analyticsEvent.eventProperties.referrer = Util.getBrowserReferrer();
      }
    }
    if (analyticsEvent.eventProperties.currentPage === undefined) {
      analyticsEvent.eventProperties.currentPage = Util.getBrowserCurrentPage();
    }
    if (analyticsEvent.eventProperties.screenWidth === undefined) {
      analyticsEvent.eventProperties.screenWidth = Util.getBrowserWindowScreenWidth();
    }
    if (analyticsEvent.eventProperties.screenHeight === undefined) {
      analyticsEvent.eventProperties.screenHeight = Util.getBrowserWindowScreenHeight();
    }
  }

  return analyticsEvent;
}

/**
 * Function to determine the primary identifier and tracking ID based on the set rules.
 *
 * Short rule-set:
 * 1) When tracking **anonymous** users, always set `anonymousUser` to `true`.
 * - if `primaryIdentifier` is omitted (recommended), it will be set to the same value as the trackingId (which will either be
 *   generated or read from a cookie, if persisted previously and this is a browser event)
 * - if `primaryIdentifier` is supplied, the SDK assumes this is also the trackingId, and will not use the one from the cookie
 *   (if any is found).
 *
 * 2) When tracking **identifiable** users, always set the `primaryIdentifier` field and optionally `anonymousUser` to `false`.
 * - if the `anonymousUser` field is omitted - it will automatically be set to `false`
 * - if `anonymousUser` is set to `true`, the SDK will obviously assume it is an anonymous user instead
 *
 * 3) It makes no sense to either:
 * - have both `primaryIdentifier` and `anonymousUser` fields omitted - will throw an `Error`
 * - have the `primaryIdentifier` omitted and `anonymousUser` set to `false` - will also throw an `Error`
 */
function determineIdentifiers(
  event: AnalyticsEvent,
  isBrowser: boolean,
): { primaryIdentifier: string; trackingId: string; isAnonymous: boolean } {
  let trackingId: string | undefined;
  let primaryIdentifier: string | undefined = event.primaryIdentifier;
  let isAnonymous: boolean | undefined = event.anonymousUser;

  // Tracking ID will only be stored if the event comes from the browser, and is not part of the "consumer" `AnalyticsEvent` schema
  if (isBrowser) {
    // Event from the browser, check if the tracking ID has been stored previously
    trackingId = config.useCookies ? Cookies.get(COOKIE_NAME_TRACKING_ID) : undefined;
  }

  // If no previous trackingId was found... (i.e. either the cookie has expired, or cookies turned off, or this is NOT a browser event)
  if (Util.isStringNullOrEmpty(trackingId)) {
    // ... generate a random UUID
    trackingId = generateAnonymousUserId();
  }

  // Check the primary identifier and isAnonymous
  if (Util.isStringNullOrEmpty(primaryIdentifier)) {
    // ***************************
    // Primary identifier not set!
    // ***************************

    // Check anonymousUser (it must be set explicitly to `true`, otherwise raise an Error)
    if (isAnonymous === undefined) {
      throw new Error("Primary identifier is not set, anonymousUser field must be set to true instead. See the docs for further details.");
    } else if (isAnonymous !== undefined && !isAnonymous) {
      throw new Error("Primary identifier is not set, anonymousUser field must not be false. See the docs for further details.");
    }

    // Given the primaryIdentifier is empty and at this point we ensured that anonymousUser is set to `true`, make the primaryIdentifier
    // match the trackingId. The trackingId will potentially be read from a cookie (for browser events), or be made a new random UUID.
    primaryIdentifier = trackingId;
  } else {
    // **************************
    // Primary identifier is set!
    // **************************

    // `anonymousUser` can be either `true` or `false` at this stage. If the field is omitted, declare it non-anonymous by default.
    if (isAnonymous === undefined) {
      isAnonymous = false;
    }

    // Next, check if we are within a browser.
    //
    // For browser events, set the trackingId to match the given primaryIdentifier only if `anonymousUser` is set to `true`. This is
    // an edge case, if the consumer app essentially wishes to manage anonymous IDs manually. If `anonymousUser` is set to `false`,
    // which is the default (assumed) value, the trackingId will remain as-is (either read from the cookie or a new random UUID value
    // generated).
    //
    // For non-browser events, **always** set the trackingId to match the primaryIdentifier, as we have no other way to persist the
    // trackingId anyway.
    if (isBrowser && isAnonymous) {
      trackingId = primaryIdentifier;
    } else if (!isBrowser) {
      trackingId = primaryIdentifier;
    }
  }

  // At this point, all of them should be set.
  if (trackingId === undefined || primaryIdentifier === undefined || isAnonymous === undefined) {
    throw new Error("Unexpected state in the Mini Digital SDK: could not determine the identifiers.");
  }

  // If this is executed within a browser, update the cookie with the same (i.e. extend the expiration) or new trackingId
  if (isBrowser && config.useCookies && trackingId !== undefined) {
    Cookies.set(COOKIE_NAME_TRACKING_ID, trackingId, {
      domain: !Util.isStringNullOrEmpty(config.cookieDomain) ? config.cookieDomain : undefined,
      expires: config.cookieTrackingIdExpirationDays,
      secure: true,
      sameSite: "strict",
    });
  }

  return { trackingId, primaryIdentifier, isAnonymous };
}
