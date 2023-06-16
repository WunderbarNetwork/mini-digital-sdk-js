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
 */
function determineIdentifiers(
  event: AnalyticsEvent,
  isBrowser: boolean
): { primaryIdentifier: string; trackingId: string; isAnonymous: boolean } {
  let trackingId: string | undefined;
  let primaryIdentifier: string | undefined = event.primaryIdentifier;
  let isAnonymous: boolean | undefined = event.anonymousUser;

  // Check the trackingId
  // Tracking ID will only be stored if the event comes from the browser, and is not part of the "consumer" `AnalyticsEvent` schema
  if (isBrowser) {
    // Event from the browser, check if the tracking ID has been stored previously
    trackingId = Cookies.get(COOKIE_NAME_TRACKING_ID);

    if (Util.isStringNullOrEmpty(trackingId)) {
      // No previous tracking ID, generate a random UUID
      trackingId = generateAnonymousUserId();

      // Save the tracking ID into a cookie
      Cookies.set(COOKIE_NAME_TRACKING_ID, trackingId, {
        domain: !Util.isStringNullOrEmpty(config.cookieDomain) ? config.cookieDomain : undefined,
        expires: config.cookieTrackingIdExpiration,
        secure: true,
        sameSite: "strict",
      });
    }
  }

  // Check the primary identifier and isAnonymous
  if (Util.isStringNullOrEmpty(primaryIdentifier)) {
    // Primary identifier not set, check anonymousUser
    if (isAnonymous === undefined) {
      throw new Error("Primary identifier is not set, anonymousUser field must be set instead. See the docs for further details.");
    } else if (isAnonymous !== undefined && !isAnonymous) {
      throw new Error("Primary identifier is not set, anonymousUser field must not be false. See the docs for further details.");
    }

    // Use the tracking ID if coming from the browser, otherwise use a new UUID
    primaryIdentifier = isBrowser ? trackingId : generateAnonymousUserId();
  } else {
    // Primary identifier is set, if anonymousUser is omitted, declare it non-anonymous
    if (isAnonymous === undefined) {
      isAnonymous = false;
    }
  }

  // The primaryIdentifier & isAnonymous are now set. If this is NOT a browser event, update trackingId to match.
  if (!isBrowser) {
    trackingId = primaryIdentifier;
  }

  // At this point, all of them should be set.
  if (trackingId === undefined || primaryIdentifier === undefined || isAnonymous === undefined) {
    throw new Error("Unexpected state in the Mini Digital SDK: could not determine the identifiers.");
  }

  return { trackingId, primaryIdentifier, isAnonymous };
}
