/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import createFetchMock from "vitest-fetch-mock";

import { VALID_EVENT } from "../util/EventFactory.js";
import { describeRequest, getError, NoErrorThrownError } from "../util/testUtils.js";

import { EventTrackingConfig, EventTrackingService, HttpError } from "../../src/index.js";

import {
  BAD_REQUEST_MINI_DIGITAL_RESPONSE,
  INTERNAL_SERVER_ERROR_MINI_DIGITAL_RESPONSE,
  JWT_TOKEN,
  NOT_FOUND_MINI_DIGITAL_RESPONSE,
  UNAUTHORIZED_MINI_DIGITAL_RESPONSE,
  VALID_MINI_DIGITAL_RESPONSE,
} from "../util/constants.js";

const fetchMocker = createFetchMock(vi);

// Use console logs while testing. Could be an env variable in the future.
const logOutcomes: boolean = true;

describe(`Testing the EventTrackingService using JSDOM`, () => {
  beforeAll(() => {
    // sets globalThis.fetch and globalThis.fetchMock to our mocked version
    fetchMocker.enableMocks();

    // Set initial config overrides
    EventTrackingConfig.errorRetryIntervalMs = 1; // Set the retries interval to 1ms
    EventTrackingConfig.miniDigitalUrl = "http://localhost:3333"; // Default port for Mini Digital Event Sink
  });

  afterEach(() => {
    // Reset config to test defaults
    EventTrackingConfig.apiKey = undefined;
    EventTrackingConfig.maxRetriesOn500 = 3;
    EventTrackingConfig.miniDigitalUrl = "http://localhost:3333"; // Default port for Mini Digital Event Sink
    EventTrackingConfig.pauseTracking = false;

    // Reset mocks
    fetchMocker.resetMocks();
  });

  it("Receives 200 OK for a valid event using a JWT token", async () => {
    fetchMocker.mockIf(/^http?:\/\/localhost:3333.*$/, (request) => {
      describeRequest(request, logOutcomes);
      if (request.headers.get("Authorization") === null) {
        // Simulate the first response not having an Auth token
        return {
          status: 401,
          headers: [
            ["Authorization", JWT_TOKEN],
            ["Content-Type", "application/json"],
          ],
          body: JSON.stringify(UNAUTHORIZED_MINI_DIGITAL_RESPONSE),
        };
      } else if (request.headers.get("Authorization") === JWT_TOKEN) {
        return {
          status: 200,
          headers: [["Content-Type", "application/json"]],
          body: JSON.stringify(VALID_MINI_DIGITAL_RESPONSE),
        };
      } else {
        return {
          status: 404,
          headers: [["Content-Type", "application/json"]],
          body: JSON.stringify(NOT_FOUND_MINI_DIGITAL_RESPONSE),
        };
      }
    });

    // Runs in a browser-like environment
    await EventTrackingService.postEvent(VALID_EVENT, logOutcomes);
    expect(fetchMocker.requests().length).toEqual(2);
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

    // Runs in a browser-like environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_EVENT, logOutcomes);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toBeInstanceOf(HttpError);
    expect(fetchMocker.requests().length).toEqual(1); // Does not retry on failure
    expect(error.message).toEqual("Mini Digital POST error! Status: 400");
  });

  it("Fails if JWT request returns 401 without an Authorization token", async () => {
    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      return {
        status: 401,
        // We are not including a JWT token in the response headers, therefore the request should fail
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify(UNAUTHORIZED_MINI_DIGITAL_RESPONSE),
      };
    });

    // Runs in a browser-like environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_EVENT, logOutcomes);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toBeInstanceOf(HttpError);
    expect(fetchMocker.requests().length).toEqual(1); // Does not retry on failure
    expect(error.message).toEqual("Mini Digital POST error! Status: 401");
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

    // Runs in a browser-like environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_EVENT, logOutcomes);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).toBeInstanceOf(HttpError);
    expect(fetchMocker.requests().length).toEqual(6); // Original call + 5 retries
    expect(error.message).toEqual("Mini Digital POST error! Status: 500");
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

    // Runs in a browser-like environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_EVENT, logOutcomes);
    });

    expect(error).toBeInstanceOf(NoErrorThrownError);
    expect(error).not.toBeInstanceOf(HttpError);
    expect(fetchMocker.requests().length).toEqual(2); // Original call + retry
  });

  it("Fails to parse a bad response from Mini Digital", async () => {
    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      return {
        status: 200,
        body: undefined,
      };
    });

    // Runs in a browser-like environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_EVENT, logOutcomes);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(fetchMocker.requests().length).toEqual(1); // Does not retry on failure
    expect(error.message).toEqual("Could not parse the Mini Digital response.");
  });

  it("Fails if the Mini Digital endpoint is not defined", async () => {
    // Set config
    EventTrackingConfig.miniDigitalUrl = "";

    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      throw new HttpError("Fetch should not be called", 400);
    });

    // Runs in a browser-like environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_EVENT, logOutcomes);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error).not.toBeInstanceOf(HttpError);
    expect(fetchMocker.requests().length).toEqual(0);
    expect(error.message).toEqual("The Mini Digital URL has not been defined in the config.");
  });

  it("Fails when the fetch request throws an exception", async () => {
    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      throw new Error("Simulating fetch throwing an error");
    });

    // Runs in a browser-like environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_EVENT, logOutcomes);
    });

    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(fetchMocker.requests().length).toEqual(1); // Does not retry on failure
    expect(error.message).toEqual("Error interfacing with Mini Digital.");
  });

  it("Doesn't send a request when config.pauseTracking is true", async () => {
    // Set config
    EventTrackingConfig.pauseTracking = true;

    fetchMocker.once((request) => {
      describeRequest(request, logOutcomes);
      throw new HttpError("Fetch should not be called", 400);
    });

    // No error should be thrown
    await EventTrackingService.postEvent(VALID_EVENT, logOutcomes);

    expect(fetchMocker.requests().length).toEqual(0);
  });
});
