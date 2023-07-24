/**
 * @vitest-environment jsdom
 */
import { beforeAll, describe, expect, it } from "vitest";
import Cookies from "js-cookie";

import eventEnrichment from "../../src/services/EventEnrichmentService.js";
import { isStringNullOrEmpty } from "../../src/util/Util.js";

import * as config from "../../src/util/Config.js";

import { getError, NoErrorThrownError } from "../util/testUtils.js";

import { EVENT_NO_IDENTIFIERS, DUMMY_PRIMARY_IDENTIFIER, DUMMY_TRACKING_ID } from "../util/EventFactory.js";

const IS_BROWSER: boolean = true;

describe(`Testing the EventEnrichmentService using Node`, () => {
  beforeAll(() => {
    // Make sure cookie doesn't exist
    Cookies.remove(config.COOKIE_NAME_TRACKING_ID);
  });

  it("Attaches additional properties to the event", async () => {
    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = true;
    event.primaryIdentifier = undefined;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.eventId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("1");
    expect(enrichedEvent.primaryIdentifier).not.toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(isStringNullOrEmpty(enrichedEvent.timestamp)).not.toBeTruthy();
    expect(enrichedEvent.sdkVersion).toMatch(config.SDK_VERSION);
    expect(isStringNullOrEmpty(enrichedEvent.schemaVersion)).not.toBeTruthy();

    // Browser-specific
    expect(isStringNullOrEmpty(enrichedEvent.eventProperties.userAgent)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.eventProperties.localTimezone)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.eventProperties.currentPage)).not.toBeTruthy();
    expect(enrichedEvent.eventProperties.screenWidth).toBeGreaterThanOrEqual(0);
    expect(enrichedEvent.eventProperties.screenHeight).toBeGreaterThanOrEqual(0);

    // Referrer is not set by default in JSDOM
  });

  it("Doesn't overwrite pre-defined custom properties", async () => {
    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = true;
    event.primaryIdentifier = undefined;

    event.eventProperties = {};

    event.eventProperties.userAgent = "TEST1";
    event.eventProperties.localTimezone = "TEST2";
    event.eventProperties.currentPage = "TEST3";
    event.eventProperties.screenWidth = 1;
    event.eventProperties.screenHeight = 2;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    // Browser-specific
    expect(enrichedEvent.eventProperties.userAgent).toMatch("TEST1");
    expect(enrichedEvent.eventProperties.localTimezone).toMatch("TEST2");
    expect(enrichedEvent.eventProperties.currentPage).toMatch("TEST3");
    expect(enrichedEvent.eventProperties.screenWidth).toBe(1);
    expect(enrichedEvent.eventProperties.screenHeight).toBe(2);

    // Referrer is not set by default in JSDOM
  });

  it("Sets identifiers properly (anonymousUser = true, primaryIdentifier = undefined, trackingId = undefined)", async () => {
    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = true;
    event.primaryIdentifier = undefined;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("1");
    expect(enrichedEvent.trackingId).not.toMatch(DUMMY_TRACKING_ID);
    expect(enrichedEvent.primaryIdentifier).not.toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(enrichedEvent.trackingId).toMatch(enrichedEvent.primaryIdentifier ?? "");
  });

  it("Sets identifiers properly (anonymousUser = true, primaryIdentifier = undefined, trackingId = set)", async () => {
    Cookies.set(config.COOKIE_NAME_TRACKING_ID, DUMMY_TRACKING_ID);

    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = true;
    event.primaryIdentifier = undefined;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("1");
    expect(enrichedEvent.trackingId).toMatch(DUMMY_TRACKING_ID);
    expect(enrichedEvent.primaryIdentifier).not.toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(enrichedEvent.trackingId).toMatch(enrichedEvent.primaryIdentifier ?? "");
  });

  it("Sets identifiers properly (anonymousUser = true, primaryIdentifier = set, trackingId = undefined)", async () => {
    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = true;
    event.primaryIdentifier = DUMMY_PRIMARY_IDENTIFIER;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("1");
    expect(enrichedEvent.trackingId).not.toMatch(DUMMY_TRACKING_ID);
    expect(enrichedEvent.primaryIdentifier).toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(enrichedEvent.trackingId).toMatch(enrichedEvent.primaryIdentifier ?? "");
  });

  it("Sets identifiers properly (anonymousUser = true, primaryIdentifier = set, trackingId = set)", async () => {
    Cookies.set(config.COOKIE_NAME_TRACKING_ID, DUMMY_TRACKING_ID);

    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = true;
    event.primaryIdentifier = DUMMY_PRIMARY_IDENTIFIER;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("1");
    expect(enrichedEvent.trackingId).not.toMatch(DUMMY_TRACKING_ID);
    expect(enrichedEvent.primaryIdentifier).toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(enrichedEvent.trackingId).toMatch(enrichedEvent.primaryIdentifier ?? "");
  });

  it("Sets identifiers properly (anonymousUser = false, primaryIdentifier = set, trackingId = undefined)", async () => {
    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = false;
    event.primaryIdentifier = DUMMY_PRIMARY_IDENTIFIER;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("0");
    expect(enrichedEvent.trackingId).not.toMatch(DUMMY_TRACKING_ID);
    expect(enrichedEvent.primaryIdentifier).toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(enrichedEvent.primaryIdentifier).not.toMatch(enrichedEvent.trackingId);
  });

  it("Sets identifiers properly (anonymousUser = false, primaryIdentifier = set, trackingId = set)", async () => {
    Cookies.set(config.COOKIE_NAME_TRACKING_ID, DUMMY_TRACKING_ID);

    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = false;
    event.primaryIdentifier = DUMMY_PRIMARY_IDENTIFIER;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("0");
    expect(enrichedEvent.trackingId).toMatch(DUMMY_TRACKING_ID);
    expect(enrichedEvent.primaryIdentifier).toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(enrichedEvent.primaryIdentifier).not.toMatch(enrichedEvent.trackingId);
  });

  it("Sets identifiers properly (anonymousUser = undefined, primaryIdentifier = set, trackingId = undefined)", async () => {
    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = undefined;
    event.primaryIdentifier = DUMMY_PRIMARY_IDENTIFIER;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("0");
    expect(enrichedEvent.trackingId).not.toMatch(DUMMY_TRACKING_ID);
    expect(enrichedEvent.primaryIdentifier).toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(enrichedEvent.primaryIdentifier).not.toMatch(enrichedEvent.trackingId);
  });

  it("Sets identifiers properly (anonymousUser = undefined, primaryIdentifier = set, trackingId = set)", async () => {
    Cookies.set(config.COOKIE_NAME_TRACKING_ID, DUMMY_TRACKING_ID);

    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = undefined;
    event.primaryIdentifier = DUMMY_PRIMARY_IDENTIFIER;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("0");
    expect(enrichedEvent.trackingId).toMatch(DUMMY_TRACKING_ID);
    expect(enrichedEvent.primaryIdentifier).toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(enrichedEvent.primaryIdentifier).not.toMatch(enrichedEvent.trackingId);
  });

  it("Fails (anonymousUser = undefined, primaryIdentifier = undefined)", async () => {
    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = undefined;
    event.primaryIdentifier = undefined;

    const error = await getError<Error>(async () => {
      eventEnrichment(event, IS_BROWSER);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(isStringNullOrEmpty(error.message)).not.toBeTruthy();
  });

  it("Fails (anonymousUser = false, primaryIdentifier = undefined)", async () => {
    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = false;
    event.primaryIdentifier = undefined;

    const error = await getError<Error>(async () => {
      eventEnrichment(event, IS_BROWSER);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(isStringNullOrEmpty(error.message)).not.toBeTruthy();
  });
});
