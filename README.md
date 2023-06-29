# @wunderbar-network/mini-digital-sdk

Library that provides an interface to capture analytics events, and send them to [Mini Digital](https://mini.digital). This library can be used in either Node.js or browser-based TypeScript/JavaScript implementations (including frameworks like React or Vue).

## Installation

To install the library, you can use npm or yarn. Run the following command:

```shell
npm install @wunderbar-network/mini-digital-sdk
```

or

```shell
yarn add @wunderbar-network/mini-digital-sdk
```

### Usage

To send a quick event using the Mini Digital SDK, do the following:

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

See our API reference to get a deeper understanding of the event schema.

### Browser builds

If you want a browser-friendly build to use directly into your HTML code, browser builds (CJS/ESM) can be found in the `lib/browser` folder.

### Config

By default, the config is set to send events to the production Mini Digital endpoint. If you wish to override the default Mini Digital URL (to point to e.g. a testing instance), you can do so by overriding the config namespace variable:

```ts
import { EventTrackingConfig } from "@wunderbar-network/mini-digital-sdk";

// Override the default value
EventTrackingConfig.miniDigitalUrl = "http://localhost:3333/";
```

You can also choose to _pause_ sending events (e.g. in your test suites), or not use cookies (to store anonymous tracking IDs):

```ts
import { EventTrackingConfig } from "@wunderbar-network/mini-digital-sdk";

// Override the default value
EventTrackingConfig.pauseTracking = true;
EventTrackingConfig.useCookies = false;
```

See our API reference for the full list of configuration options.
