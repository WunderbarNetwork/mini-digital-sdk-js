/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import createFetchMock from "vitest-fetch-mock";

import { VALID_EVENT } from "../factories/EventFactory.js";
import { getError, NoErrorThrownError } from "../util/testUtils.js";

import { EventTrackingConfig, EventTrackingService } from "../../src/index.js";

import {
  JWT_TOKEN,
  NOT_FOUND_MINI_DIGITAL_RESPONSE,
  UNAUTHORIZED_MINI_DIGITAL_RESPONSE,
  VALID_MINI_DIGITAL_RESPONSE,
} from "../util/constants.js";

const fetchMocker = createFetchMock(vi);

describe(`Testing the EventTrackingService using JSDOM`, () => {
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

  it("Receives 200 OK for a valid event using a JWT token", async () => {
    fetchMocker.mockIf(/^https?:\/\/api.mini.digital.*$/, (request) => {
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
    await EventTrackingService.postEvent(VALID_EVENT);
  });

  it("Fails if JWT request returns 401 without an Authorization token", async () => {
    fetchMocker.once((request) => {
      return {
        status: 401,
        // We are not including a JWT token in the response headers, therefore the request should fail
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify(UNAUTHORIZED_MINI_DIGITAL_RESPONSE),
      };
    });

    // Runs in a browser-like environment
    const error = await getError<Error>(async () => {
      await EventTrackingService.postEvent(VALID_EVENT);
    });

    // check that the returned error wasn't that no error was thrown
    expect(error).not.toBeInstanceOf(NoErrorThrownError);
    expect(error.message).toEqual("Mini Digital POST error! Status: 401");
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
