import { v4 as uuid } from "uuid";

/**
 * Generates a unique event Id (UUID)
 */
export function generateEventId(): string {
  return uuid();
}

/**
 * Generates the event timestamp (based on UTC time) in the ISO format
 */
export function getEventTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Return the user agent from the browser
 */
export function getUserAgent(): string {
  return window.navigator.userAgent;
}

/**
 * Return the local time zone from the browser, in the format e.g. "Pacific/Auckland"
 */
export function getUserLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
