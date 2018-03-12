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

(function () {

    'use strict';

    /**
     * @ngdoc service
     * @name stock-products.stockProductsService
     *
     * @description
     * Responsible for managing stock products.
     */
    angular
        .module('stock-products')
        .service('stockProductsService', service);

    service.$inject = ['LotRepositoryImpl', 'StockCardSummaryRepository',
        'StockCardSummaryRepositoryImpl', 'SEARCH_OPTIONS'];

    function service(LotRepositoryImpl, StockCardSummaryRepository,
        StockCardSummaryRepositoryImpl, SEARCH_OPTIONS) {

        this.findAvailableStockProducts = findAvailableStockProducts;

        /**
         * @ngdoc method
         * @methodOf stock-products.stockProductsService
         * @name findAvailableStockProducts
         *
         * @description
         * Finds stock card summaries by facility and program and transform to Stock Products.
         *
         * @param {String}          programId        a program id of stock card.
         * @param {String}          facilityId       a facility id of stock card.
         * @param {Sting}           searchOption     a search option.
         * @returns {Promise} a promise of available stock products.
         */
        function findAvailableStockProducts(programId, facilityId, searchOption) {
            return new StockCardSummaryRepository(new StockCardSummaryRepositoryImpl())
            .query({
                programId: programId,
                facilityId: facilityId
            })
            .then(function (page) {
                return createStockProductsFromStockCardSummaries(page.content, searchOption);
            });
        }

        function createStockProductsFromStockCardSummaries(cards, searchOption) {
            var items = [];
            cards.forEach(function (card) {
                items = items.concat(getItemsFromCanFulfillForMe(card.canFulfillForMe));
                if (searchOption === SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES) {
                    items.push(getItemForApprovedProductWithoutLot(card));
                }
            });

            if (searchOption === SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES) {
                var tradeItemIds = getTradeItemIds(cards);
                if (tradeItemIds.length) {
                    return new LotRepositoryImpl().query({
                        tradeItemId: tradeItemIds
                    }).then(function (lotPage) {
                        cards.forEach(function (card) {
                            if (card.orderable.identifiers.tradeItem) {
                                items.push(getItemForApprovedProductWithLot(card, lotPage.content));
                            }
                        });
                        return items;
                    });
                }
            }
            return items;
        }

        function getItemsFromCanFulfillForMe(canFulfillForMe) {
            var items = [];
            canFulfillForMe.forEach(function (fulfill) {
                var item = angular.copy(fulfill);
                items.push(item);
            });
            return items;
        }

        function getItemForApprovedProductWithoutLot(card) {
            var item = angular.copy(card);
            delete item.canFulfillForMe;
            return item;
        }

        function getItemForApprovedProductWithLot(card, lots) {
            var item = angular.copy(card);
            item.lot = getLotForTradeItem(lots, card.orderable.identifiers.tradeItem);
            return item;
        }

        function getTradeItemIds(cards) {
            var items = [];
            cards.forEach(function (card) {
                if (card.orderable.identifiers.tradeItem) {
                    items.push(card.orderable.identifiers.tradeItem);
                }
            });
            return items;
        }

        function getLotForTradeItem(lots, tradeItemId) {
            return lots.filter(function(lot) {
                return tradeItemId === lot.tradeItemId;
            })[0];
        }
    }

})();
