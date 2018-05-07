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
     * @name stock-reasons-modal.stockReasonsCalculations
     *
     * @description
     * Provides calculations for stock reasons.
     */
    angular
        .module('stock-reasons-modal')
        .factory('stockReasonsCalculations', stockReasonsCalculations);

    stockReasonsCalculations.$inject = ['REASON_TYPES'];

    function stockReasonsCalculations(REASON_TYPES) {
        var factory = {
            calculateUnaccounted: calculateUnaccounted,
            calculateDifference: calculateDifference,
            calculateTotal: calculateTotal
        };
        return factory;

        /**
         * @ngdoc method
         * @methodOf stock-reasons-modal.stockReasonsCalculations
         * @name calculateUnaccounted
         *
         * @description
         * Calculates the unaccounted values, which is sum of adjustments subtracted from the
         * difference between quantity and stock on hand;
         *
         * @param   {Object}    lineItem    the line item containing quantity and stock on hand
         * @param   {Array}     adjustments the list of adjustments
         * @return  {Number}                the calculated unaccounted value
         */
        function calculateUnaccounted(lineItem, adjustments) {
            return calculateDifference(lineItem) - calculateTotal(adjustments);
        }

        /**
         * @ngdoc method
         * @methodOf stock-reasons-modal.stockReasonsCalculations
         * @name calculateTotal
         *
         * @description
         * Sums up the adjustments given in the list. Throws exception if the list is undefined.
         *
         * @param   {Array}     adjustments the list of adjustments
         * @return  {Number}                the calculated sum of adjustments
         */
        function calculateTotal(adjustments) {
            var total = 0;

            if (!adjustments) {
                throw 'adjustments must be defined';
            }

            angular.forEach(adjustments, function(adjustment) {
                var quantity = getValue(adjustment.quantity);

                if (isAdditive(adjustment.reason.reasonType)) {
                    total += quantity;
                } else {
                    total -= quantity;
                }

            });

            return total;
        }

        /**
         * @ngdoc method
         * @methodOf stock-reasons-modal.stockReasonsCalculations
         * @name calculateDifference
         *
         * @description
         * Calculates the difference between quantity and stock on hand for a given line item.
         *
         * @param   {Object}    lineItem    the line item containing quantity and stock on hand
         * @return  {Number}                the calculated difference
         */
        function calculateDifference(lineItem) {
            return getValue(lineItem.quantity) - getValue(lineItem.stockOnHand);
        }

        function isAdditive(reasonType) {
            if ([REASON_TYPES.CREDIT, REASON_TYPES.DEBIT].indexOf(reasonType) === -1) {
                throw 'invalid reason type';
            }
            return reasonType === REASON_TYPES.CREDIT;
        }

        function getValue(value) {
            return value ? value : 0;
        }
    }

})();
