# @wunderbar-network/event-tracking-service

Shared library that provides an interface for Event Tracking using the Mini Digital Gateway to Vue applications.

## Usage

Add the following to your `package.json`:

```json
{
  // ...
  "dependencies": {
    "@wunderbar-network/event-tracking-service": "git+ssh://git@github.com:WunderbarNetwork/event-tracking-service.git",
  },
  // ...
}
```

You can also include a specific branch by doing `repo.git#branch-name` at the end.

You can then import classes and types directly into your project like so:

```ts
import { EventTrackingService } from "@wunderbar-network/event-tracking-service";
import type { AnalyticsEvent } from "@wunderbar-network/event-tracking-service";
```
