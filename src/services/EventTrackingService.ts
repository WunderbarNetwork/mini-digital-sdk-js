import { type AnalyticsEvent } from "../types/AnalyticsEvent.js";
import { type EnrichedAnalyticsEvent } from "../types/EnrichedAnalyticsEvent.js";
import { type ServiceResponse } from "../types/ServiceResponse.js";

import { COOKIE_NAME_JWT_TOKEN, config } from "../util/Config.js";
import { isStringNullOrEmpty, retryAsyncFetchFunction } from "../util/Util.js";

import eventEnrichment from "./EventEnrichmentService.js";
import HttpError from "../util/HttpError.js";

import Cookies from "js-cookie";

/** JWT Auth token obtained from Mini Digital */
let jwtAuthorizationToken: string | undefined;

/** Determine if the SDK is running inside a browser (uses JWT authentication) or Node.js (uses API Key authentication). */
const isBrowser: boolean = typeof window !== "undefined" && typeof window.document !== "undefined";

/**
 * Provides an interface towards the **Mini Digital Event API**, to submit `AnalyticsEvent` objects.
 *
 * @param event Event to be stored
 * @param logResponse Optional - output to console when event has been successfully posted (default = false)
 * @param raiseExceptions Optional - SDK will throw exceptions when true (default = false)
 */
export async function postEvent(event: AnalyticsEvent, logResponse: boolean = false, raiseExceptions: boolean = false): Promise<void> {
  // If tracking was turned off, don't go any further.
  if (config.pauseTracking) return;

  let miniDigitalUrl: string = config.miniDigitalUrl;

  try {
    if (isStringNullOrEmpty(miniDigitalUrl)) {
      throw new Error("The Mini Digital URL has not been defined in the config.");
    }

    // The gateway should not end with a trailing slash
    if (miniDigitalUrl.endsWith("/")) {
      miniDigitalUrl = miniDigitalUrl.substring(0, miniDigitalUrl.length - 1);
    }

    // Enrich the event with additional fields, before submitting to the remote endpoint
    const analyticsEvent = eventEnrichment(event, isBrowser);

    // Send the event to the server using the correct authentication method (JWT tokens if running inside the browser, API keys otherwise).
    // Also, attempt multiple times on HTTP 500 errors (which are by default temporary).
    if (isBrowser) {
      await retryAsyncFetchFunction(
        async () => {
          // Running from within the browser
          await postEventJwt(analyticsEvent, miniDigitalUrl, logResponse);
        },
        config.errorRetryIntervalMs,
        config.maxRetriesOn500,
      );
    } else {
      await retryAsyncFetchFunction(
        async () => {
          // Running from within Node.js, use API Keys
          await postEventApiKey(analyticsEvent, miniDigitalUrl, logResponse);
        },
        config.errorRetryIntervalMs,
        config.maxRetriesOn500,
      );
    }
  } catch (err) {
    if (raiseExceptions) { 
      throw err;
    } else {
      console.error(err);
    }
  }
}

/**
 * Posts an event using the JWT Authentication
 */
async function postEventJwt(event: EnrichedAnalyticsEvent, miniDigitalUrl: string, logResponse: boolean): Promise<ServiceResponse> {
  // Check if a cookie exist with a jwtAuthorizationToken
  jwtAuthorizationToken = config.useCookies ? Cookies.get(COOKIE_NAME_JWT_TOKEN) : undefined;

  // Running from within a browser, use JWT
  const response = await executeJwtFetch(event, false, miniDigitalUrl, logResponse);

  // If all good, we're done here
  if (response.statusCode === 200) return response;

  // If we get a 401, the JWT token is either missing or has expired.
  // The response would have returned a new (valid) token, so try again.
  if (response.statusCode === 401 && !isStringNullOrEmpty(response.authorizationToken)) {
    jwtAuthorizationToken = response.authorizationToken;

    if (config.useCookies && !isStringNullOrEmpty(jwtAuthorizationToken) && jwtAuthorizationToken !== undefined) {
      // Update the cookie with the new token
      Cookies.set(COOKIE_NAME_JWT_TOKEN, jwtAuthorizationToken, {
        domain: !isStringNullOrEmpty(config.cookieDomain) ? config.cookieDomain : undefined,
        expires: config.cookieJwtTokenExpirationDays,
        secure: true,
        sameSite: "strict",
      });
    }

    return await executeJwtFetch(event, true, miniDigitalUrl, logResponse);
  }

  // Should never reach this point
  throw new Error(`The response code "${response.statusCode}" from Mini Digital was not expected.`);
}

/**
 * Helper function that executes the actual fetch request, using JWT authentication
 */
async function executeJwtFetch(
  event: EnrichedAnalyticsEvent,
  forceErrorOn401: boolean,
  miniDigitalUrl: string,
  logResponse: boolean,
): Promise<ServiceResponse> {
  let response: Response;
  try {
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (!isStringNullOrEmpty(jwtAuthorizationToken) && jwtAuthorizationToken !== undefined) {
      headers.Authorization = jwtAuthorizationToken;
    }
    response = await fetch(`${miniDigitalUrl}/events/jwt/v1/${event.eventId}`, {
      method: "POST",
      headers,
      body: JSON.stringify(event),
    });
  } catch (error: any) {
    throw new Error("Error interfacing with Mini Digital.");
  }

  if (!response.ok) {
    if (
      response.status !== 401 ||
      (response.status === 401 && (isStringNullOrEmpty(response.headers.get("Authorization")) || forceErrorOn401))
    ) {
      throw new HttpError(`Mini Digital POST error! Status: ${response.status}`, response.status);
    }
  }

  return await parseMiniDigitalResponse(response, event, logResponse);
}

/**
 * Posts an event using the API Key Authentication
 */
async function postEventApiKey(event: EnrichedAnalyticsEvent, miniDigitalUrl: string, logResponse: boolean): Promise<ServiceResponse> {
  const apiKey = config.apiKey;

  if (isStringNullOrEmpty(apiKey) || apiKey === undefined) {
    throw new Error("The API Key is not set in config.");
  }

  let response: Response;
  try {
    response = await fetch(`${miniDigitalUrl}/events/key/v1/${event.eventId}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(event),
    });
  } catch (error: any) {
    throw new Error("Error interfacing with Mini Digital.");
  }

  if (!response.ok) {
    throw new HttpError(`Mini Digital POST error! Status: ${response.status}`, response.status);
  }

  return await parseMiniDigitalResponse(response, event, logResponse);
}

/**
 * Parses the response, for both JWT and API key authentication
 */
async function parseMiniDigitalResponse(response: Response, event: EnrichedAnalyticsEvent, logResponse: boolean): Promise<ServiceResponse> {
  try {
    const responseBody = await response.json();
    const serviceResponse: ServiceResponse = {
      message: responseBody.message,
      statusCode: response.status,
      authorizationToken: response.headers.get("Authorization") ?? undefined,
    };

    if (logResponse) {
      console.log(`Posted event: ${event.eventId}, outcome: ${serviceResponse.message} (${serviceResponse.statusCode})`);
    }

    return serviceResponse;
  } catch (error: any) {
    throw new Error("Could not parse the Mini Digital response.");
  }
}
