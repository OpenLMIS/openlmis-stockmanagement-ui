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
        .module('stock-physical-inventory')
        .factory('PhysicalInventoryLineItemDataBuilder', PhysicalInventoryLineItemDataBuilder);

    PhysicalInventoryLineItemDataBuilder.$inject = ['PhysicalInventoryLineItem'];

    function PhysicalInventoryLineItemDataBuilder(PhysicalInventoryLineItem) {

        PhysicalInventoryLineItemDataBuilder.prototype.build = build;
        PhysicalInventoryLineItemDataBuilder.prototype.buildAsAdded = buildAsAdded;
        PhysicalInventoryLineItemDataBuilder.prototype.withOrderable = withOrderable;
        PhysicalInventoryLineItemDataBuilder.prototype.withLot = withLot;
        PhysicalInventoryLineItemDataBuilder.prototype.withStockOnHand = withStockOnHand;
        PhysicalInventoryLineItemDataBuilder.prototype.withQuantity = withQuantity;
        PhysicalInventoryLineItemDataBuilder.prototype.withStockAdjustments = withStockAdjustments;

        return PhysicalInventoryLineItemDataBuilder;

        function PhysicalInventoryLineItemDataBuilder() {
            this.orderable = null;
            this.lot = null;
            this.stockOnHand = 233;
            this.quantity = 3;
            this.vvmStatus = null;
            this.stockAdjustments = [];
        }

        function build() {
            return new PhysicalInventoryLineItem(
                false,
                this.orderable,
                this.lot,
                this.stockOnHand,
                this.quantity,
                this.vvmStatus,
                this.stockAdjustments
            );
        }

        function buildAsAdded() {
            return new PhysicalInventoryLineItem(
                true,
                this.orderable,
                this.lot,
                this.stockOnHand,
                this.quantity,
                this.vvmStatus,
                this.stockAdjustments
            );
        }

        function withOrderable(orderable) {
            this.orderable = orderable;
            return this;
        }

        function withLot(lot) {
            this.lot = lot;
            return this;
        }

        function withStockOnHand(stockOnHand) {
            this.stockOnHand = stockOnHand;
            return this;
        }

        function withQuantity(quantity) {
            this.quantity = quantity;
            return this;
        }

        function withStockAdjustments(stockAdjustments) {
            this.stockAdjustments = stockAdjustments;
            return this;
        }
    }
})();
