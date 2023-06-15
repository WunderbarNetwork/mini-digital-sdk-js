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
   * Expiration of the Cookie storing the JWT token (in seconds). Default = 1 day.
   */
  cookieJwtTokenExpiration: number;
  /**
   * Expiration of the Cookie storing the tracking Id (in seconds). Default = 30 days.
   */
  cookieTrackingIdExpiration: number;
  /**
   * Default value for the Mini Digital Event Ingress URL, can be customized if needed.
   */
  miniDigitalUrl: string;
}

/** Mini Digital Config */
export const config: MiniDigitalConfig = {
  cookieJwtTokenExpiration: 60 * 60 * 24,
  cookieTrackingIdExpiration: 60 * 60 * 24 * 30,
  miniDigitalUrl: "https://api.mini.digital",
};

/** The name & version to identify this SDK */
export const SDK_VERSION: string = "mini-digital-sdk-js-v__BUILD_PACKAGE_VERSION__";

/** The name of the cookie which stores the trackingId */
export const COOKIE_NAME_TRACKING_ID: string = "MINI_DIGITAL_TRACKING_ID";

/** The name of the cookie which stores the JWT Authorization Token */
export const COOKIE_NAME_JWT_TOKEN: string = "MINI_DIGITAL_JWT_TOKEN";
