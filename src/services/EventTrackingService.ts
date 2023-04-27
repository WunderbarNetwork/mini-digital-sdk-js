import type { AnalyticsEvent } from "../types/AnalyticsEvent.js";
import type { ServiceResponse } from "../types/ServiceResponse.js";

import { config } from "../util/Config.js";

/**
 * Provides an interface towards the **Mini Digital Event API**, to submit `AnalyticsEvent` objects.
 *
 * @param event Event to be stored
 * @param logResponse Optional - output to console when event has been successfully posted (default = false)
 */
export async function postEvent(event: AnalyticsEvent, logResponse: boolean = false): Promise<void> {
  let miniDigitalUrl: string = config.miniDigitalUrl;

  if (miniDigitalUrl === null || miniDigitalUrl === undefined || miniDigitalUrl.trim() === "") {
    throw new Error("The Mini Digital URL has not been defined in the config.");
  }

  // The gateway should not end with a trailing slash
  if (miniDigitalUrl.endsWith("/")) {
    miniDigitalUrl = miniDigitalUrl.substring(0, miniDigitalUrl.length - 1);
  }

  const response = await fetch(`${miniDigitalUrl}/events/${event.eventId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(`Mini Digital POST error! Status: ${response.status}`);
  }

  const responseBody = await response.json();

  try {
    const serviceResponse: ServiceResponse = {
      message: responseBody.message,
    };

    if (logResponse) {
      console.log(`Posted event: ${event.eventId}, outcome: ${serviceResponse.message} (${response.status})`);
    }
  } catch (error: any) {
    throw new Error("Could not parse the Mini Digital response.");
  }
}
