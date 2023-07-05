import { describe, expect, it } from "vitest";

import eventEnrichment from "../../src/services/EventEnrichmentService";
import { isStringNullOrEmpty } from "../../src/util/Util";

import * as config from "../../src/util/Config";

import { getError, NoErrorThrownError } from "../util/testUtils.js";

import { VALID_EVENT, PRIMARY_IDENTIFIER_SET } from "../util/EventFactory";

const IS_BROWSER: boolean = false;

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
  });

  it("Sets identifiers properly (anonymous user = true)", async () => {
    const enrichedEvent = eventEnrichment(VALID_EVENT, IS_BROWSER);

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
    expect(enrichedEvent.trackingId).toMatch(enrichedEvent.primaryIdentifier ?? "");
  });

  it("Sets identifiers properly (anonymous user = omitted, primary identifier set)", async () => {
    const event = PRIMARY_IDENTIFIER_SET;
    event.anonymousUser = undefined;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("0");
    expect(enrichedEvent.trackingId).toMatch(enrichedEvent.primaryIdentifier ?? "");
  });

  it("Fails if primary identifier not set, isAnonymous = undefined", async () => {
    const event = VALID_EVENT;
    event.anonymousUser = undefined;

    const error = await getError<Error>(async () => {
      eventEnrichment(event, IS_BROWSER);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(isStringNullOrEmpty(error.message)).not.toBeTruthy();
  });

  it("Fails if primary identifier not set, isAnonymous = false", async () => {
    const event = VALID_EVENT;
    event.anonymousUser = false;

    const error = await getError<Error>(async () => {
      eventEnrichment(event, IS_BROWSER);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(isStringNullOrEmpty(error.message)).not.toBeTruthy();
  });
});
