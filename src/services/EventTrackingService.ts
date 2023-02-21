import type { AnalyticsEvent } from "../types/AnalyticsEvent.js";
import type { ServiceResponse } from "../types/ServiceResponse.js";

import { v4 as uuid } from "uuid";

export default class EventTrackingService {
  protected static _instance: EventTrackingService | null = null;

  protected _miniDigitalGateway: string;
  protected _userId: string;

  private constructor() {
    this._miniDigitalGateway = "https://0lv5gvqpnb.execute-api.ap-southeast-2.amazonaws.com/prod";
    this._userId = uuid();
  }

  /**
   * Obtain a reference to the Event Tracking Service class
   */
  static getService(): EventTrackingService {
    if (EventTrackingService._instance === null) {
      EventTrackingService._instance = new EventTrackingService();
    }

    return EventTrackingService._instance;
  }

  /**
   * Return the User ID for the purpose of Event Tracking
   */
  userId(): string {
    return this._userId;
  }

  /**
   * Send the event to the gateway
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
      throw new Error(errors?.map((e: any) => e.message).join("\n") ?? "unknown");
    }
  }
}
