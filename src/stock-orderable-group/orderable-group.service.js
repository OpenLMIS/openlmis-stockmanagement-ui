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
     * @name stock-orderable-group.orderableGroupService
     *
     * @description
     * Responsible for managing orderable groups.
     */
    angular
        .module('stock-orderable-group')
        .service('orderableGroupService', service);

    service.$inject = ['messageService', 'StockCardSummaryRepositoryImpl',
        'FullStockCardSummaryRepositoryImpl', 'StockCardSummaryRepository', 'SiglusStockCardSummaryResource'];

    function service(messageService, StockCardSummaryRepositoryImpl,
                     FullStockCardSummaryRepositoryImpl, StockCardSummaryRepository, SiglusStockCardSummaryResource) {

        var noLotDefined = {
            lotCode: messageService.get('orderableGroupService.noLotDefined')
        };

        this.findAvailableProductsAndCreateOrderableGroups = findAvailableProductsAndCreateOrderableGroups;
        this.lotsOf = lotsOf;
        this.determineLotMessage = determineLotMessage;
        this.groupByOrderableId = groupByOrderableId;
        this.findByLotInOrderableGroup = findByLotInOrderableGroup;
        this.areOrderablesUseVvm = areOrderablesUseVvm;
        this.getKitOnlyOrderablegroup = getKitOnlyOrderablegroup;
        this.findOneInOrderableGroupWithoutLot = findOneInOrderableGroupWithoutLot;

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
        function lotsOf(orderableGroup) {
            var lots = _.chain(orderableGroup).pluck('lot')
                .compact()
                .value();

            var someHasLot = lots.length > 0;
            var someHasNoLot = _.any(orderableGroup, function(item) {
                return !item.lot;
            });

            if (someHasLot && someHasNoLot) {
                //add no lot defined as an option
                lots.unshift(noLotDefined);
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
        function determineLotMessage(selectedItem, orderableGroup) {
            if (selectedItem.lot && selectedItem.lot.id) {
                selectedItem.displayLotMessage = selectedItem.lot.lotCode;
            } else {
                var messageKey = lotsOf(orderableGroup).length > 0 && !selectedItem.isNewSlot ?
                    'noLotDefined' : 'productHasNoLots';
                selectedItem.displayLotMessage = messageService.get('orderableGroupService.' + messageKey);
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
        function groupByOrderableId(items) {
            return _.chain(items)
                .groupBy(function(item) {
                    return item.orderable.id;
                })
                .values()
                .value();
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name findAvailableProductsAndCreateOrderableGroups
         *
         * @description
         * Finds available Stock Products by facility and program, then groups product items
         * by orderable id.
         */
        function findAvailableProductsAndCreateOrderableGroups(programId, facilityId,
                                                               includeApprovedProducts, userId, rightName) {
            var repository;
            if (includeApprovedProducts) {
                repository = new StockCardSummaryRepository(new FullStockCardSummaryRepositoryImpl(
                    new SiglusStockCardSummaryResource()
                ));
            } else {
                repository = new StockCardSummaryRepository(new StockCardSummaryRepositoryImpl(
                    new SiglusStockCardSummaryResource()
                ));
            }

            return repository.query({
                programId: programId,
                facilityId: facilityId,
                userId: userId,
                rightName: rightName
            }).then(function(summaries) {
                return groupByOrderableId(summaries.content.reduce(function(items, summary) {
                    summary.canFulfillForMe.forEach(function(fulfill) {
                        items.push(fulfill);
                    });
                    return items;
                }, []));
            });
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
        function findByLotInOrderableGroup(orderableGroup, selectedLot) {
            var selectedItem = _.chain(orderableGroup)
                .find(function(groupItem) {
                    var selectedNoLot = !groupItem.lot && (!selectedLot || selectedLot === noLotDefined);
                    var lotMatch = groupItem.lot && _.isEqual(groupItem.lot, selectedLot);
                    // var lotMatch = groupItem.lot && (groupItem.lot.lotCode === selectedLot.lotCode)
                    //     && (groupItem.lot.id === selectedLot.id);
                    return selectedNoLot || lotMatch;
                })
                .value();

            if (selectedItem) {
                determineLotMessage(selectedItem, orderableGroup);
            }
            return selectedItem;
        }
        //find without lot and SOH
        function findOneInOrderableGroupWithoutLot(orderableGroup) {
            var selectedItem = angular.copy(orderableGroup[0]);
            selectedItem.lot = undefined;
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

        function filterOrderablesThatUseVvm(group) {
            var extraData = group[0].orderable.extraData;
            return extraData !== null && extraData !== undefined && extraData.useVVM === 'true';
        }

        /**
         * @ngdoc method
         * @methodOf stock-orderable-group.orderableGroupService
         * @name getKitOnlyOrderablegroup
         *
         * @description
         * Return Kit only orderable groups
         *
         * @param {Array} orderableGroups   orderable groups
         * @return {Array}                Kit orderable groups
         */
        function getKitOnlyOrderablegroup(orderableGroups) {
            return orderableGroups
                .map(removeNonKitOrderables)
                .filter(isGroupNotEmpty);
        }

        function removeNonKitOrderables(stockOrderableGroups) {
            return stockOrderableGroups.filter(function(group) {
                return group.orderable.children.length > 0;
            });
        }

        function isGroupNotEmpty(group) {
            return group.length > 0;
        }

    }

})();
