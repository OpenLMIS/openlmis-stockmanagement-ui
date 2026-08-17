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
     * @name stock-scan.scanResolutionService
     *
     * @description
     * Turns a scanned trade item into a line item on a stock screen: finds the product among those
     * the screen loaded, matches the scanned lot, then either tallies an existing line or adds one.
     *
     * The screen keeps ownership of its line items - this service only calls back into the strategy
     * it is given, so the differing row shapes of the receive, issue and physical inventory screens
     * stay out of here.
     */
    angular
        .module('stock-scan')
        .service('scanResolutionService', service);

    service.$inject = ['$q', 'GS1_SCAN_MODE', 'quantityUnitCalculateService'];

    function service($q, GS1_SCAN_MODE, quantityUnitCalculateService) {
        var LOT_CREATION_ALLOWED = {};

        LOT_CREATION_ALLOWED[GS1_SCAN_MODE.ISSUE] = false;
        LOT_CREATION_ALLOWED[GS1_SCAN_MODE.ADJUSTMENT] = false;
        LOT_CREATION_ALLOWED[GS1_SCAN_MODE.RECEIVE] = true;
        LOT_CREATION_ALLOWED[GS1_SCAN_MODE.PHYSICAL_INVENTORY] = true;

        this.resolve = resolve;

        /**
         * @ngdoc method
         * @methodOf stock-scan.scanResolutionService
         * @name resolve
         *
         * @description
         * Resolves a scan against a screen and applies it. Rejects with a message key the scan input
         * can display.
         *
         * The strategy carries the screen's own data and behaviour:
         *
         * - `orderableGroups` the groups the screen loaded, which is what scopes a scan to the
         *   products valid for the current program and facility
         * - `lineItems`       the lines already on the screen
         * - `addLine`         called with the group and the matched lot to add a line; should return
         *                     the line it created, so the scan that added it also counts as one
         * - `tallyLine`       called with a line whose quantity was raised by one
         *
         * @param  {Object}  scan      the parsed scan
         * @param  {Object}  tradeItem the trade item the GTIN resolved to
         * @param  {String}  mode      one of GS1_SCAN_MODE
         * @param  {Object}  strategy  the screen's data and callbacks
         * @return {Promise}           resolves once the line was added or tallied
         */
        function resolve(scan, tradeItem, mode, strategy) {
            var groups = groupsOf(strategy).filter(function(group) {
                    return isForTradeItem(group, tradeItem);
                }),
                group,
                lot;

            if (!groups.length) {
                return $q.reject('stockScan.productNotOnScreen');
            }

            if (groups.length > 1) {
                return $q.reject('stockScan.productAmbiguous');
            }

            group = groups[0];
            lot = findLot(group, scan.lotCode);

            if (!lot) {
                if (!scan.lotCode || !LOT_CREATION_ALLOWED[mode]) {
                    return $q.reject(lotRejection(scan));
                }
                lot = pendingLot(scan);
            }

            return apply(group, lot, strategy);
        }

        function apply(group, lot, strategy) {
            var existing = findLineItem(strategy, group, lot),
                added;

            if (existing) {
                return $q.resolve(raise(existing, strategy));
            }

            added = strategy.addLine(group, lot.$noLot ? undefined : lot);

            /*
             * The scan that adds a line is itself a count of one, so the new line starts at one rather
             * than empty. A strategy that adds nothing, or reports nothing back, is left alone.
             */
            return $q.resolve(added ? raise(added, strategy) : added);
        }

        function raise(lineItem, strategy) {
            tally(lineItem);
            strategy.tallyLine(lineItem);

            return lineItem;
        }

        /**
         * One scan counts as one. The quantity field is canonically in doses, with the packs inputs
         * derived from it, so this raises the dose count and then refreshes those derived fields.
         */
        function tally(lineItem) {
            var netContent = lineItem.orderable ? lineItem.orderable.netContent : undefined;

            lineItem.quantity = (lineItem.quantity || 0) + 1;
            quantityUnitCalculateService.recalculateInputQuantity(lineItem, netContent, true);
        }

        function groupsOf(strategy) {
            return strategy.orderableGroups || [];
        }

        function isForTradeItem(group, tradeItem) {
            return group.some(function(groupItem) {
                var identifiers = groupItem.orderable ? groupItem.orderable.identifiers : undefined;

                return identifiers && identifiers.tradeItem === tradeItem.id;
            });
        }

        /**
         * Lot codes are matched without regard to case, which is how referencedata treats them for
         * uniqueness. A scan carrying no lot code matches the group's no-lot entry, if it has one.
         */
        function findLot(group, lotCode) {
            var matched;

            if (!lotCode) {
                return group.some(isNoLotItem)
                    ? {
                        $noLot: true
                    }
                    : undefined;
            }

            matched = group.filter(function(groupItem) {
                return groupItem.lot
                    && angular.lowercase(groupItem.lot.lotCode) === angular.lowercase(lotCode);
            });

            return matched.length ? matched[0].lot : undefined;
        }

        function isNoLotItem(groupItem) {
            return !groupItem.lot;
        }

        /**
         * A batch the facility has not recorded before. It carries no id, which is what tells the
         * screen and the stock event that it still has to be created; the event does that under the
         * service account, so no administrative right is needed here.
         */
        function pendingLot(scan) {
            return {
                lotCode: scan.lotCode,
                expirationDate: scan.expirationDate
            };
        }

        function findLineItem(strategy, group, lot) {
            var orderableId = orderableIdOf(group);

            return (strategy.lineItems || []).filter(function(lineItem) {
                return lineItem.orderable
                    && lineItem.orderable.id === orderableId
                    && isSameLot(lineItem.lot, lot);
            })[0];
        }

        /**
         * A pending lot has no id yet, so repeat scans of it are matched on code - otherwise every
         * scan of a new batch would add another row instead of counting up.
         */
        function isSameLot(lineItemLot, lot) {
            if (lot.$noLot) {
                return !lineItemLot;
            }

            if (!lineItemLot) {
                return false;
            }

            if (lot.id) {
                return lineItemLot.id === lot.id;
            }

            return !lineItemLot.id
                && angular.lowercase(lineItemLot.lotCode) === angular.lowercase(lot.lotCode);
        }

        function orderableIdOf(group) {
            return group[0].orderable.id;
        }

        function lotRejection(scan) {
            return scan.lotCode ? 'stockScan.lotNotOnScreen' : 'stockScan.lotRequired';
        }
    }

})();
