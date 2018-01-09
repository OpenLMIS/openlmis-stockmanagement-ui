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
     * @name stock-event.StockEventAdjustment
     *
     * @description
     * Represents a single Stock Event Adjustment.
     */
    angular
        .module('stock-event')
        .factory('StockEventAdjustment', StockEventAdjustment);

    function StockEventAdjustment() {

        return StockEventAdjustment;

        /**
         * @ngdoc method
         * @methodOf stock-event.StockEventAdjustment
         * @name StockEventAdjustment
         *
         * @description
         * Creates a new instance of the Stock Event Adjustment class.
         *
         * @param  {String}    reasonId    the reason id
         * @param  {Number}    quantity    the quantity
         * @return {StockEventAdjustment}  the Stock Event Adjustment object
         */
        function StockEventAdjustment(reasonId, quantity) {
            this.reasonId = reasonId
            this.quantity = quantity;
        }
    }
})();
