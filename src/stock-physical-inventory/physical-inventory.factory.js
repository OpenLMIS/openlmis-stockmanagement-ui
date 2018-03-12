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
     * @name stock-physical-inventory.physicalInventoryFactory
     *
     * @description
     * Allows the user to retrieve physical inventory enhanced informations.
     */
    angular
        .module('stock-physical-inventory')
        .factory('physicalInventoryFactory', factory);

    factory.$inject = [
        '$q', 'physicalInventoryService', 'SEARCH_OPTIONS', '$filter', 'StockProductsRepository'
    ];

    function factory($q, physicalInventoryService, SEARCH_OPTIONS, $filter, StockProductsRepository) {

        return {
            getDrafts: getDrafts,
            getDraft: getDraft,
            getPhysicalInventory: getPhysicalInventory,
            saveDraft: saveDraft
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryFactory
         * @name getDrafts
         *
         * @description
         * Retrieves physical inventory drafts by facility and program.
         *
         * @param  {Array}   programIds An array of program UUID
         * @param  {String}  facility   Facility UUID
         * @return {Promise}            Physical inventories promise
         */
        function getDrafts(programIds, facility) {
            var promises = [];
            angular.forEach(programIds, function(program) {
                promises.push(getDraft(program, facility));
            });

            return $q.all(promises);
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryFactory
         * @name getDraft
         *
         * @description
         * Retrieves physical inventory draft by facility and program.
         *
         * @param  {String}  programId  Program UUID
         * @param  {String}  facilityId Facility UUID
         * @return {Promise}          Physical inventory promise
         */
        function getDraft(programId, facilityId) {
            return $q.all([
                new StockProductsRepository().findAvailableStockProducts(programId, facilityId,
                    SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES),
                physicalInventoryService.getDraft(programId, facilityId)
            ]).then(function(responses) {
                var summaries = responses[0],
                    draft = responses[1],
                    draftToReturn = {
                        programId: programId,
                        facilityId: facilityId,
                        lineItems: []
                    };

                if (draft.length === 0) { // no saved draft
                    angular.forEach(summaries, function(summary) {
                        draftToReturn.lineItems.push({
                            stockOnHand: summary.stockOnHand,
                            lot: summary.lot,
                            orderable: summary.orderable,
                            quantity: null,
                            vvmStatus: null,
                            stockAdjustments: []
                        });
                    });

                    draftToReturn.isStarter = true;
                } else { // draft was saved
                    prepareLineItems(draft[0], summaries, draftToReturn);
                    draftToReturn.id = draft[0].id;
                }

                return draftToReturn;
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryFactory
         * @name getPhysicalInventory
         *
         * @description
         * Retrieves physical inventory by id.
         *
         * @param  {String}  id       Draft UUID
         * @return {Promise}          Physical inventory promise
         */
        function getPhysicalInventory(id) {
            return physicalInventoryService.getPhysicalInventory(id)
            .then(function (physicalInventory) {
                return new StockProductsRepository().findAvailableStockProducts(
                    physicalInventory.programId, physicalInventory.facilityId,
                    SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES)
                    .then(function (summaries) {
                        var draftToReturn = {
                            programId: physicalInventory.programId,
                            facilityId: physicalInventory.facilityId,
                            lineItems: []
                        };
                        prepareLineItems(physicalInventory, summaries, draftToReturn);
                        draftToReturn.id = physicalInventory.id;

                        return draftToReturn;
                    });
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryFactory
         * @name saveDraft
         *
         * @description
         * Performs logic on physical inventory draft and calls save method from draft service.
         *
         * @param  {draft}   draft Physical Inventory Draft to be saved
         * @return {Promise}       Saved draft
         */
        function saveDraft(draft) {
            var physicalInventory = angular.copy(draft);

            physicalInventory.lineItems = [];
            angular.forEach(draft.lineItems, function(item) {
                physicalInventory.lineItems.push({
                    orderableId: item.orderable.id,
                    lotId: item.lot ? item.lot.id : null,
                    quantity: (_.isNull(item.quantity) || _.isUndefined(item.quantity)) && item.isAdded ? -1 : item.quantity,
                    extraData: {
                        vvmStatus: item.vvmStatus
                    },
                    stockAdjustments: item.stockAdjustments
                });
            });

            return physicalInventoryService.saveDraft(physicalInventory);
        }

        function prepareLineItems(physicalInventory, summaries, draftToReturn) {
            var quantities = {},
                extraData = {};

            angular.forEach(physicalInventory.lineItems, function (lineItem) {
                quantities[identityOfLines(lineItem)] = lineItem.quantity;
                extraData[identityOfLines(lineItem)] = lineItem.extraData;
            });

            angular.forEach(summaries, function (summary) {
                draftToReturn.lineItems.push({
                    stockOnHand: summary.stockOnHand,
                    lot: summary.lot,
                    orderable: summary.orderable,
                    quantity: quantities[identityOf(summary)],
                    vvmStatus: extraData[identityOf(summary)] ? extraData[identityOf(summary)].vvmStatus : null,
                    stockAdjustments: getStockAdjustments(physicalInventory.lineItems, summary)
                });
            });
        }

        function identityOfLines(identifiable) {
            return identifiable.orderableId + (identifiable.lotId ? identifiable.lotId : '');
        }

        function identityOf(identifiable) {
            return identifiable.orderable.id + (identifiable.lot ? identifiable.lot.id : '');
        }

        function getStockAdjustments(lineItems, summary) {
            var filtered;

            if (summary.lot) {
                filtered = $filter('filter')(lineItems, {
                    orderableId: summary.orderable.id,
                    lotId: summary.lot.id
                });
            } else {
                filtered = $filter('filter')(lineItems, function(lineItem) {
                    return lineItem.orderableId === summary.orderable.id && !lineItem.lotId;
                });
            }

            if (filtered.length === 1) {
                return filtered[0].stockAdjustments;
            }

            return [];
        }
    }
})();
