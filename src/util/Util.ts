import { v4 as uuid } from "uuid";

import HttpError from "./HttpError.js";

/**
 * Retry a function call given number of times before failing. This function will only retry if a `HttpError` with a status 500 is caught.
 *
 * @param fn Function to execute
 * @param retryIntervalMillis Interval to wait between retries (0 = do not retry, execute once only)
 * @param retries Number of retries (0 = do not retry, execute once only)
 * @param lastError Error to return
 * @returns
 */
export async function retryAsyncFetchFunction<T>(
  fn: () => Promise<T>,
  retryIntervalMillis: number,
  retries: number,
  lastError?: Error,
): Promise<T> {
  if (retryIntervalMillis <= 0 || retries <= 0) {
    // Do not retry, only execute once
    return await fn();
  } else {
    return retries === 0
      ? await Promise.reject(lastError)
      : await fn().catch(async (error) => {
          if (error instanceof HttpError && error.statusCode >= 500 && error.statusCode <= 599) {
            await new Promise((resolve) => setTimeout(resolve, retryIntervalMillis));
            return await retryAsyncFetchFunction<T>(fn, retryIntervalMillis, retries - 1, error);
          } else {
            return await Promise.reject(error);
          }
        });
  }
}

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
