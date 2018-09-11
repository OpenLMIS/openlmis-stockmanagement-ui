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
        .module('stock-adjustment')
        .factory('StockAdjustmentDataBuilder', StockAdjustmentDataBuilder);

    StockAdjustmentDataBuilder.$inject = ['ReasonDataBuilder', 'StockCard'];

    function StockAdjustmentDataBuilder(ReasonDataBuilder, StockCard) {

        StockAdjustmentDataBuilder.prototype.buildJson = buildJson;
        StockAdjustmentDataBuilder.prototype.build = build;
        StockAdjustmentDataBuilder.prototype.withReason = withReason;
        StockAdjustmentDataBuilder.prototype.withQuantity = withQuantity;

        return StockAdjustmentDataBuilder;

        function StockAdjustmentDataBuilder() {
            this.reason = new ReasonDataBuilder().buildJson();
            this.quantity = 10;
        }

        function build() {
            return new StockCard(this.buildJson());
        }

        function buildJson() {
            return {
                reason: this.reason,
                quantity: this.quantity
            };
        }

        function withReason(reason) {
            this.reason = reason;
            return this;
        }

        function withQuantity(quantity) {
            this.quantity = quantity;
            return this;
        }

    }

})();
