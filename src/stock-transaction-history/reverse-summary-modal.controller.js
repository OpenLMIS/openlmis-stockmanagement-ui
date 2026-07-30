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
     * @name stock-transaction-history.controller:ReverseSummaryModalController
     *
     * @description
     * Manages the cancellation summary modal.
     */
    angular
        .module('stock-transaction-history')
        .controller('ReverseSummaryModalController', controller);

    controller.$inject = [
        'modalDeferred', 'lineItems', 'showInDoses', 'confirmation',
        'quantityUnitCalculateService'
    ];

    function controller(modalDeferred, lineItems, showInDoses, confirmation,
                        quantityUnitCalculateService) {
        const vm = this;

        vm.$onInit = onInit;
        vm.recalculateQuantity = recalculateQuantity;
        vm.stockOnHandOf = stockOnHandOf;
        vm.confirm = confirm;
        vm.cancel = cancel;

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:ReverseSummaryModalController
         * @name $onInit
         *
         * @description
         * Initialization method of the ReverseSummaryModalController.
         */
        function onInit() {
            vm.lineItems = lineItems;
            // Confirmation mode asks the user to accept the impact before anything is sent; result
            // mode reports what the server persisted and can only be acknowledged.
            vm.confirmation = confirmation;
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:ReverseSummaryModalController
         * @name recalculateQuantity
         *
         * @description
         * Recalculates the given quantity to the unit the reverse view was showing, so the summary
         * reads in the same unit the user was working in.
         *
         * @param  {number} quantity the quantity in doses
         * @param  {Object} lineItem the line item the quantity belongs to
         * @return {String}          the quantity in the selected unit (doses or packs)
         */
        function recalculateQuantity(quantity, lineItem) {
            return quantityUnitCalculateService.recalculateSOHQuantity(
                quantity,
                lineItem.orderable ? lineItem.orderable.netContent : undefined,
                showInDoses
            );
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:ReverseSummaryModalController
         * @name stockOnHandOf
         *
         * @description
         * Returns the balance to show for the line. While confirming that is the card's current
         * balance - the number the new stock on hand is calculated from, so the two read as one
         * sum. When reporting the result it is the balance the server persisted.
         *
         * @param  {Object} lineItem the line item
         * @return {Number}          the stock on hand to display
         */
        function stockOnHandOf(lineItem) {
            return confirmation ? lineItem.$currentStockOnHand : lineItem.stockOnHand;
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:ReverseSummaryModalController
         * @name confirm
         *
         * @description
         * Accepts the summary - submitting the reversal in confirmation mode, or simply closing the
         * result in result mode.
         */
        function confirm() {
            modalDeferred.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.controller:ReverseSummaryModalController
         * @name cancel
         *
         * @description
         * Backs out of the confirmation, leaving the selection untouched so it can be corrected.
         */
        function cancel() {
            modalDeferred.reject();
        }
    }
})();
