/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name stock-scan.stockScanService
     *
     * @description
     * What the stock screens add to the shared resolution mechanism: which workflows may count a batch
     * the facility has no record of, how a stock line item counts a scan, and how a refusal is worded.
     * The mechanism itself lives in openlmis-scan-resolution, so a requisition or a shipment can reuse
     * it with policy and wording of their own.
     */
    angular
        .module('stock-scan')
        .service('stockScanService', service);

    service.$inject = [
        'scanResolutionService', 'SCAN_RESOLUTION_ERROR', 'GS1_SCAN_MODE',
        'quantityUnitCalculateService'
    ];

    function service(scanResolutionService, SCAN_RESOLUTION_ERROR, GS1_SCAN_MODE,
                     quantityUnitCalculateService) {

        var MESSAGES = {},
            NEW_LOT_ALLOWED = {};

        MESSAGES[SCAN_RESOLUTION_ERROR.PRODUCT_NOT_AVAILABLE] = 'stockScan.productNotOnScreen';
        MESSAGES[SCAN_RESOLUTION_ERROR.PRODUCT_AMBIGUOUS] = 'stockScan.productAmbiguous';
        MESSAGES[SCAN_RESOLUTION_ERROR.LOT_NOT_AVAILABLE] = 'stockScan.lotNotOnScreen';
        MESSAGES[SCAN_RESOLUTION_ERROR.LOT_REQUIRED] = 'stockScan.lotRequired';

        // Receiving and counting can meet a batch the facility has no record of; issuing cannot
        NEW_LOT_ALLOWED[GS1_SCAN_MODE.ISSUE] = false;
        NEW_LOT_ALLOWED[GS1_SCAN_MODE.ADJUSTMENT] = false;
        NEW_LOT_ALLOWED[GS1_SCAN_MODE.RECEIVE] = true;
        NEW_LOT_ALLOWED[GS1_SCAN_MODE.PHYSICAL_INVENTORY] = true;

        this.resolve = resolve;

        /**
         * @ngdoc method
         * @methodOf stock-scan.stockScanService
         * @name resolve
         *
         * @description
         * Applies a scan to a stock screen.
         *
         * The screen passes its own rows and behaviour:
         *
         * - `orderableGroups` the groups the screen loaded
         * - `lineItems`       the lines already on the screen
         * - `addLine`         called with the group and the matched lot; returns the line it created
         * - `onCounted`       called with the line whose quantity the scan raised
         * - `focusLine`       optional; called with the line the scan counted
         *
         * @param  {Object}  scan      the parsed scan
         * @param  {Object}  tradeItem the trade item the GTIN resolved to
         * @param  {String}  mode      one of GS1_SCAN_MODE
         * @param  {Object}  screen    the screen's rows and behaviour
         * @return {Promise}           resolves with the line the scan counted
         */
        function resolve(scan, tradeItem, mode, screen) {
            return scanResolutionService.resolve(scan, tradeItem, {
                orderableGroups: screen.orderableGroups,
                lineItems: screen.lineItems,
                tracksLots: true,
                allowsNewLot: NEW_LOT_ALLOWED[mode] === true,
                addLine: screen.addLine,
                countLine: function(lineItem) {
                    countPack(lineItem);
                    screen.onCounted(lineItem);
                },
                focusLine: screen.focusLine,
                messages: MESSAGES
            });
        }

        /**
         * A barcode is on a pack, so one scan counts as one pack. The quantity field is canonically in
         * doses, with the packs inputs derived from it, so this adds a pack's worth of doses and then
         * refreshes those derived fields.
         */
        function countPack(lineItem) {
            var netContent = lineItem.orderable ? lineItem.orderable.netContent : undefined;

            lineItem.quantity = (lineItem.quantity || 0) + packSize(netContent);
            quantityUnitCalculateService.recalculateInputQuantity(lineItem, netContent, true);
        }

        /**
         * Nothing can be counted in packs without a pack size - the screen cannot even derive its packs
         * inputs then - so such a product counts one at a time rather than not at all.
         */
        function packSize(netContent) {
            return netContent > 0 ? netContent : 1;
        }
    }

})();
