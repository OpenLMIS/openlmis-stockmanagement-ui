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
     * @name stock-orderable-group.orderableGroupService
     *
     * @description
     * Responsible for managing orderable groups.
     */
    angular
        .module('stock-orderable-group')
        .service('orderableGroupService', service);

    service.$inject = ['messageService', 'LotRepositoryImpl', 'StockCardSummaryRepository',
        'StockCardSummaryRepositoryImpl', 'SEARCH_OPTIONS'];

    function service(messageService, LotRepositoryImpl, StockCardSummaryRepository,
        StockCardSummaryRepositoryImpl, SEARCH_OPTIONS) {
        var noLotDefined = {lotCode: messageService.get('orderableGroupService.noLotDefined')};

        this.findStockCardSummariesAndCreateOrderableGroups = findStockCardSummariesAndCreateOrderableGroups;
        this.lotsOf = lotsOf;
        this.determineLotMessage = determineLotMessage;
        this.groupByOrderableId = groupByOrderableId;
        this.findByLotInOrderableGroup = findByLotInOrderableGroup;
        this.areOrderablesUseVvm = areOrderablesUseVvm;

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name lotsOf
         *
         * @description
         * Extract lots from orderable group. Adds no lot defined as an option when some group
         * has no lot
         *
         * @param {Object} orderableGroup   orderable group
         * @return {Array}                  array with lots
         */
        function lotsOf (orderableGroup) {
            var lots = _.chain(orderableGroup).pluck('lot').compact().value();

            var someHasLot = lots.length > 0;
            var someHasNoLot = _.any(orderableGroup, function (item) {
                return item.lot == null;
            });

            if (someHasLot && someHasNoLot) {
                lots.unshift(noLotDefined);//add no lot defined as an option
            }
            return lots;
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name determineLotMessage
         *
         * @description
         * Determines lot message based on a lot and an orderable group.
         *
         * @param {Object} orderableGroup   orderable group
         * @param {Object} selectedItem     product with lot property. Property displayLotMessage
         *                                  will be assigned to id.
         */
        function determineLotMessage (selectedItem, orderableGroup) {
            if (!selectedItem.lot) {
                var messageKey = lotsOf(orderableGroup).length > 0 ? 'noLotDefined' : 'productHasNoLots';
                selectedItem.displayLotMessage = messageService.get('orderableGroupService.' + messageKey);
            } else {
                selectedItem.displayLotMessage = selectedItem.lot.lotCode;
            }
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name groupByOrderableId
         *
         * @description
         * Groups product items by orderable id.
         *
         * @param {Array} items             product items to be grouped
         * @return {Array}                  items grouped by orderable id.
         */
        function groupByOrderableId (items) {
            return _.chain(items)
                .groupBy(function (item) {
                    return item.orderable.id;
                }).values().value();
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name findStockCardSummariesAndCreateOrderableGroups
         *
         * @description
         * Finds stock card summaries by facility and program, then groups product items
         * by orderable id.
         */
        function findStockCardSummariesAndCreateOrderableGroups(programId, facilityId, searchOption) {
            return new StockCardSummaryRepository(new StockCardSummaryRepositoryImpl())
            .query({
                programId: programId,
                facilityId: facilityId
            })
            .then(function (page) {
                return createOrderableGroupsFromStockCardSummaries(page.content, searchOption);
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name createOrderableGroupsFromStockCardSummaries
         *
         * @description
         * Groups product items by orderable id.
         */
        function createOrderableGroupsFromStockCardSummaries(cards, searchOption) {
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
                            items.push(getItemForApprovedProductWithLot(card, lotPage.content));
                        });
                        return groupByOrderableId(items);
                    });
                } else {
                    return groupByOrderableId(items);
                }
            } else {
                return groupByOrderableId(items);
            }
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
            if (tradeItemId) {
                return lots.filter(function(lot) {
                    return tradeItemId === lot.tradeItemId;
                })[0];
            }
            return null;
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name areOrderablesUseVvm
         *
         * @description
         * Find product in orderable group based on lot.
         *
         * @param {Object} orderableGroup   orderable group
         * @param {Object} selectedLot      selected lot
         * @return {Object}                 found product
         */
        function findByLotInOrderableGroup (orderableGroup, selectedLot) {
            var selectedItem = _.chain(orderableGroup)
                .find(function (groupItem) {
                    var selectedNoLot = !groupItem.lot && (!selectedLot || selectedLot == noLotDefined);
                    var lotMatch = groupItem.lot && groupItem.lot === selectedLot;
                    return selectedNoLot || lotMatch;
                }).value();

            if (selectedItem) {
                determineLotMessage(selectedItem, orderableGroup);
            }
            return selectedItem;
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name areOrderablesUseVvm
         *
         * @description
         * Determines if any orderable in orderable groups use VVM.
         *
         * @param {Array} orderableGroups   filtered groups
         * @return {boolean}                true if any orderable has useVVM property 'true'
         */
        function areOrderablesUseVvm(orderableGroups) {
            var groupsWithVVM = orderableGroups.filter(filterOrderablesThatUseVvm);
            return groupsWithVVM.length > 0;
        }

        function filterOrderablesThatUseVvm (group) {
            var extraData = group[0].orderable.extraData;
            return extraData !== null && extraData !== undefined && extraData.useVVM === 'true';
        }

    }

})();
