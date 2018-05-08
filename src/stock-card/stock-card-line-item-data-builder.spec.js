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
    .module('stock-card')
    .factory('StockCardLineItemDataBuilder', StockCardLineItemDataBuilder);

    StockCardLineItemDataBuilder.$inject = ['ReasonDataBuilder'];

    function StockCardLineItemDataBuilder(ReasonDataBuilder) {

        StockCardLineItemDataBuilder.prototype.buildJson = buildJson;
        StockCardLineItemDataBuilder.prototype.build = build;
        StockCardLineItemDataBuilder.prototype.withId = withId;
        StockCardLineItemDataBuilder.prototype.withReason = withReason;
        StockCardLineItemDataBuilder.prototype.withStockAdjustments = withStockAdjustments;
        StockCardLineItemDataBuilder.prototype.withStockOnHand = withStockOnHand;
        StockCardLineItemDataBuilder.prototype.withQuantity = withQuantity;

        return StockCardLineItemDataBuilder;

        function StockCardLineItemDataBuilder() {
            StockCardLineItemDataBuilder.instanceNumber =
            (StockCardLineItemDataBuilder.instanceNumber || 0) + 1;

            var instanceNumber = StockCardLineItemDataBuilder.instanceNumber;
            this.id = 'stock-card-line-item-id-' + instanceNumber;
            this.reason = new ReasonDataBuilder().buildResponse();
            this.stockAdjustments = [];
            this.quantity = 10;
            this.stockOnHand = 20;
        }

        function build() {
            return new StockCard(this.buildJson());
        }

        function buildJson() {
            return {
                id: this.id,
                reason: this.reason,
                stockAdjustments: this.stockAdjustments,
                quantity: this.quantity,
                stockOnHand: this.stockOnHand
            };
        }

        function withId(id) {
            this.id = id;
            return this;
        }

        function withReason(reason) {
            this.reason = reason;
            return this;
        }

        function withStockAdjustments(stockAdjustments) {
            this.stockAdjustments = stockAdjustments;
            return this;
        }

        function withQuantity(quantity) {
            this.quantity = quantity;
            return this;
        }

        function withStockOnHand(stockOnHand) {
            this.stockOnHand = stockOnHand;
            return this;
        }

    }

})();
