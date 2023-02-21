import type { AnalyticsEvent } from "../types/AnalyticsEvent.js";
import type { ServiceResponse } from "../types/ServiceResponse.js";

import { v4 as uuid } from "uuid";

import _ from "lodash";

/**
 * Provides an interface towards the **Mini Digital Gateway**, to submit `AnalyticsEvent` objects.
 */
export default class EventTrackingService {
  protected _miniDigitalGateway: string;

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

    this._miniDigitalGateway = miniDigitalGatewayUri;
    this.userId = userId;

    // The gateway should not end with a trailing slash
    if (this._miniDigitalGateway.endsWith("/")) {
      this._miniDigitalGateway = this._miniDigitalGateway.substring(0, this._miniDigitalGateway.length - 1);
    }
  }

  /**
   * Send the event to the gateway
   *
   * @param event Event to be stored
   * @param logResponse Optional - output to console when event has been successfully posted (default = false)
   */
  async postEvent(event: AnalyticsEvent, logResponse: boolean = false): Promise<void> {
    const rawResponse = await fetch(`${this._miniDigitalGateway}/events/${event.eventId}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });

    const { response, errors } = await rawResponse.json();

    if (rawResponse.ok) {
      const serviceResponse = response as ServiceResponse;
      if (logResponse) {
        console.log(`Posted event: ${event.eventId}, outcome: ${serviceResponse.message} (${serviceResponse.statusCode})`);
      }
    } else {
      throw new Error(errors?.map((e: any) => e.message).join("\n") ?? "Unknown error has occurred.");
    }
  }
}
