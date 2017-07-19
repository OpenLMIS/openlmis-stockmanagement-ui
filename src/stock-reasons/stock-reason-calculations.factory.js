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

    angular
        .module('stock-reasons')
        .factory('stockReasonsCalculations', stockReasonsCalculations);

    function stockReasonsCalculations() {
        var factory = {
            calculateUnaccounted: calculateUnaccounted,
            calculateDifference: calculateDifference,
            calculateTotal: calculateTotal
        };
        return factory;

        function calculateUnaccounted(lineItem, adjustments) {
            return calculateDifference(lineItem) - calculateTotal(adjustments);
        }

        function calculateTotal(adjustments) {
            var total = 0;

            angular.forEach(adjustments, function(adjustment) {
                var quantity = adjustment.quantity ? adjustment.quantity : 0;

                if (isAdditive(adjustment.reason.reasonType)) {
                    total += quantity;
                } else {
                    total -= quantity;
                }

            });

            return total;
        }

        function calculateDifference(lineItem) {
            return (lineItem.quantity ? lineItem.quantity : 0) - lineItem.stockOnHand;
        }

        function isAdditive(reasonType) {
            return reasonType === 'CREDIT';
        }
    }

})();
