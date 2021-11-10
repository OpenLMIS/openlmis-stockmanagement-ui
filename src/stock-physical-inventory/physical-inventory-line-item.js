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
     * @name stock-physical-inventory.PhysicalInventoryLineItem
     *
     * @description
     * Represents a single Physical Inventory Line Item.
     */
    angular
        .module('stock-physical-inventory')
        .factory('PhysicalInventoryLineItem', PhysicalInventoryLineItem);

    function PhysicalInventoryLineItem() {

        return PhysicalInventoryLineItem;

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.PhysicalInventoryLineItem
         * @name PhysicalInventoryLineItem
         *
         * @description
         * Creates a new instance of the Physical Inventory Line Item class.
         *
         * @param  {Boolean}   isAdded          true if this line item was added; otherwise false
         * @param  {Object}    orderable        the orderable
         * @param  {Object}    lot              the lot
         * @param  {Number}    stockOnHand      the stock on hand
         * @param  {Number}    quantity         the quantity
         * @param  {String}    vvmStatus        the vvm status
         * @param  {Array}    stockAdjustments  the list of stock adjustments
         * @param  {Boolean}   active           the status of stock card
         * @return {PhysicalInventoryLineItem}  the Physical Inventory Line Item object
         */
        function PhysicalInventoryLineItem(isAdded, orderable, lot, stockOnHand, quantity, vvmStatus,
                                           stockAdjustments, active) {
            this.isAdded = isAdded;
            this.orderable = orderable;
            this.lot = lot;
            this.stockOnHand = stockOnHand;
            this.quantity = quantity;
            this.vvmStatus = vvmStatus;
            this.stockAdjustments = stockAdjustments;
            this.active = active;
        }
    }
})();
