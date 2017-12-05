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
     * @name stock-event.StockEventLineItem
     *
     * @description
     * Represents a single Stock Event Line Item.
     */
    angular
        .module('stock-event')
        .factory('StockEventLineItem', StockEventLineItem);

    function StockEventLineItem() {

        return StockEventLineItem;

        /**
         * @ngdoc method
         * @methodOf stock-event.StockEventLineItem
         * @name StockEventLineItem
         *
         * @description
         * Creates a new instance of the Stock Event Line Item class.
         *
         * @param  {String}    orderableId         the orderable id
         * @param  {String}    lotId               the lot id
         * @param  {Number}    quantity            the quantity
         * @param  {String}    occurredDate        the occured date
         * @param  {Object}    extraData           the extra data
         * @param  {Array}     stockAdjustments    the stock adjustment list
         * @return {StockEventLineItem}            the Stock Event Line Item object
         */
        function StockEventLineItem(orderableId, lotId, quantity, occurredDate, extraData, stockAdjustments) {
            this.orderableId = orderableId;
            this.lotId = lotId;
            this.quantity = quantity;
            this.occurredDate = occurredDate;
            this.extraData = extraData;
            this.stockAdjustments = stockAdjustments;
        }
    }
})();
