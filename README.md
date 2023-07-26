# @wunderbar-network/mini-digital-sdk

[![CI](https://github.com/WunderbarNetwork/mini-digital-sdk-js/actions/workflows/ci.yaml/badge.svg)](https://github.com/WunderbarNetwork/mini-digital-sdk-js/actions/workflows/ci.yaml)

Library that provides an interface to capture analytics events, and send them to [Mini Digital](https://mini.digital). This library can be used in either Node.js or browser-based TypeScript/JavaScript projects (including frameworks like React or Vue).

The SDK is natively built using TypeScript and the ESM module format, and it compiles to the `ES2022` target. There is also backwards CommonJS compatibility provided.

## Installation

To install the SDK, you can use npm or yarn. Run the following command:

```shell
npm install @wunderbar-network/mini-digital-sdk
```

or

```shell
yarn add @wunderbar-network/mini-digital-sdk
```

## Usage

To send a quick Web (front-end) event using the Mini Digital SDK, do the following (TypeScript/ESM syntax):

```ts
// Import the library
import { type AnalyticsEvent, EventTrackingService } from "@wunderbar-network/mini-digital-sdk";

// Declare event
const event: AnalyticsEvent = {
  eventName: "my_first_mini_digital_event",
  eventCategory: "system_outcome_event",
  eventSource: "MyProject.EventTestingPlayground",
  anonymousUser: true,
};

// Send event!
EventTrackingService.postEvent(event);
```

See our API reference to get a deeper understanding of the event schema, and how to send events from different platforms (back-end, mobile, etc).

Sending events to the production endpoint assumes you have already created your project during the Mini Digital App onboarding process. You can always send events to the Mini Digital Event Sink / Sandbox running locally.

## Using bundles inside pure HTML & JavaScript

When not using a package manager (such as npm or yarn), bundles for different module formats can also be directly referenced in client side code (within a `<script>` tag, or in a separate script file). They can be obtained either from the **Mini Digital CDN**, or be found in the `lib/bundles` folder by manually building this project.

Mini Digital provides bundles in two module formats that can be used inside client-side code:

1. **`mini-digital-sdk.min.mjs`** - ES2015 Modules/ESM bundle for most modern browsers
2. **`mini-digital-sdk.min.umd.js`** - Universal Module Definition/UMD bundle, primarily intended for older browsers or other environments

When referencing bundles from the **Mini Digital CDN**, the CDN URL is as follows:

```text
https://cdn.mini.digital/lib/js/v1.4/mini-digital-sdk.min.mjs
```

The **version** in the CDN URL above is in the format **`v#MAJOR.#MINOR`** and will always give the latest published **revision**. Released versions can be seen on our [GitHub releases page](https://github.com/WunderbarNetwork/mini-digital-sdk-js/releases).

All of the bundles are minified (hence the `.min` in the file names), and source maps (attaching `.map` to the end of the file name) are also available.

Note: The SDK also provides a third module format (CommonJS/CJS), called `mini-digital-sdk.min.cjs` (and it is also available either via the CDN or from the `lib/bundles` folder). This bundle is primarily intended for backwards compatibility with older Node.js projects (using the `require` rather than `import` syntax), and cannot be used within Web Browsers without previously being converted to a "browser-friendly" version using tools such as webpack or browserify.

### Using the ES2015 Modules/ESM bundle

The ESM bundle is recommended to be used whenever possible, as most modern browsers on desktop and mobile will come with ESM support. To reference the ESM bundle version of the SDK from the **Mini Digital CDN** and send an event, do the following:

```html
<button type="button" id="myButton">Send Interaction Event</button>

<script type="module">
  // Import the ESM-compatible library from the CDN
  import { EventTrackingService } from "https://cdn.mini.digital/lib/js/v1.4/mini-digital-sdk.min.mjs";

  document.getElementById("myButton").addEventListener("click", () => {
    EventTrackingService.postEvent({
      eventName: "button_clicked",
      eventCategory: "interaction_event",
      eventSource: "MyHtmlPage.Button",
      anonymousUser: true,
    });
  });
</script>
```

### Using the Universal Module Definition/UMD bundle

For older browsers, a UMD version of the bundle can also be used. To send the same event as above, while also referencing the UMD bundle version of the SDK from the **Mini Digital CDN**, do the following:

```html
<button type="button" id="myButton">Send Interaction Event</button>

<!-- Import the UMD-compatible library from the CDN -->
<script type="text/javascript" src="https://cdn.mini.digital/lib/js/v1.4/mini-digital-sdk.min.umd.js" defer onload="afterLibraryLoaded()"></script>

<script type="text/javascript">
  // Function to execute after the UMD library has loaded
  function afterLibraryLoaded() {
    document.getElementById("myButton").addEventListener("click", () => {
      // The Mini Digital SDK "lives" in the global `window.MiniDigital` object
      window.MiniDigital.EventTrackingService.postEvent({
        eventName: "button_clicked",
        eventCategory: "interaction_event",
        eventSource: "MyHtmlPage.Button",
        anonymousUser: true,
      });
    });
  }
</script>
```

## Config

By default, the config is set to send events to the production Mini Digital endpoint. If you wish to override the default Mini Digital URL (to point to e.g. a local testing instance), you can do so by overriding the config namespace variable:

```ts
import { EventTrackingConfig } from "@wunderbar-network/mini-digital-sdk";

// Override the default value
EventTrackingConfig.miniDigitalUrl = "http://localhost:3333/";
```

You can also choose to _pause_ sending events (e.g. in your test suites/CI builds), or not use cookies (to store anonymous tracking IDs):

```ts
import { EventTrackingConfig } from "@wunderbar-network/mini-digital-sdk";

// Override the default value
EventTrackingConfig.pauseTracking = true;
EventTrackingConfig.useCookies = false;
```

See our API reference for the full list of configuration options.
