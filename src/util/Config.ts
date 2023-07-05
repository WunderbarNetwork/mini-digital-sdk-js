interface MiniDigitalConfig {
  /**
   * The API Key to send to Mini Digital, if using API Key Authentication.
   */
  apiKey?: string;
  /**
   * The domain under which cookies will be stored. If empty, defaults to domain of the current page.
   * To store a cookie under all subdomains, use the following syntax: `.example.com`.
   */
  cookieDomain?: string;
  /**
   * Expiration of the Cookie storing the JWT token (in days). Default = **1 day**.
   */
  cookieJwtTokenExpirationDays: number;
  /**
   * Expiration of the Cookie storing the tracking Id (in days). Default = **30 days**.
   */
  cookieTrackingIdExpirationDays: number;
  /**
   * If a request to Mini Digital fails with an error, the number of milliseconds to retry again after.
   * Default = **1000ms**, **0** = do not retry.
   */
  errorRetryIntervalMs: number;
  /**
   * The maximum number of times to retry sending an event, in case the server responds with HTTP 500 (Internal Server Error).
   * 500 errors are generally temporary. Default = **3** times, **0** = do not retry.
   */
  maxRetriesOn500: number;
  /**
   * Default value for the Mini Digital Event Ingress URL, can be customized if needed.
   */
  miniDigitalUrl: string;
  /**
   * Set to `true` to temporarily pause tracking (sending events to the server)
   */
  pauseTracking: boolean;
  /**
   * Set to `false` to turn off storing a Mini Digital Tracking ID into a secure cookie.
   * This will limit the ability to link events performed by anonymous (non logged-in) users.
   */
  useCookies: boolean;
}

/**
 * Mini Digital Config defaults
 */
export const config: MiniDigitalConfig = {
  cookieJwtTokenExpirationDays: 1,
  cookieTrackingIdExpirationDays: 30,
  errorRetryIntervalMs: 1000,
  maxRetriesOn500: 3,
  miniDigitalUrl: "https://api.mini.digital",
  pauseTracking: false,
  useCookies: true,
};

/** The name & version to identify this SDK */
export const SDK_VERSION: string = "mini-digital-sdk-js-v__BUILD_PACKAGE_VERSION__"; // `__BUILD_PACKAGE_VERSION__` will be replaced post-build

/** The name of the cookie which stores the trackingId */
export const COOKIE_NAME_TRACKING_ID: string = "MINI_DIGITAL_TRACKING_ID";

/** The name of the cookie which stores the JWT Authorization Token */
export const COOKIE_NAME_JWT_TOKEN: string = "MINI_DIGITAL_JWT_TOKEN";
