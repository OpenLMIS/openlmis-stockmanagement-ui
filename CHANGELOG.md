1.1.0 / WIP
===========

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
