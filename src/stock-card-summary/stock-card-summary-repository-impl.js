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
     * @name stock-card-summary.StockCardSummaryRepositoryImpl
     *
     * @description
     * Implementation of the StockCardSummary interface. Communicates with the REST API of the OpenLMIS server.
     */
    angular
        .module('stock-card-summary')
        .factory('StockCardSummaryRepositoryImpl', StockCardSummaryRepositoryImpl);

    StockCardSummaryRepositoryImpl.$inject = [
        '$resource', 'stockmanagementUrlFactory', 'LotResource', 'OrderableResource', '$q', '$window',
        'accessTokenFactory', 'StockCardSummaryResource'
    ];

    function StockCardSummaryRepositoryImpl($resource, stockmanagementUrlFactory, LotResource, OrderableResource,
                                            $q, $window, accessTokenFactory, StockCardSummaryResource) {

        StockCardSummaryRepositoryImpl.prototype.query = query;
        StockCardSummaryRepositoryImpl.prototype.print = print;

        return StockCardSummaryRepositoryImpl;

        /**
         * @ngdoc method
         * @methodOf stock-card-summary.StockCardSummaryRepositoryImpl
         * @name StockCardSummaryRepositoryImpl
         * @constructor
         *
         * @description
         * Creates an instance of the StockCardSummaryRepositoryImpl class.
         */
        function StockCardSummaryRepositoryImpl() {
            this.LotResource = new LotResource();
            this.orderableResource = new OrderableResource();

            this.resource = new StockCardSummaryResource();
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary.StockCardSummaryRepositoryImpl
         * @name print
         *
         * @description
         * Opens window with Stock Card Summaries.
         *
         * @param {string} program  the program UUID the stock cards will be retrieved
         * @param {string} facility the facility UUID the stock cards will be retrieved
         */
        function print(program, facility) {
            var sohPrintUrl = '/api/stockCardSummaries/print',
                params = 'program=' + program + '&' + 'facility=' + facility;
            $window.open(accessTokenFactory.addAccessToken(
                stockmanagementUrlFactory(sohPrintUrl + '?' + params)
            ), '_blank');
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary.StockCardSummaryRepositoryImpl
         * @name query
         *
         * @description
         * Retrieves a page of stock card summaries from the OpenLMIS server.
         * Communicates with the endpoint of the Stock Cards Summaries V2 REST API.
         *
         * @param  {Object}  params request query params
         * @return {Promise}        page of stock card summaries
         */
        function query(params) {
            var LotResource = this.LotResource,
                orderableResource = this.orderableResource;

            return this.resource.query(params)
                .then(function(stockCardSummariesPage) {
                    var lotIds = getLotIds(stockCardSummariesPage.content),
                        orderableIds = getOrderableIds(stockCardSummariesPage.content);

                    return $q.all([
                        orderableResource.query({
                            id: orderableIds
                        }),
                        LotResource.query({
                            id: lotIds
                        })
                    ])
                        .then(function(responses) {
                            var orderablePage = responses[0],
                                lotPage = responses[1];

                            return combineResponses(stockCardSummariesPage, orderablePage.content, lotPage.content);
                        });
                });
        }

        function combineResponses(stockCardSummariesPage, orderables, lots) {
            stockCardSummariesPage.content.forEach(function(summary) {
                summary.orderable = getObjectForReference(orderables, summary.orderable);

                summary.canFulfillForMe.forEach(function(fulfill) {
                    fulfill.orderable = getObjectForReference(orderables, fulfill.orderable);
                    fulfill.lot = getObjectForReference(lots, fulfill.lot);
                });
            });

            return stockCardSummariesPage;
        }

        function getLotIds(stockCardSummaries) {
            var ids = [];

            stockCardSummaries.forEach(function(summary) {
                summary.canFulfillForMe.forEach(function(fulfill) {
                    if (fulfill.lot) {
                        ids.push(fulfill.lot.id);
                    }
                });
            });

            return ids;
        }

        function getOrderableIds(stockCardSummaries) {
            var ids = [];

            stockCardSummaries.forEach(function(summary) {
                ids.push(summary.orderable.id);
                summary.canFulfillForMe.forEach(function(fulfill) {
                    if (fulfill.orderable) {
                        ids.push(fulfill.orderable.id);
                    }
                });
            });

            return ids;
        }

        function getObjectForReference(objectList, reference) {
            if (reference) {
                return objectList.filter(function(object) {
                    return reference.id === object.id;
                })[0];
            }
            return null;
        }
    }
})();
