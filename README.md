# @wunderbar-network/mini-digital-sdk

Shared library that provides an interface for Event Tracking using the **Mini Digital Gateway** to Vue/Node.js applications.

## Usage

Add the following to your `package.json`:

```json
{
  // ...
  "dependencies": {
    "@wunderbar-network/mini-digital-sdk": "git+ssh://git@github.com:WunderbarNetwork/mini-digital-sdk.git",
  },
  // ...
}
```

You can also include a specific branch by doing `repo.git#branch-name` at the end.

You can then import classes and types directly into your project like so:

```ts
import { EventTrackingService } from "@wunderbar-network/mini-digital-sdk";
import type { AnalyticsEvent } from "@wunderbar-network/mini-digital-sdk";
```
