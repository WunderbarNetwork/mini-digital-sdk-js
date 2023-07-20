/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";

import eventEnrichment from "../../src/services/EventEnrichmentService";
import { isStringNullOrEmpty } from "../../src/util/Util";

import * as config from "../../src/util/Config";

import { getError, NoErrorThrownError } from "../util/testUtils.js";

import { VALID_EVENT, PRIMARY_IDENTIFIER_SET } from "../util/EventFactory";

const IS_BROWSER: boolean = true;

describe(`Testing the EventEnrichmentService using Node`, () => {
  it("Attaches additional properties to the event", async () => {
    const enrichedEvent = eventEnrichment(VALID_EVENT, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.eventId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("1");
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
    const event = { ...VALID_EVENT };

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
    expect(enrichedEvent.eventProperties.screenWidth).toEqual(1);
    expect(enrichedEvent.eventProperties.screenHeight).toEqual(2);

    // Referrer is not set by default in JSDOM
  });

  it("Sets identifiers properly (anonymous user = true)", async () => {
    const enrichedEvent = eventEnrichment(VALID_EVENT, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("1");
    expect(enrichedEvent.trackingId).toMatch(enrichedEvent.primaryIdentifier ?? "");
  });

  it("Sets identifiers properly (anonymous user = true, primary identifier also set)", async () => {
    const event = { ...PRIMARY_IDENTIFIER_SET };
    event.anonymousUser = true;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("1");
    expect(enrichedEvent.trackingId).toMatch(enrichedEvent.primaryIdentifier ?? "");
  });

  it("Sets identifiers properly (anonymous user = false)", async () => {
    const enrichedEvent = eventEnrichment(PRIMARY_IDENTIFIER_SET, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("0");
    expect(enrichedEvent.primaryIdentifier).not.toMatch(enrichedEvent.trackingId);
  });

  it("Sets identifiers properly (anonymous user = omitted, primary identifier set)", async () => {
    const event = { ...PRIMARY_IDENTIFIER_SET };
    event.anonymousUser = undefined;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("0");
    expect(enrichedEvent.primaryIdentifier).not.toMatch(enrichedEvent.trackingId);
  });

  it("Fails if primary identifier not set, isAnonymous = undefined", async () => {
    const event = { ...VALID_EVENT };
    event.anonymousUser = undefined;

    const error = await getError<Error>(async () => {
      eventEnrichment(event, IS_BROWSER);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(isStringNullOrEmpty(error.message)).not.toBeTruthy();
  });

  it("Fails if primary identifier not set, isAnonymous = false", async () => {
    const event = { ...VALID_EVENT };
    event.anonymousUser = false;

    const error = await getError<Error>(async () => {
      eventEnrichment(event, IS_BROWSER);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(isStringNullOrEmpty(error.message)).not.toBeTruthy();
  });
});
