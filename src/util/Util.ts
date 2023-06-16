import { v4 as uuid } from "uuid";

/**
 * Check if the `test` string has a value defined
 */
export function isStringNullOrEmpty(test: string | null | undefined): boolean {
  return test === null || test === undefined || test.trim().length === 0;
}

/**
 * Generates a unique event Id (UUID)
 */
export function generateEventId(): string {
  return uuid();
}

/**
 * Generates the event timestamp (based on UTC time) in the ISO format
 */
export function generateEventTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Return the user agent from the browser
 */
export function getBrowserUserAgent(): string {
  return window.navigator.userAgent;
}

/**
 * Return the local time zone from the browser, in the format e.g. "Pacific/Auckland"
 */
export function getBrowserUserLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Return the referrer property of the current page
 */
export function getBrowserReferrer(): string {
  return document.referrer;
}

/**
 * Return the current page of the browser
 */
export function getBrowserCurrentPage(): string {
  return window.location.href;
}

/**
 * Get the screen width of the window from the browser
 */
export function getBrowserWindowScreenWidth(): number {
  return window.screen.width;
}

/**
 * Get the screen height of the window from the browser
 */
export function getBrowserWindowScreenHeight(): number {
  return window.screen.height;
}
