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
        .module('stock-card-summary')
        .factory('CanFulfillForMeEntryDataBuilder', CanFulfillForMeEntryDataBuilder);

    CanFulfillForMeEntryDataBuilder.$inject = ['ObjectReferenceDataBuilder', '$filter'];

    function CanFulfillForMeEntryDataBuilder(ObjectReferenceDataBuilder, $filter) {

        CanFulfillForMeEntryDataBuilder.prototype.buildJson = buildJson;
        CanFulfillForMeEntryDataBuilder.prototype.withOrderable = withOrderable;
        CanFulfillForMeEntryDataBuilder.prototype.withLot = withLot;
        CanFulfillForMeEntryDataBuilder.prototype.withoutLot = withoutLot;
        CanFulfillForMeEntryDataBuilder.prototype.withoutStockCard = withoutStockCard;
        CanFulfillForMeEntryDataBuilder.prototype.withStockOnHand = withStockOnHand;
        CanFulfillForMeEntryDataBuilder.prototype.withStockCard = withStockCard;

        return CanFulfillForMeEntryDataBuilder;

        function CanFulfillForMeEntryDataBuilder() {
            this.orderable = new ObjectReferenceDataBuilder().withResource('api/orderables')
                .build();
            this.lot = new ObjectReferenceDataBuilder().withResource('api/lots')
                .build();
            this.stockCard = new ObjectReferenceDataBuilder().withResource('api/stockCards')
                .build();
            this.occurredDate = $filter('isoDate')(new Date());
            this.processedDate = new Date().toISOString();
            this.stockOnHand = 0;
        }

        function buildJson() {
            return {
                orderable: this.orderable,
                lot: this.lot,
                stockCard: this.stockCard,
                occurredDate: this.occurredDate,
                processedDate: this.processedDate,
                stockOnHand: this.stockOnHand
            };
        }

        function withOrderable(orderable) {
            this.orderable = orderable;
            return this;
        }

        function withLot(lot) {
            this.lot = lot;
            return this;
        }

        function withoutLot() {
            this.lot = null;
            return this;
        }

        function withoutStockCard() {
            this.stockCard = null;
            this.processedDate = null;
            this.occurredDate = null;
            return this.withoutLot();
        }

        function withStockOnHand(stockOnHand) {
            this.stockOnHand = stockOnHand;
            return this;
        }

        function withStockCard(stockCard) {
            this.stockCard = stockCard;
            return this;
        }
    }
})();
