2.1.4-SNAPSHOT / WIP
==================
mobile app
* [OLMIS-7654](https://openlmis.atlassian.net/browse/OLMIS-7654): Create template page for program/facility selection - mobile app
* [OLMIS-7655](https://openlmis.atlassian.net/browse/OLMIS-7655): Enable selecting program and facility on program/facility selection page - mobile app
* [OLMIS-7656](https://openlmis.atlassian.net/browse/OLMIS-7656): Implement searching functionality in Stock on Hand - mobile app
* [OLMIS-7657](https://openlmis.atlassian.net/browse/OLMIS-7657): Add table to mobile Stock on Hand page

2.1.3 / 2022-10-07
==================

New functionality that are backwards-compatible:
* [OLMIS-7373](https://openlmis.atlassian.net/browse/OLMIS-7373): Add filtering by product code, name and lot code on Stock on Hand page

Bug fixes:
* [OLMIS-7579](https://openlmis.atlassian.net/browse/OLMIS-7579): Fixed issue with moving into next screen when current stock = 0 - mobile app
* [OLMIS-7583](https://openlmis.atlassian.net/browse/OLMIS-7583): Fixed 'quantity field is incorrectly recalculated after the reason is removed' - mobile app
* [OLMIS-7574](https://openlmis.atlassian.net/browse/OLMIS-7574): Fixed wrong stock card calculations by adding unaccounted quantity validation
* [OLMIS-7581](https://openlmis.atlassian.net/browse/OLMIS-7581): Fixed wrong order of displaying products after adding a new one in Physical Inventory - mobile app
* [OLMIS-7582](https://openlmis.atlassian.net/browse/OLMIS-7582): fixed getStockAdjustment function when there is no draft in Physical Inventory - mobile app
* [OLMIS-7599](https://openlmis.atlassian.net/browse/OLMIS-7599): fixed refreshing the app - mobile app
* [OLMIS-7593](https://openlmis.atlassian.net/browse/OLMIS-7593): fixed issue with saving the Unaccounted Quantity field in draft
* [OLMIS-7608](https://openlmis.atlassian.net/browse/OLMIS-7608): Fixed wrong error displaying when making receives and updating physical inventory
* [OLMIS-7594](https://openlmis.atlassian.net/browse/OLMIS-7594): Fixed issue with adding same lot codes for different products in one physical inventory draft

Improvements:
* [OLMIS-7588](https://openlmis.atlassian.net/browse/OLMIS-7588): Physical Inventory validation for unaccounted quantity - mobile app
* [OLMIS-7629](https://openlmis.atlassian.net/browse/OLMIS-7629): loading Physical Inventory performance improved

2.1.2 / 2022-04-21
==================

Bug fixes:
* [OLMIS-7387](https://openlmis.atlassian.net/browse/OLMIS-7387): Add pagination params to source-destination service to obtain all assignments
* [OLMIS-7527](https://openlmis.atlassian.net/browse/OLMIS-7527): Fix products added in Physical Inventory has inactive status
* [OLMIS-7464](https://openlmis.atlassian.net/browse/OLMIS-7464): Don't display "Deactivate" button for new products added to physical inventory
* [OLMIS-7560](https://openlmis.atlassian.net/browse/OLMIS-7560): Don't activate already deactivated products after adding new item to inventory draft
* [OLMIS-7558](https://openlmis.atlassian.net/browse/OLMIS-7558): Fix inactive lots validation on Physical Inventory page.

Improvements:
* [OLMIS-7430](https://openlmis.atlassian.net/browse/OLMIS-7430): Add logic to  filter all inactive and active items on physical inventory and stock on hand pages
* [OLMIS-7434](https://openlmis.atlassian.net/browse/OLMIS-7434): Remove items from physical inventory
* [OLMIS-7433](https://openlmis.atlassian.net/browse/OLMIS-7433): Add logic to show only active stock cards
* [OLMIS-7471](https://openlmis.atlassian.net/browse/OLMIS-7471): Change terminology in button and messages from 'hide' to 'deactivate'
* [OLMIS-7467](https://openlmis.atlassian.net/browse/OLMIS-7467): Move React base fields components to ui-components
* [OLMIS-7463](https://openlmis.atlassian.net/browse/OLMIS-7463): Change filter on physical inventory for active/inactive items to checkbox
* [OLMIS-7458](https://openlmis.atlassian.net/browse/OLMIS-7458): Add new lots in receive and physical inventory screens

2.1.0 / 2021-10-28
==================

New functionality that are backwards-compatible:
* [OLMIS-7322](https://openlmis.atlassian.net/browse/OLMIS-7322): Add React main component for physical inventory mobile app.
* [OLMIS-7380](https://openlmis.atlassian.net/browse/OLMIS-7380): Add main layout component for mobile physical inventory process.
* [OLMIS-7379](https://openlmis.atlassian.net/browse/OLMIS-7379): Add page to choose program to start physical inventory.
* [OLMIS-7382](https://openlmis.atlassian.net/browse/OLMIS-7382): Add page for products addition.
* [OLMIS-7384](https://openlmis.atlassian.net/browse/OLMIS-7384): Add confirmation dialog to react mobile app
* [OLMIS-7315](https://openlmis.atlassian.net/browse/OLMIS-7315): Fix navigation on mobile
* [OLMIS-7381](https://openlmis.atlassian.net/browse/OLMIS-7381): Add react form for physical inventory.
* [OLMIS-7383](https://openlmis.atlassian.net/browse/OLMIS-7383): Add possibility to delete physical inventory draft on mobile application

Bug fixes:
* [OLMIS-7291](https://openlmis.atlassian.net/browse/OLMIS-7291): Fixed issue with missing data after changing page on the Issue/Receive/Adjustment screen.
* [OLMIS-7369](https://openlmis.atlassian.net/browse/OLMIS-7369): Fixed issue with orderables and valid sources not being persisted in state in Issue/Receive/Adjustment creation.
* [OLMIS-7412](https://openlmis.atlassian.net/browse/OLMIS-7412): Fixed issue with clicking the previous button after changing mode from offline to online

Improvements:
* [OLMIS-7298](https://openlmis.atlassian.net/browse/OLMIS-7298): Modified returned data because of added page and size parameters for /validSources and /validDestinations endpoints.
* [OLMIS-7323](https://openlmis.atlassian.net/browse/OLMIS-7323): Make Physical Inventory list page responsive with standard breakpoints
* [OLMIS-7318](https://openlmis.atlassian.net/browse/OLMIS-7318): Added the ability to hide unnecessary modules on mobile.
* [OLMIS-7314](https://openlmis.atlassian.net/browse/OLMIS-7314): Update scss files to enable webpack build.
* [OLMIS-7412](https://openlmis.atlassian.net/browse/OLMIS-7412): Add possibility to create draft offline on mobile app.
* [OLMIS-7412](https://openlmis.atlassian.net/browse/OLMIS-7412): Improve program and lot formatting on mobile app.

2.0.9 / 2021-05-27
==================

New functionality that are backwards-compatible:
* [OLMIS-7165](https://openlmis.atlassian.net/browse/OLMIS-7165): Added the ability to cache valid sources, valid reasons, valid destinations and stock card summaries in local storage.
* [OLMIS-7176](https://openlmis.atlassian.net/browse/OLMIS-7176): Adjustment, Receive and Issue page should be available in offline mode.
* [OLMIS-7164](https://openlmis.atlassian.net/browse/OLMIS-7164): Added ability to save Adjustments/Receive/Issue in local storage.
* [OLMIS-7173](https://openlmis.atlassian.net/browse/OLMIS-7173): Added offline alert and notifications.
* [OLMIS-7204](https://openlmis.atlassian.net/browse/OLMIS-7204): Made Stock on Hand screen available offline.
* [OLMIS-7197](https://openlmis.atlassian.net/browse/OLMIS-7197): Refreshed pending offline events indicator after saving a new stock event.
* [OLMIS-7198](https://openlmis.atlassian.net/browse/OLMIS-7198): Added the possibility to redirect to Pending Operations screen from pending offline events link.
* [OLMIS-7181](https://openlmis.atlassian.net/browse/OLMIS-7181): Made Stock Card Summaries cache user-specific.
* [OLMIS-7205](https://openlmis.atlassian.net/browse/OLMIS-7205): Synchronized offline events after logging and switching from offline to online.
* [OLMIS-7221](https://openlmis.atlassian.net/browse/OLMIS-7221): Added saving of stock event synchronization errors in local storage.
* [OLMIS-7207](https://openlmis.atlassian.net/browse/OLMIS-7207): Refreshed offline events indicator after sync error.

Bug fixes:
* [OLMIS-7220](https://openlmis.atlassian.net/browse/OLMIS-7220): Added call to facilityProgramCacheService in the routes.
* [OLMIS-7228](https://openlmis.atlassian.net/browse/OLMIS-7228): Added an alert error when reasons, sources, or destinations were not found in local storage.
* [OLMIS-6813](https://openlmis.atlassian.net/browse/OLMIS-6813): Displaying products with SoH equal 0 on the Adjustments screen.
* [OLMIS-7246](https://openlmis.atlassian.net/browse/OLMIS-7246): Fixed issue with missing pagination in Stock on Hand table.
* [OLMIS-7259](https://openlmis.atlassian.net/browse/OLMIS-7259): Fixed issue with missing pagination in Stock on Hand table in offline mode.

Improvements:
* Updated dev-ui version to 9.0.2.
* Updated ui-components version to 7.2.5.
* Updated auth-ui version to 6.2.6.
* Updated ui-layout version to 5.1.9.
* Updated referencedata-ui version to 5.6.5.

2.0.8 / 2020-11-17
==================

New functionality that are backwards-compatible:
* [OLMIS-6900](https://openlmis.atlassian.net/browse/OLMIS-6900): Added the ability to open localy saved drafts and valid reasons.
* [OLMIS-6897](https://openlmis.atlassian.net/browse/OLMIS-6897): Added the ability to cache physical inventory drafts and valid reasons in local storage.
* [OLMIS-6901](https://openlmis.atlassian.net/browse/OLMIS-6901): Added the ability to cache orderables, lots and orderableFulfills in local storage after going to the Physical Inventory page.
* [OLMIS-6896](https://openlmis.atlassian.net/browse/OLMIS-6896): Added ability to display locally saved drafts in Physical Inventory.
* [OLMIS-6898](https://openlmis.atlassian.net/browse/OLMIS-6898): Added auto-saving draft on Physical Inventory screen.
* [OLMIS-6899](https://openlmis.atlassian.net/browse/OLMIS-6899): Updated physical inventory submit to display error message returned from backend.
* [OLMIS-6920](https://openlmis.atlassian.net/browse/OLMIS-6920): Fixed issue with opening Physical Inventory with trade item products.

Bug fixes:
* [OLMIS-6925](https://openlmis.atlassian.net/browse/OLMIS-6925): Reloaded the physical inventory list after changing offline / online state.
* [OLMIS-6927](https://openlmis.atlassian.net/browse/OLMIS-6927): Added changing the draft status before entering the Physical Inventory draft page.
* [OLMIS-6953](https://openlmis.atlassian.net/browse/OLMIS-6953): Improved performance of adding products to a Physical Inventory.
* [OLMIS-6984](https://openlmis.atlassian.net/browse/OLMIS-6984): Fixed saving Physical Inventory to local storage in online mode.


Improvements:
* Updated ui-components version to 7.2.4.
* Updated auth-ui version to 6.2.5.
* Updated ui-layout version to 5.1.8.
* Updated referencedata-ui version to 5.6.4.

2.0.7 / 2020-05-12
==================

Improvements:
* Updated ui-components version to 7.2.3.
* Updated auth-ui version to 6.2.4.
* Updated ui-layout version to 5.1.7.
* Updated referencedata-ui version to 5.6.3.

2.0.6 / 2020-04-14
==================

Improvements:
* [OLMIS-6724](https://openlmis.atlassian.net/browse/OLMIS-6724): Updated autosaving physical inventory to avoid calling backend on every page change.
* [OLMIS-5406](https://openlmis.atlassian.net/browse/OLMIS-5406): Improved performance of Stock Management > Physical inventory screen.

Bug fixes:
* [OLMIS-6511](https://openlmis.atlassian.net/browse/OLMIS-6511): Fixed displaying lot expiration date and stock card occurred date on stockmanagement screens.
* [OLMIS-6132](https://openlmis.atlassian.net/browse/OLMIS-6132): Fixed pagination issue on Stock Card view screen.
* [OLMIS-6747](https://openlmis.atlassian.net/browse/OLMIS-6747): Fixed filtering on the Unpack screen.
* [OLMIS-6752](https://openlmis.atlassian.net/browse/OLMIS-6752): Fixed filtering date on stock management screens.

2.0.5 / 2019-12-19
==================

Improvements:
* [OLMIS-6618](https://openlmis.atlassian.net/browse/OLMIS-6618): Added quantity validation for DEBIT reason.

Bug fixes:
* [OLMIS-6299](https://openlmis.atlassian.net/browse/OLMIS-6299): Fixed "Add" button going beyond the Reason Add modal.
* [OLMIS-6670](https://openlmis.atlassian.net/browse/OLMIS-6670): Fixed issue with making Physical Inventory when there is more than one page with products:
    * Added autosaving of physical inventory on page change

2.0.4 / 2019-10-17
==================

Improvements:
* [OLMIS-6556](https://openlmis.atlassian.net/browse/OLMIS-6556): Add support for limiting sources and destinations.
* [OLMIS-6596](https://openlmis.atlassian.net/browse/OLMIS-6596): Reasons dropdown will no longer show on the Unpack kit screen.

2.0.3 / 2019-05-27
==================

Improvements:
* [OLMIS-6113](https://openlmis.atlassian.net/browse/OLMIS-6113): Create UI for kit unpacking in stock management

Bug fixes:
* [OLMIS-6330](https://openlmis.atlassian.net/browse/OLMIS-6330): fixed trigerring reference-ui build.

2.0.2 / 2018-12-12
==================

Improvements:
* [OLMIS-5409](https://openlmis.atlassian.net/browse/OLMIS-5409): Updated ui-components to version 7.0.0.
* [OLMIS-3696](https://openlmis.atlassian.net/browse/OLMIS-3696): Added dependency and development dependency locking.
* [OLMIS-5438](https://openlmis.atlassian.net/browse/OLMIS-5438): Categorize orderables under respective product category in physical inventory page

2.0.1 / 2018-10-01
==================

Improvements:
* [OLMIS-5235](https://openlmis.atlassian.net/browse/OLMIS-5235): Reworked current user home facility caching to use loginService hook instead of a decorator.

2.0.0 / 2018-08-16
==================

Breaking changes:
* [OLMIS-4623](https://openlmis.atlassian.net/browse/OLMIS-4623): Renamed admin-reason-modal module to admin-reason-add and made it a state

New functionality that are backwards-compatible:
* [OLMIS-4623](https://openlmis.atlassian.net/browse/OLMIS-4623): Added the ability to add/select tags when creating new reason
* [OLMIS-4622](https://openlmis.atlassian.net/browse/OLMIS-4622): Added the ability to edit reasons
* [OLMIS-4788](https://openlmis.atlassian.net/browse/OLMIS-4788): Added text explanation for adding reason tags

Bug fixes:
* [OLMIS-4089](https://openlmis.atlassian.net/browse/OLMIS-4089): Programs not supported by the users home facility will no longer show on the Receive, Adjustment, Issue and Physical Inventory screens
* [OLMIS-4757](https://openlmis.atlassian.net/browse/OLMIS-4757): Fixed URI too long error when trying to make an adjustment
* [OLMIS-4933](https://openlmis.atlassian.net/browse/OLMIS-4933): Fixed submitting physical inventory when with today's date.
* [OLMIS-4404](https://openlmis.atlassian.net/browse/OLMIS-4404): Stock on Hand View will no longer show empty summaries.
* [OLMIS-5945](https://openlmis.atlassian.net/browse/OLMIS-5945): Fix updating adjustment reason failure.

Improvements:
* [OLMIS-4742](https://openlmis.atlassian.net/browse/OLMIS-4742): Added Jenkinsfile.
* [OLMIS-3193](https://openlmis.atlassian.net/browse/OLMIS-3193): Arrangement of menu items with logical flow
* [OLMIS-4795](https://openlmis.atlassian.net/browse/OLMIS-4795): Updated dev-ui to version 8.
* [OLMIS-4813](https://openlmis.atlassian.net/browse/OLMIS-4813): Updated datepickers to use the new syntax.
* [OLMIS-4813](https://openlmis.atlassian.net/browse/OLMIS-4813): Updated ui-components to version 6.0.0.

1.1.0 / 2018-04-24
==================

New functionality that are backwards-compatible:
* [OLMIS-3108:](https://openlmis.atlassian.net/browse/OLMIS-3108) Updated to use dev-ui v7 transifex build process
* [OLMIS-685:](https://openlmis.atlassian.net/browse/OLMIS-685) Added the ability to search valid reason assignment by reason type

Improvements:
* [OLMIS-3876](https://openlmis.atlassian.net/browse/OLMIS-3876): Split fliter and navigation froms in Stock on Hand page
* [OLMIS-3027](https://openlmis.atlassian.net/browse/OLMIS-3027): VVM status only shows when there are orderables with VVM status configured
* [OLMIS-3921](https://openlmis.atlassian.net/browse/OLMIS-3921): Remove validations from the Physical Inventory view to allow for unaccounted quantities
  * Added a visual indication of the unaccounted quantity so the user understands.
  * On stock card view, changed "Reason" Overstock/Understock/Balance adjustment to "Physical Inventory".
* [OLMIS-4118](https://openlmis.atlassian.net/browse/OLMIS-4118): Show display unit for Dispensable
* [OLMIS-4143](https://openlmis.atlassian.net/browse/OLMIS-4143): Display labels inline.

Bug fixes:
* [OLMIS-3562](https://openlmis.atlassian.net/browse/OLMIS-3562): Added missing facility-program-cache registration.
* [OLMIS-3295](https://openlmis.atlassian.net/browse/OLMIS-3295): Updated stock event structure to match new stock management API
* [OLMIS-3769](https://openlmis.atlassian.net/browse/OLMIS-3769): Added missed facilityId and programId to the stock event.
* [OLMIS-3769](https://openlmis.atlassian.net/browse/OLMIS-3769): Fix Stock on Hand calculations for Physical Inventory adjustments on Stock Card view
* [OLMIS-4142](https://openlmis.atlassian.net/browse/OLMIS-4142): Fixed stock adjustments did not allow adding more than one product
* [OLMIS-4410](https://openlmis.atlassian.net/browse/OLMIS-4410): Adjusted the add reason modal to the new API
* [OLMIS-4541](https://openlmis.atlassian.net/browse/OLMIS-4541): Made error behavior on the Adjustment screen consistent

1.0.1 / 2017-11-09
==================

New functionality that are backwards-compatible:
* [OLMIS-2732](https://openlmis.atlassian.net/browse/OLMIS-2732): Print submitted physical inventory

Improvements:
* [OLMIS-3246](https://openlmis.atlassian.net/browse/OLMIS-3246): Added 'show' field to reason assignments
* [OLMIS-4097](https://openlmis.atlassian.net/browse/OLMIS-4097): Reworked facility-program select component to use cached rograms, minimal facilities and permission strings.
* Updated dev-ui version to 6.

1.0.0 / 2017-09-01
==================

* Released openlmis-stockmanagement-ui 1.0.0 as part of openlmis-ref-distro 3.2.0.
 * This was the first stable release of openlmis-stockmanagement-ui.
