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

(function () {

    'use strict';

    angular
        .module('stock-card-summary')
        .factory('StockCardSummaryDataBuilder', StockCardSummaryDataBuilder);

    StockCardSummaryDataBuilder.$inject = ['ObjectReferenceDataBuilder', 'CanFulfillForMeEntryDataBuilder', 'StockCardSummary'];

    function StockCardSummaryDataBuilder(ObjectReferenceDataBuilder, CanFulfillForMeEntryDataBuilder, StockCardSummary) {

        StockCardSummaryDataBuilder.prototype.build = build;
        StockCardSummaryDataBuilder.prototype.buildJson = buildJson;
        StockCardSummaryDataBuilder.prototype.withCanFulfillForMeEntry = withCanFulfillForMeEntry;
        StockCardSummaryDataBuilder.prototype.withOrderable = withOrderable;
        StockCardSummaryDataBuilder.prototype.withoutCanFulfillForMe = withoutCanFulfillForMe;
        StockCardSummaryDataBuilder.prototype.withCanFulfillForMe = withCanFulfillForMe;

        return StockCardSummaryDataBuilder;

        function StockCardSummaryDataBuilder() {
            this.orderable = new ObjectReferenceDataBuilder().withResource("api/orderables").build();
            this.canFulfillForMe = [new CanFulfillForMeEntryDataBuilder().withOrderable(this.orderable).buildJson()];
            this.stockOnHand = 0;
        }

        function build() {
            return new StockCardSummary(this.buildJson());
        }

        function buildJson() {
            return {
                orderable: this.orderable,
                canFulfillForMe: this.canFulfillForMe,
                stockOnHand: this.stockOnHand
            };
        }

        function withCanFulfillForMeEntry(canFulfillForMeEntry) {
            this.canFulfillForMe.push(canFulfillForMeEntry);
            return this;
        }

        function withOrderable(orderable) {
            this.orderable = orderable;
            return this;
        }

        function withCanFulfillForMe(canFulfillForMe) {
            this.canFulfillForMe = canFulfillForMe;
            return this;
        }

        function withoutCanFulfillForMe() {
            this.canFulfillForMe = [];
            return this;
        }
    }
})();
