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
        '$q', 'stockCardSummariesService', 'physicalInventoryService', 'SEARCH_OPTIONS', '$filter'
    ];

    function factory($q, stockCardSummariesService, physicalInventoryService, SEARCH_OPTIONS,
                     $filter) {

        return {
            getDrafts: getDrafts,
            getDraft: getDraft
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
         * @param  {String}  program  Program UUID
         * @param  {String}  facility Facility UUID
         * @return {Promise}          Physical inventory promise
         */
        function getDraft(program, facility) {
            var deferred = $q.defer();

            $q.all([
                stockCardSummariesService.getStockCardSummaries(program, facility, SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES),
                physicalInventoryService.getDraft(program, facility)
            ]).then(function(responses) {
                var summaries = responses[0],
                    draft = responses[1],
                    draftToReturn = {
                        programId: program,
                        facilityId: facility,
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
                    var quantities = {},
                        extraData = {};

                    angular.forEach(draft[0].lineItems, function(lineItem) {
                        quantities[identityOfLines(lineItem)] = lineItem.quantity;
                        extraData[identityOfLines(lineItem)] = lineItem.extraData;
                    });

                    angular.forEach(summaries, function(summary) {
                        draftToReturn.lineItems.push({
                            stockOnHand: summary.stockOnHand,
                            lot: summary.lot,
                            orderable: summary.orderable,
                            quantity: quantities[identityOf(summary)],
                            vvmStatus: extraData[identityOf(summary)] ? extraData[identityOf(summary)].vvmStatus : null,
                            stockAdjustments: getStockAdjustments(draft[0].lineItems, summary)
                        });
                    });
                    draftToReturn.id = draft[0].id;

                    draftToReturn.isStarter = false;
                }

                deferred.resolve(draftToReturn);
            }, deferred.reject);

            return deferred.promise;
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
