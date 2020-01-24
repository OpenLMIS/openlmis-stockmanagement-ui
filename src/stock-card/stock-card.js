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
     * @name stock-card.StockCard
     *
     * @description
     * Represents a single stock card.
     */
    angular
        .module('stock-card')
        .factory('StockCard', StockCard);

    StockCard.$inject = ['Reason', 'dateUtils'];

    function StockCard(Reason, dateUtils) {

        return StockCard;

        /**
         * @ngdoc method
         * @methodOf stock-card.StockCard
         * @name StockCard
         *
         * @description
         * Creates a new instance of the StockCard class.
         *
         * @param  {Object} json    the JSON representation of the StockCard
         * @return {StockCard}      the StockCard object
         */
        function StockCard(json) {
            angular.copy(json, this);
            this.lineItems.forEach(function(lineItem) {
                lineItem.reason = new Reason(lineItem.reason);
                lineItem.occurredDate = dateUtils.toDate(lineItem.occurredDate);
                lineItem.stockAdjustments.forEach(function(stockAdjustment) {
                    stockAdjustment.reason = new Reason(stockAdjustment.reason);
                });
            });
        }

    }

})();
