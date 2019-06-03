2.0.3 / 2019-05-27
==================

Improvements:
* [OLMIS-6113](https://openlmis.atlassian.net/browse/OLMIS-6113): Create UI for kit unpacking in stock management

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
