import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import createFetchMock from "vitest-fetch-mock";

import { VALID_ANONYMOUS_EVENT } from "../util/EventFactory.js";
import { describeRequest, getError, NoErrorThrownError } from "../util/testUtils.js";

import { EventTrackingConfig, EventTrackingService, HttpError } from "../../src/index.js";

import {
  API_KEY,
  BAD_REQUEST_MINI_DIGITAL_RESPONSE,
  INTERNAL_SERVER_ERROR_MINI_DIGITAL_RESPONSE,
  VALID_MINI_DIGITAL_RESPONSE,
} from "../util/constants.js";

const fetchMocker = createFetchMock(vi);

// Use console logs while testing. Could be an env variable in the future.
const logOutcomes: boolean = false;

const raiseExceptions: boolean = true;

describe(`Testing the EventTrackingService using Node`, () => {
  beforeAll(() => {
    // sets globalThis.fetch and globalThis.fetchMock to our mocked version
    fetchMocker.enableMocks();

    // Set initial config overrides
    EventTrackingConfig.apiKey = API_KEY; // Runs in a Node (non-browser) environment, API key is required
    EventTrackingConfig.errorRetryIntervalMs = 1; // Set the retries interval to 1ms
    EventTrackingConfig.miniDigitalUrl = "http://localhost:3333"; // Default port for Mini Digital Event Sink
  });

  afterEach(() => {
    // Reset config to test defaults
    EventTrackingConfig.apiKey = API_KEY; // Runs in a Node (non-browser) environment, API key is required
    EventTrackingConfig.maxRetriesOn500 = 3;
    EventTrackingConfig.miniDigitalUrl = "http://localhost:3333"; // Default port for Mini Digital Event Sink
    EventTrackingConfig.pauseTracking = false;

    // Reset mocks
    fetchMocker.resetMocks();
  });

  it("Receives 200 OK for a valid event using an API Key", async () => {
    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      return {
        status: 200,
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify(VALID_MINI_DIGITAL_RESPONSE),
      };
    });

    await EventTrackingService.postEvent(VALID_ANONYMOUS_EVENT, logOutcomes);

    expect(fetchMocker.requests().length).toBe(1);
  });

  it("Fails when no API Key is provided", async () => {
    // Set config
    EventTrackingConfig.apiKey = undefined;

    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      throw new HttpError("Fetch should not be called", 400);
    });

    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_ANONYMOUS_EVENT, logOutcomes, raiseExceptions);
    });

    // check that the returned error wasn't that no error was thrown
    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).not.toBeInstanceOf(HttpError);
    expect(fetchMocker.requests().length).toBe(0);
    expect(error.message).toBe("The API Key is not set in config.");
  });

  it("Fails on user error (Bad Request, 400)", async () => {
    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      return {
        status: 400,
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify(BAD_REQUEST_MINI_DIGITAL_RESPONSE),
      };
    });

    // Runs in a Node (non-browser) environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_ANONYMOUS_EVENT, logOutcomes, raiseExceptions);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toBeInstanceOf(HttpError);
    expect(fetchMocker.requests().length).toBe(1); // Does not retry on failure
    expect(error.message).toBe("Mini Digital POST error! Status: 400");
  });

  it("Fails after 5 retries on 500 errors", async () => {
    // Set config to retry 5 times
    EventTrackingConfig.maxRetriesOn500 = 5;

    fetchMocker.doMock((request) => {
      describeRequest(request, logOutcomes);
      return {
        status: 500,
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify(INTERNAL_SERVER_ERROR_MINI_DIGITAL_RESPONSE),
      };
    });

    // Runs in a Node (non-browser) environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_ANONYMOUS_EVENT, logOutcomes, raiseExceptions);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toBeInstanceOf(HttpError);
    expect(fetchMocker.requests().length).toBe(6); // Original call + 5 retries
    expect(error.message).toBe("Mini Digital POST error! Status: 500");
  });

  it("Retry succeeds after error 500", async () => {
    // Set config to retry once
    EventTrackingConfig.maxRetriesOn500 = 1;

    // First request
    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      return {
        status: 500,
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify(INTERNAL_SERVER_ERROR_MINI_DIGITAL_RESPONSE),
      };
    });

    // Second request
    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      return {
        status: 200,
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify(VALID_MINI_DIGITAL_RESPONSE),
      };
    });

    // Runs in a Node (non-browser) environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_ANONYMOUS_EVENT, logOutcomes, raiseExceptions);
    });

    expect(error).toBeInstanceOf(NoErrorThrownError);
    expect(error).not.toBeInstanceOf(HttpError);
    expect(fetchMocker.requests().length).toBe(2); // Original call + retry
  });

  it("Fails to parse a bad response from Mini Digital", async () => {
    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      return {
        status: 200,
        body: undefined,
      };
    });

    // Runs in a Node (non-browser) environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_ANONYMOUS_EVENT, logOutcomes, raiseExceptions);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(fetchMocker.requests().length).toBe(1); // Does not retry on failure
    expect(error.message).toBe("Could not parse the Mini Digital response.");
  });

  it("Fails if the Mini Digital endpoint is not defined", async () => {
    // Set config
    EventTrackingConfig.miniDigitalUrl = "";

    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      throw new HttpError("Fetch should not be called", 400);
    });

    // Runs in a Node (non-browser) environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_ANONYMOUS_EVENT, logOutcomes, raiseExceptions);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).not.toBeInstanceOf(HttpError);
    expect(fetchMocker.requests().length).toBe(0);
    expect(error.message).toBe("The Mini Digital URL has not been defined in the config.");
  });

  it("Fails when the fetch request throws an exception", async () => {
    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      throw new Error("Simulating fetch throwing an error");
    });

    // Runs in a Node (non-browser) environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_ANONYMOUS_EVENT, logOutcomes, raiseExceptions);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(fetchMocker.requests().length).toBe(1); // Does not retry on failure
    expect(error.message).toBe("Error interfacing with Mini Digital.");
  });

  it("Does not throw exceptions when raising exceptions is not true", async () => {
    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      throw new Error("Simulating throwing an error");
    });

    // Runs in a browser-like environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_ANONYMOUS_EVENT, logOutcomes);
    });

    expect(error).toBeInstanceOf(NoErrorThrownError);
  });

  it("Doesn't send a request when config.pauseTracking is true", async () => {
    // Set config
    EventTrackingConfig.pauseTracking = true;

    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      throw new HttpError("Fetch should not be called", 400);
    });

    // No error should be thrown
    await EventTrackingService.postEvent(VALID_ANONYMOUS_EVENT, logOutcomes);

    expect(fetchMocker.requests().length).toBe(0);
  });
});
