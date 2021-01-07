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
     * @name stock-products.FullStockCardSummaryRepositoryImpl
     *
     * @description
     * Implementation of the StockCardSummary interface. Communicates with the REST API of the OpenLMIS server.
     * Adds stock-less trade items and lots to the response.
     */
    angular
        .module('stock-products')
        .factory('FullStockCardSummaryRepositoryImpl', FullStockCardSummaryRepositoryImpl);

    FullStockCardSummaryRepositoryImpl.$inject = ['$resource', 'stockmanagementUrlFactory', 'OrderableResource',
        '$q', 'StockCardSummaryResource', 'lotService', 'orderableFulfillsService'];

    function FullStockCardSummaryRepositoryImpl($resource, stockmanagementUrlFactory, OrderableResource, $q,
                                                StockCardSummaryResource, lotService, orderableFulfillsService) {

        FullStockCardSummaryRepositoryImpl.prototype.query = query;

        return FullStockCardSummaryRepositoryImpl;

        /**
         * @ngdoc method
         * @methodOf stock-products.FullStockCardSummaryRepositoryImpl
         * @name FullStockCardSummaryRepositoryImpl
         * @constructor
         *
         * @description
         * Creates an instance of the FullStockCardSummaryRepositoryImpl class.
         */
        function FullStockCardSummaryRepositoryImpl() {
            this.OrderableResource = new OrderableResource();
            this.resource = new StockCardSummaryResource();
        }

        /**
         * @ngdoc method
         * @methodOf stock-products.FullStockCardSummaryRepositoryImpl
         * @name query
         *
         * @description
         * Retrieves a page of stock card summaries from the OpenLMIS server.
         * Communicates with the endpoint of the Stock Cards Summaries V2 REST API.
         * Adds stock-less trade items and lots to the response.
         *
         * @param  {Object}  params request query params
         * @return {Promise}        page of stock card summaries
         */
        function query(params) {
            var OrderableResource = this.OrderableResource;
            var keys = Object.keys(params);
            var docId = params[keys[0]] + '/' + params[keys[1]];

            return this.resource.query(params, docId)
                .then(function(stockCardSummariesPage) {
                    return addMissingStocklessProducts(stockCardSummariesPage, OrderableResource);
                });
        }

        function addMissingStocklessProducts(summaries, OrderableResource) {
            var commodityTypeIds = summaries.content.map(function(summary) {
                return summary.orderable.id;
            });

            var identities = summaries.content.map(function(summary) {
                return summary.orderable;
            });

            return orderableFulfillsService.query({
                id: commodityTypeIds
            })
                .then(function(orderableFulfills) {
                    addGenericOrderables(orderableFulfills, summaries);
                    var tradeItemOrderableIds = reduceToOrderableIds(orderableFulfills);
                    var tradeItemsOrderables;

                    if (tradeItemOrderableIds.length > 0) {
                        tradeItemsOrderables = OrderableResource.query({
                            id: tradeItemOrderableIds
                        });
                    } else {
                        tradeItemsOrderables = $q.resolve([]);
                    }

                    return tradeItemsOrderables.then(function(orderables) {

                        return OrderableResource.getByVersionIdentities(identities)
                            .then(function(orderablePage) {
                                if (orderables.content) {
                                    orderables.content.forEach(function(orderable) {
                                        orderablePage.push(orderable);
                                    });
                                }

                                var tradeItemIds = getTradeItemIdsSet(orderablePage);

                                return lotService.query({
                                    tradeItemId: tradeItemIds
                                })
                                    .then(function(lotPage) {
                                        var lotMap = mapLotsByTradeItems(lotPage.content, orderablePage);
                                        var orderableMap = mapOrderablesById(orderablePage);

                                        summaries.content.forEach(function(summary) {
                                            addOrderableAndLotInfo(summary, orderableMap, lotPage.content);

                                            if (orderableFulfills[summary.orderable.id].canFulfillForMe) {
                                                orderableFulfills[summary.orderable.id].canFulfillForMe
                                                    .forEach(function(orderableId) {
                                                        lotMap[orderableId].forEach(function(lot) {
                                                            if (!hasOrderableWithLot(summary, orderableId, lot.id)) {
                                                                summary.canFulfillForMe.push(createCanFulfillForMeEntry(
                                                                    orderableMap[orderableId], lot
                                                                ));
                                                            }
                                                        });

                                                        if (!hasOrderableWithLot(summary, orderableId, null)) {
                                                            summary.canFulfillForMe.push(
                                                                createCanFulfillForMeEntry(orderableMap[orderableId],
                                                                    null)
                                                            );
                                                        }
                                                    });
                                            }
                                        });

                                        return summaries;
                                    });
                            });
                    });
                });
        }

        function addGenericOrderables(orderableFulfills, summaries) {
            summaries.content.forEach(function(summary) {
                if (!orderableFulfills[summary.orderable.id]) {
                    orderableFulfills[summary.orderable.id] = {
                        canFulfillForMe: []
                    };
                }
            });

            Object.keys(orderableFulfills).forEach(function(commodityTypeId) {
                if (orderableFulfills[commodityTypeId].canFulfillForMe) {
                    orderableFulfills[commodityTypeId].canFulfillForMe.push(commodityTypeId);
                }
            });
        }

        function reduceToOrderableIds(orderableFulfills) {
            return Object.keys(orderableFulfills).reduce(function(ids, commodityTypeId) {
                if (orderableFulfills[commodityTypeId].canFulfillForMe) {
                    orderableFulfills[commodityTypeId].canFulfillForMe.forEach(function(tradeItemId) {
                        if (tradeItemId !== commodityTypeId) {
                            addIfNotExist(ids, tradeItemId);
                        }
                    });
                }
                return ids;
            }, []);
        }

        function addIfNotExist(array, item) {
            if (array.indexOf(item) === -1) {
                array.push(item);
            }
        }

        function mapLotsByTradeItems(lots, orderables) {
            return orderables.reduce(function(map, orderable) {
                map[orderable.id] = [];
                if (orderable.identifiers.tradeItem) {
                    lots.forEach(function(lot) {
                        if (lot.tradeItemId.toLowerCase() === orderable.identifiers.tradeItem.toLowerCase()) {
                            map[orderable.id].push(lot);
                        }
                    });
                }
                return map;
            }, {});
        }

        function mapOrderablesById(orderables) {
            return orderables.reduce(function(map, orderable) {
                map[orderable.id] = orderable;
                return map;
            }, {});
        }

        function createCanFulfillForMeEntry(orderable, lot) {
            return {
                lot: lot,
                occurredDate: null,
                orderable: orderable,
                processedDate: null,
                stockCard: null,
                stockOnHand: null
            };
        }

        function hasOrderableWithLot(summary, orderableId, lotId) {
            return summary.canFulfillForMe
                .filter(function(summaryEntry) {
                    if (!lotId) {
                        return !summaryEntry.lot && summaryEntry.orderable.id === orderableId;
                    }
                    return summaryEntry.lot &&
                        summaryEntry.lot.id === lotId &&
                        summaryEntry.orderable.id === orderableId;

                }).length > 0;
        }

        function addOrderableAndLotInfo(summary, orderableMap, lots) {
            summary.orderable = orderableMap[summary.orderable.id];

            summary.canFulfillForMe.forEach(function(fulfill) {
                fulfill.orderable = orderableMap[fulfill.orderable.id];

                if (fulfill.lot) {
                    fulfill.lot = lots.filter(function(lot) {
                        return lot.id === fulfill.lot.id;
                    })[0];
                }
            });
        }

        function getTradeItemIdsSet(orderables) {
            return orderables.reduce(function(ids, orderable) {
                if (orderable.identifiers.tradeItem) {
                    addIfNotExist(ids, orderable.identifiers.tradeItem);
                }
                return ids;
            }, []);
        }
    }
})();
