# @wunderbar-network/mini-digital-sdk-js

Shared library that provides an interface for Event Tracking using the **Mini Digital Ingress** to Node or browser-based TS/JS implementations.

## Usage

### Node.js

Add the following to your `package.json`:

```json
{
  // ...
  "dependencies": {
    "@wunderbar-network/mini-digital-sdk-js": "git+ssh://git@github.com:WunderbarNetwork/mini-digital-sdk-js.git",
  },
  // ...
}
```

You can also include a specific branch by doing `repo.git#branch-name` at the end.

You can then import classes and types directly into your project like so:

```ts
import { EventTrackingService, EventTrackingUtil } from "@wunderbar-network/event-tracking-service";
import type { AnalyticsEvent } from "@wunderbar-network/event-tracking-service";
```

The `EventTrackingUtil` class has many methods that could make capturing some of the fields for the `AnalyticsEvent` easier.

### Browser

If you are capturing events from the browser and want a browser-friendly build, this can be found in the `lib/browser` folder.
