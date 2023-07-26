import { describe, expect, it } from "vitest";

import eventEnrichment from "../../src/services/EventEnrichmentService.js";
import { isStringNullOrEmpty } from "../../src/util/Util.js";

import * as config from "../../src/util/Config.js";

import { getError, NoErrorThrownError } from "../util/testUtils.js";

import { EVENT_NO_IDENTIFIERS, DUMMY_PRIMARY_IDENTIFIER } from "../util/EventFactory.js";

const IS_BROWSER: boolean = false;

describe(`Testing the EventEnrichmentService using Node`, () => {
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
  });

  it("Sets identifiers properly (anonymousUser = true, primaryIdentifier = undefined)", async () => {
    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = true;
    event.primaryIdentifier = undefined;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("1");
    expect(enrichedEvent.primaryIdentifier).not.toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(enrichedEvent.trackingId).toMatch(enrichedEvent.primaryIdentifier ?? "");
  });

  it("Sets identifiers properly (anonymousUser = true, primaryIdentifier = set)", async () => {
    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = true;
    event.primaryIdentifier = DUMMY_PRIMARY_IDENTIFIER;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("1");
    expect(enrichedEvent.primaryIdentifier).toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(enrichedEvent.trackingId).toMatch(enrichedEvent.primaryIdentifier ?? "");
  });

  it("Sets identifiers properly (anonymousUser = false, primaryIdentifier = set)", async () => {
    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = false;
    event.primaryIdentifier = DUMMY_PRIMARY_IDENTIFIER;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("0");
    expect(enrichedEvent.primaryIdentifier).toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(enrichedEvent.trackingId).toMatch(enrichedEvent.primaryIdentifier ?? "");
  });

  it("Sets identifiers properly (anonymousUser = undefined, primaryIdentifier = set)", async () => {
    const event = { ...EVENT_NO_IDENTIFIERS };
    event.anonymousUser = undefined;
    event.primaryIdentifier = DUMMY_PRIMARY_IDENTIFIER;

    const enrichedEvent = eventEnrichment(event, IS_BROWSER);

    expect(isStringNullOrEmpty(enrichedEvent.trackingId)).not.toBeTruthy();
    expect(isStringNullOrEmpty(enrichedEvent.primaryIdentifier)).not.toBeTruthy();
    expect(enrichedEvent.anonymousUser).toMatch("0");
    expect(enrichedEvent.primaryIdentifier).toMatch(DUMMY_PRIMARY_IDENTIFIER);
    expect(enrichedEvent.trackingId).toMatch(enrichedEvent.primaryIdentifier ?? "");
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
