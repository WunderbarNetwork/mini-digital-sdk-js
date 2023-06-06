import type { ConsumerAnalyticsEvent } from "./types/ConsumerAnalyticsEvent.js";
import { config as EventTrackingConfig } from "./util/Config.js";

import * as EventTrackingService from "./services/EventTrackingService.js";
import * as EventTrackingUtil from "./util/Util.js";

export { type ConsumerAnalyticsEvent as AnalyticsEvent, EventTrackingService, EventTrackingConfig, EventTrackingUtil };
