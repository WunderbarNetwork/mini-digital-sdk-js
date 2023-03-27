import type { AnalyticsEvent } from "../types/AnalyticsEvent.js";
import type { ServiceResponse } from "../types/ServiceResponse.js";

import { v4 as uuid } from "uuid";

import _ from "lodash";

/**
 * Provides an interface towards the **Mini Digital Gateway**, to submit `AnalyticsEvent` objects.
 */
export default class EventTrackingService {
  /** URI of the Mini.Digital Gateway instance */
  protected _miniDigitalGatewayUri: string;

  /** The User ID associated the service. Can be obtained and populated in `AnalyticsEvent` instances. */
  public userId: string;

  /**
   * Provide configuration to the Event Tracking Service class.
   *
   * @param miniDigitalGatewayUri The URI of the gateway instance. Do not include the `/events/{id}` part, just the root URI.
   * @param userId Optional - provide an explicit User ID. If not provided, a random User ID will be generated and used with the class.
   */
  constructor(miniDigitalGatewayUri: string, userId: string = uuid()) {
    if (_.isEmpty(miniDigitalGatewayUri) || _.isEmpty(userId)) {
      throw new Error("Invalid parameters provided to Event Tracking Service.");
    }

    this._miniDigitalGatewayUri = miniDigitalGatewayUri;
    this.userId = userId;

    // The gateway should not end with a trailing slash
    if (this._miniDigitalGatewayUri.endsWith("/")) {
      this._miniDigitalGatewayUri = this._miniDigitalGatewayUri.substring(0, this._miniDigitalGatewayUri.length - 1);
    }
  }

  /**
   * Send the event to the gateway
   *
   * @param event Event to be stored
   * @param logResponse Optional - output to console when event has been successfully posted (default = false)
   */
  async postEvent(event: AnalyticsEvent, logResponse: boolean = false): Promise<void> {
    const response = await fetch(`${this._miniDigitalGatewayUri}/events/${event.eventId}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Gateway POST error! Status: ${response.status}`);
    }

    const data = await response.json();

    try {
      const serviceResponse: ServiceResponse = {
        message: data.message,
        statusCode: data.statusCode,
      };

      if (logResponse) {
        console.log(`Posted event: ${event.eventId}, outcome: ${serviceResponse.message} (${serviceResponse.statusCode})`);
      }
    } catch (error: any) {
      throw new Error("Could not parse the gateway response.");
    }
  }
}
