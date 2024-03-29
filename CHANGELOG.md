# Mini Digital SDK Changelog

## [v1.4.1](https://github.com/WunderbarNetwork/mini-digital-sdk-js/compare/v1.3.1...v1.4.0) (2023-08-16)

Added:

- Optional parameter `raiseExceptions` has been added to `EventTrackingService.postEvent()` function. 
  This ensures that the SDK will not raise exceptions unexpectedly, instead a `console.error()` will present the error when set as default(false).

## [v1.4.0](https://github.com/WunderbarNetwork/mini-digital-sdk-js/compare/v1.3.1...v1.4.0) (2023-07-26)

⚠️ Bundle location and file names have been modified, and ESM/UMD/CJS bundles now sit in the `lib/bundles` folder.

Added:

- Added the CHANGELOG.md file
- Dev: Greatly expanded the test coverage
- Dev: GitHub action which uploads bundles to the Mini Digital CDN
- Dev: CI/Build runs on all supported Node versions - 16 (LTS), 18 (LTS) & 20 (latest)

Fixed:

- TrackingID was not set correctly in certain edge cases
- Updated dependency packages to fix vulnerability (CVE-2022-25883)
  Note that the vulnerability only affected devDependency packages (i.e. does not affect production builds)
- Dev: ESLint wasn't loading all the plugins and configs before

## [v1.3.1](https://github.com/WunderbarNetwork/mini-digital-sdk-js/compare/v1.3.0...v1.3.1) (2023-07-06)

Fixed:

- Publishing to npm applied the wrong tag, now applies latest tag

## [v1.3.0](https://github.com/WunderbarNetwork/mini-digital-sdk-js/compare/v1.2.0...v1.3.0) (2023-07-06)

- Automatic retry on HTTP 500 errors returned from the server
- Better handling of HTTP errors, including a newly exported `HttpError` class
- New config options: `errorRetryIntervalMs`, `maxRetriesOn500`
- GitHub action to automatically publish to npm, fixed CI action
- Improved tests
- Minor refactoring

## [v1.2.0](https://github.com/WunderbarNetwork/mini-digital-sdk-js/compare/v1.1.0...v1.2.0) (2023-06-30)

- New config params: pauseTracking, useCookies
- Fixed a bug with setting cookie time
- Fixed a bug when 401 from the server (if the origin was missing) would not result in an error being thrown
- Added tests & GitHub CI Workflow to run them
- Updated README, package.json and .npmrc - ready for npm publish

## [v1.1.0](https://github.com/WunderbarNetwork/mini-digital-sdk-js/compare/v1.0.1...v1.1.0) (2023-06-16)

- Using cookies to store TrackingID and JWT tokens
- Bug fixes & documentation improvements

## [v1.0.1](https://github.com/WunderbarNetwork/mini-digital-sdk-js/compare/v1.0.0...v1.0.1) (2023-06-08)

- Changed internal API routes

## [v1.0.0](https://github.com/WunderbarNetwork/mini-digital-sdk-js/compare/v0.1.0...v1.0.0) (2023-06-07)

First public release of Mini Digital.
