# 2.9.0 - December 18, 2020

## Fixed

-   Reduce the size of vendor dependencies ([#306](https://github.com/forcedotcom/lwc-dev-server/pull/306))
-   Support showing different component errors during the same session ([#296](https://github.com/forcedotcom/lwc-dev-server/pull/296/files))

# 2.8.0 - December 11, 2020

## Fixed

-   Fix picklist failure on load ([#293](https://github.com/forcedotcom/lwc-dev-server/pull/293))
-   Add more informative error message for components when a dependent component is not present ([#292](https://github.com/forcedotcom/lwc-dev-server/pull/292))

-   Rebuild static resources on change and perform livereload ([#274](https://github.com/forcedotcom/lwc-dev-server/pull/274)), [Issue #22](https://github.com/forcedotcom/lwc-dev-server-feedback/issues/22)

# 2.7.0 - November 20, 2020

## Fixed

-   Revert cache clear of `.localdevserver` upon startup to address showing a blank screen after server startup ([#282](https://github.com/forcedotcom/lwc-dev-server/pull/282)), [Issue #91](https://github.com/forcedotcom/lwc-dev-server-feedback/issues/91))

# 2.6.0 - November 16, 2020

## Added

-   Add support for 230 Base Components ([#262](https://github.com/forcedotcom/lwc-dev-server/pull/262))
-   Add support for lightning-map, platformShowToastEvent, formatted-address, lightning-file-upload, and emp-api components ([#265](https://github.com/forcedotcom/lwc-dev-server/pull/265))
-   Remove `.localdevserver` cache upon start up ([#269](https://github.com/forcedotcom/lwc-dev-server/pull/269))

## Fixed

-   Fixed error message when attempting to preview a component using Lightning Message Service ([#267](https://github.com/forcedotcom/lwc-dev-server/pull/267))
-   Fix error message for component failures ([#271](https://github.com/forcedotcom/lwc-dev-server/pull/271))

# 2.5.2 - September 11, 2020

## Added

-   Added support for 228 dependencies ([#255](https://github.com/forcedotcom/lwc-dev-server/pull/255))

# 2.5.1 - August 5, 2020

## Added

-   Added signing for plugin ([#240](https://github.com/forcedotcom/lwc-dev-server/pull/240))

# 2.5.0 - July 17, 2020

## Fixed

-   Default to use Api version 49.0 ([PR #236](https://github.com/forcedotcom/lwc-dev-server/pull/236))

# 2.4.0 - July 9, 2020

## Fixed

-   Support projects using namespace configuration ([PR #228](https://github.com/forcedotcom/lwc-dev-server/pull/228))
-   Show unsupported error message when a component uses `@salesforce/apexContinuation` ([PR #227](https://github.com/forcedotcom/lwc-dev-server/pull/227))
-   Support projects with customized folder structures ([PR #231](https://github.com/forcedotcom/lwc-dev-server/pull/231))

# 2.3.0 - July 2, 2020

## Added

-   Added support for Salesforce scoped import contentAssetUrl ([PR #222](https://github.com/forcedotcom/lwc-dev-server/pull/222))

# 2.2.0 - June 18, 2020

## Fixed

-   Support salesforce-scoped import `@salesforce/user/Id` ([PR #219](https://github.com/forcedotcom/lwc-dev-server/pull/219))
-   Fix cryptic error messages when components use unsupported imports ([PR #219](https://github.com/forcedotcom/lwc-dev-server/pull/219))
-   Fix multiple error logs when running into exceptions ([PR #218](https://github.com/forcedotcom/lwc-dev-server/pull/218))

# 2.1.1 - June 10, 2020

## Fixed

-   Log warnings when `localdevserver.config.json` configuration is incorrect ([PR #215](https://github.com/forcedotcom/lwc-dev-server/pull/215))
-   Use lightning navigation implementation from webruntime ([PR #214](https://github.com/forcedotcom/lwc-dev-server/pull/214))

# 2.1.0 June 4, 2020

## Fixed

-   Replace Talon with LWR
