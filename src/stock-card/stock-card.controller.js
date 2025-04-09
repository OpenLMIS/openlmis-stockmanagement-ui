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
     * @ngdoc controller
     * @name stock-card.controller:StockCardController
     *
     * @description
     * Controller in charge of displaying one single stock card.
     */
    angular
        .module('stock-card')
        .controller('StockCardController', controller);

    controller.$inject = ['stockCard', '$state', 'stockCardService', 'REASON_TYPES', 'messageService',
        'QUANTITY_UNIT', 'stockmanagementCalculateService'];

    function controller(stockCard, $state, stockCardService, REASON_TYPES, messageService, QUANTITY_UNIT,
                        stockmanagementCalculateService) {

        var vm = this;

        vm.$onInit = onInit;
        vm.getReason = getReason;
        vm.stockCard = [];
        vm.displayedLineItems = [];
        vm.showInDoses = showInDoses;
        vm.recalculateQuantity = recalculateQuantity;

        /**
         * @ngdoc property
         * @propertyOf stock-card.controller:StockCardController
         * @name quantityUnit
         * @type {Object}
         *
         * @description
         * Holds quantity unit.
         */
        vm.quantityUnit = undefined;

        /**
         * @ngdoc method
         * @methodOf stock-card.controller:StockCardController
         * @name showInDoses
         *
         * @description
         * Returns whether the screen is showing quantities in doses.
         *
         * @return {boolean} true if the quantities are in doses, false otherwise
         */
        function showInDoses() {
            return vm.quantityUnit === QUANTITY_UNIT.DOSES;
        }

        /**
         * @ngdoc method
         * @methodOf stock-card.controller:StockCardController
         * @name print
         *
         * @description
         * Print specific stock card.
         *
         */
        vm.print = function() {
            stockCardService.print(vm.stockCard.id);
        };

        function onInit() {
            $state.current.label = stockCard.orderable.fullProductName;

            var items = [];
            var previousSoh;
            angular.forEach(stockCard.lineItems, function(lineItem) {
                if (lineItem.stockAdjustments.length > 0) {
                    angular.forEach(lineItem.stockAdjustments.slice().reverse(), function(adjustment, i) {
                        var lineValue = angular.copy(lineItem);
                        if (i !== 0) {
                            lineValue.stockOnHand = previousSoh;
                        }
                        lineValue.reason = adjustment.reason;
                        lineValue.quantity = adjustment.quantity;
                        lineValue.stockAdjustments = [];
                        items.push(lineValue);
                        previousSoh = lineValue.stockOnHand - getSignedQuantity(adjustment);
                    });
                } else {
                    items.push(lineItem);
                }
            });

            vm.stockCard = stockCard;
            vm.stockCard.lineItems = items;
        }

        function getSignedQuantity(adjustment) {
            if (adjustment.reason.reasonType === REASON_TYPES.DEBIT) {
                return -adjustment.quantity;
            }
            return adjustment.quantity;

        }

        /**
         * @ngdoc method
         * @methodOf stock-card.controller:StockCardController
         * @name getReason
         *
         * @description
         * Get Reason column value.
         *
         * @param {object} lineItem to get reason from
         * @return {object} message for reason
         */
        function getReason(lineItem) {
            if (lineItem.reasonFreeText) {
                return messageService.get('stockCard.reasonAndFreeText', {
                    name: lineItem.reason.name,
                    freeText: lineItem.reasonFreeText
                });
            }
            return lineItem.reason.isPhysicalReason()
                ? messageService.get('stockCard.physicalInventory')
                : lineItem.reason.name;
        }

        /**
         * @ngdoc method
         * @methodOf stock-card.controller:StockCardController
         * @name recalculateQuantity
         *
         * @description
         * Recalculates the given quantity to packs or doses
         *
         * @param  {number}  quantity  the quantity in doses to be recalculated
         * 
         * @return {String}            the given quantity in Doses or Packs
         */
        function recalculateQuantity(quantity) {
            return stockmanagementCalculateService
                .recalculateSOHQuantity(quantity, vm.stockCard.orderable.netContent, vm.showInDoses());
        }

    }
})();
