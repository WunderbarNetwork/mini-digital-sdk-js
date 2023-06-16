# @wunderbar-network/mini-digital-sdk-js

Shared library that provides an interface for Event Tracking using the **Mini Digital Events API** to Node or browser-based TS/JS implementations.

## Usage

### Node.js

Add the following to your `package.json`:

```json
{
  // ...
  "dependencies": {
    "@wunderbar-network/mini-digital-sdk-js": "https://github.com/WunderbarNetwork/mini-digital-sdk-js.git",
  },
  // ...
}
```

You can also include a specific branch by doing `repo.git#branch-name` at the end (e.g. `#v1.1.0`).

You can then import classes and types directly into your project like so:

```ts
import { EventTrackingService, EventTrackingUtil } from "@wunderbar-network/mini-digital-sdk-js";
import type { AnalyticsEvent } from "@wunderbar-network/mini-digital-sdk-js";
```

The `EventTrackingUtil` class has methods that could make capturing some of the fields for the `AnalyticsEvent` easier.

### Browser

If you are capturing events from the browser and want a browser-friendly build, this can be found in the `lib/browser` folder.

### Mini Digital URL

If you wish to override the default Mini Digital URL (to point to e.g. a testing instance), you can do so by overriding the config namespace variable:

```ts
import { EventTrackingConfig } from "@wunderbar-network/mini-digital-sdk-js";

// Override the default value
EventTrackingConfig.miniDigitalUrl = "https://test.api.mini.digital/";
```
