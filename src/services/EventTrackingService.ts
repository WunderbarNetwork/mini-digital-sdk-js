import type { AnalyticsEvent } from "../types/AnalyticsEvent.js";
import type { ServiceResponse } from "../types/ServiceResponse.js";

import { config } from "../util/Config.js";

/** JWT Auth token obtained from Mini Digital */
let jwtAuthorizationToken: string | undefined;

/** Determine if the SDK is running inside a browser (uses JWT authentication) or Node.js (uses API Key authentication). */
const isBrowser: boolean = typeof window !== "undefined" && typeof window.document !== "undefined";

/** Check if the `test` string has a value defined */
const isStringNullOrEmpty = (test: string | null | undefined): boolean => {
  return test === null || test === undefined || test.trim().length === 0;
};

/**
 * Provides an interface towards the **Mini Digital Event API**, to submit `AnalyticsEvent` objects.
 *
 * @param event Event to be stored
 * @param logResponse Optional - output to console when event has been successfully posted (default = false)
 */
export async function postEvent(event: AnalyticsEvent, logResponse: boolean = false): Promise<void> {
  let miniDigitalUrl: string = config.miniDigitalUrl;

  if (isStringNullOrEmpty(miniDigitalUrl)) {
    throw new Error("The Mini Digital URL has not been defined in the config.");
  }

  // The gateway should not end with a trailing slash
  if (miniDigitalUrl.endsWith("/")) {
    miniDigitalUrl = miniDigitalUrl.substring(0, miniDigitalUrl.length - 1);
  }

  if (isBrowser) {
    // Running from within a browser, use JWT
    const response = await postEventJwt(event, false, miniDigitalUrl, logResponse);

    // If all good, we're done here
    if (response.statusCode === 200) return;

    // If we get a 401, the JWT token is either missing or has expired, so try again
    if (response.statusCode === 401 && !isStringNullOrEmpty(response.authorizationToken)) {
      jwtAuthorizationToken = response.authorizationToken;
      await postEventJwt(event, true, miniDigitalUrl, logResponse);
    }
  } else {
    // Running from within Node.js, use API Keys
    await postEventApiKey(event, miniDigitalUrl, logResponse);
  }
}

/**
 * Posts an event using the JWT Authentication
 */
async function postEventJwt(
  event: AnalyticsEvent,
  forceErrorOn401: boolean,
  miniDigitalUrl: string,
  logResponse: boolean
): Promise<ServiceResponse> {
  let response: Response;
  try {
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (!isStringNullOrEmpty(jwtAuthorizationToken)) {
      headers.Authorization = jwtAuthorizationToken ?? "";
    }
    response = await fetch(`${miniDigitalUrl}/events/jwt/${event.eventId}`, {
      method: "POST",
      headers,
      body: JSON.stringify(event),
    });
  } catch (error: any) {
    throw new Error("Error interfacing with Mini Digital.");
  }

  if (!response.ok) {
    if (response.status !== 401 || (response.status === 401 && forceErrorOn401)) {
      throw new Error(`Mini Digital POST error! Status: ${response.status}`);
    }
  }

  const responseBody = await response.json();

  try {
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

/**
 * Posts an event using the API Key Authentication
 */
async function postEventApiKey(event: AnalyticsEvent, miniDigitalUrl: string, logResponse: boolean): Promise<ServiceResponse> {
  const apiKey = config.apiKey;

  if (isStringNullOrEmpty(apiKey)) {
    throw new Error("The API Key is not set in config.");
  }

  let response: Response;
  try {
    response = await fetch(`${miniDigitalUrl}/events/key/${event.eventId}`, {
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
    throw new Error(`Mini Digital POST error! Status: ${response.status}`);
  }

  const responseBody = await response.json();

  try {
    const serviceResponse: ServiceResponse = {
      message: responseBody.message,
      statusCode: response.status,
    };

    if (logResponse) {
      console.log(`Posted event: ${event.eventId}, outcome: ${serviceResponse.message} (${serviceResponse.statusCode})`);
    }

    return serviceResponse;
  } catch (error: any) {
    throw new Error("Could not parse the Mini Digital response.");
  }
}
