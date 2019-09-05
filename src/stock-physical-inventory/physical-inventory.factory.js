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
        '$q', 'physicalInventoryService', 'SEARCH_OPTIONS', '$filter', 'StockCardSummaryRepository',
        'FullStockCardSummaryRepositoryImpl', '$http', 'openlmisUrlFactory', 'SiglusStockCardSummaryResource'
    ];

    function factory($q, physicalInventoryService, SEARCH_OPTIONS, $filter, StockCardSummaryRepository,
                     FullStockCardSummaryRepositoryImpl, $http, openlmisUrlFactory, SiglusStockCardSummaryResource) {

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
        function getDrafts(programIds, facility, userId, rightName) {
            var promises = [];
            angular.forEach(programIds, function(program) {
                promises.push(getDraft(program, facility, userId, rightName));
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
        function getDraft(programId, facilityId, userId, rightName) {
            return $q.all([
                getStockAllProducts(programId, facilityId, userId, rightName),
                physicalInventoryService.getDraft(programId, facilityId)
                //Promise.resolve([])
            ]).then(function(responses) {
                var summaries = responses[0],
                    draft = responses[1],
                    draftToReturn = {
                        programId: programId,
                        facilityId: facilityId,
                        lineItems: []
                    };

                // no saved draft
                if (draft.length === 0) {
                    angular.forEach(summaries, function(summary) {
                        draftToReturn.lineItems.push({
                            stockOnHand: summary.stockOnHand,
                            lot: summary.lot,
                            orderable: summary.orderable,
                            quantity: null,
                            vvmStatus: null,
                            stockAdjustments: [],
                            stockCardId: summary.stockCard && summary.stockCard.id,
                            programId: getVirtualProgramId(summary.orderable)
                        });
                    });

                    draftToReturn.isStarter = true;
                // draft was saved
                } else {
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
        function getPhysicalInventory(id, userId, rightName) {
            return physicalInventoryService.getPhysicalInventory(id)
                .then(function(physicalInventory) {
                    return getStockAllProducts(physicalInventory.programId,
                        physicalInventory.facilityId, userId, rightName)
                        .then(function(summaries) {
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
                    lotCode: item.lot ? item.lot.lotCode : null,
                    expirationDate: item.lot ? item.lot.expirationDate : null,
                    quantity: getQuantity(item),
                    extraData: {
                        vvmStatus: item.vvmStatus
                    },
                    stockAdjustments: item.stockAdjustments,
                    stockCardId: item.stockCardId,
                    programId: item.programId
                });
            });

            return physicalInventoryService.saveDraft(physicalInventory);
        }

        function prepareLineItems(physicalInventory, summaries, draftToReturn) {
            /*var quantities = {},
                extraData = {};

            angular.forEach(physicalInventory.lineItems, function(lineItem) {
                quantities[identityOfLines(lineItem)] = lineItem.quantity;
                extraData[identityOfLines(lineItem)] = lineItem.extraData;
            });*/

            var draftLineItems = angular.copy(physicalInventory.lineItems);
            var hasStockCardId = _.any(draftLineItems, function(item) {
                return item.stockCardId;
            });
            angular.forEach(summaries, function(summary) {
                var index = _.findIndex(draftLineItems, function(item) {
                    if (hasStockCardId && summary.stockCard) {
                        return item.stockCardId === summary.stockCard.id;
                    } else if (summary.lot) {
                        return item.lotId === summary.lot.id && item.orderableId === summary.orderable.id;
                    }
                });
                var draft = {};
                if (index > -1) {
                    draft = draftLineItems[index];
                    draftLineItems.splice(index, 1);
                }
                draftToReturn.lineItems.push({
                    stockOnHand: summary.stockOnHand,
                    lot: summary.lot,
                    orderable: summary.orderable,
                    quantity: draft.quantity,
                    vvmStatus: draft.extraData ?  draft.extraData.vvmStatus : null,
                    stockAdjustments: draft.stockAdjustments || [],
                    stockCardId: summary.stockCard && summary.stockCard.id,
                    programId: getVirtualProgramId(summary.orderable)
                });
            });
            angular.forEach(draftLineItems, function(item) {
                var summary = _.find(summaries, function(summary) {
                    if (item.lotId) {
                        return item.lotId === (summary.lot && summary.lot.id) &&
                            item.orderableId === summary.orderable.id;
                    }
                    return summary.orderable.id === item.orderableId;
                });
                var draftLOt = item.lotCode ? {
                    lotCode: item.lotCode,
                    expirationDate: item.expirationDate
                } : null;
                if (item.lotId) {
                    draftLOt = summary.lot;
                }
                draftToReturn.lineItems.push({
                    stockOnHand: undefined,
                    lot: draftLOt,
                    orderable: summary.orderable,
                    quantity: item.quantity,
                    vvmStatus: item.extraData ?  item.extraData.vvmStatus : null,
                    stockAdjustments: item.stockAdjustments || [],
                    stockCardId: undefined,
                    programId: getVirtualProgramId(summary.orderable)
                });
            });
        }

        function getVirtualProgramId(orderable) {
            var program = _.find(orderable.programs, function(program) {
                return !!program.parentId;
            });
            return program && program.parentId;
        }

        /*function identityOfLines(identifiable) {
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
        }*/

        // function getStockProducts(programId, facilityId) {
        //     var repository = new StockCardSummaryRepository(new FullStockCardSummaryRepositoryImpl());
        //
        //     return repository.query({
        //         programId: programId,
        //         facilityId: facilityId
        //     }).then(function(summaries) {
        //         return summaries.content.reduce(function(items, summary) {
        //             summary.canFulfillForMe.forEach(function(fulfill) {
        //                 items.push(fulfill);
        //             });
        //             return items;
        //         }, []);
        //     });
        //
        // }

        function getStockAllProducts(programId, facilityId, userId, rightName) {

            var repository = new StockCardSummaryRepository(new FullStockCardSummaryRepositoryImpl(
                new SiglusStockCardSummaryResource()
            ));

            return repository.query({
                programId: programId,
                facilityId: facilityId,
                userId: userId,
                rightName: rightName
            }).then(function(summaries) {
                return summaries.content.reduce(function(items, summary) {
                    summary.canFulfillForMe.forEach(function(fulfill) {
                        items.push(fulfill);
                    });
                    return items;
                }, []);
            });
        }

        function getQuantity(item) {
            return (_.isNull(item.quantity) || _.isUndefined(item.quantity)) && item.isAdded ? -1 : item.quantity;
        }
    }
})();
