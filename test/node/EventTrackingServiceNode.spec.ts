import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import createFetchMock from "vitest-fetch-mock";

import { VALID_EVENT } from "../factories/EventFactory.js";
import { getError, NoErrorThrownError } from "../util/testUtils.js";

import { EventTrackingConfig, EventTrackingService } from "../../src/index.js";

import { API_KEY, NOT_FOUND_MINI_DIGITAL_RESPONSE, VALID_MINI_DIGITAL_RESPONSE } from "../util/constants.js";

const fetchMocker = createFetchMock(vi);

describe(`Testing the EventTrackingService using Node`, () => {
  beforeAll(() => {
    // sets globalThis.fetch and globalThis.fetchMock to our mocked version
    fetchMocker.enableMocks();
  });

  afterEach(() => {
    // Reset config
    EventTrackingConfig.apiKey = undefined;
    EventTrackingConfig.pauseTracking = false;

    // Reset mocks
    fetchMocker.resetMocks();
  });

  it("Receives 200 OK for a valid event using an API Key", async () => {
    // Runs in a Node (non-browser) environment, API key is required
    EventTrackingConfig.apiKey = API_KEY;

    fetchMocker.once((request) => {
      return {
        status: 200,
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify(VALID_MINI_DIGITAL_RESPONSE),
      };
    });

    await EventTrackingService.postEvent(VALID_EVENT);
  });

  it("Fails when no API Key is provided", async () => {
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_EVENT);
    });

    // check that the returned error wasn't that no error was thrown
    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error.message).toEqual("The API Key is not set in config.");
  });

  it("Doesn't send a request when config.pauseTracking is true", async () => {
    // Set config
    EventTrackingConfig.pauseTracking = true;

    fetchMocker.once((request) => {
      return {
        status: 404,
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify(NOT_FOUND_MINI_DIGITAL_RESPONSE),
      };
    });

    // No error should be thrown
    await EventTrackingService.postEvent(VALID_EVENT);
  });
});
