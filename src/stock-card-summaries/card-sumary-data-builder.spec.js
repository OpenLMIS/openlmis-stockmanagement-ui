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
        .module('stock-card-summaries')
        .factory('StockCardSummaryDataBuilder', StockCardSummaryDataBuilder);

    StockCardSummaryDataBuilder.$inject = ['StockCardSummary', 'OrderableDataBuilder'];

    function StockCardSummaryDataBuilder(StockCardSummary, OrderableDataBuilder) {

        StockCardSummaryDataBuilder.prototype.build = build;

        return StockCardSummaryDataBuilder;

        function StockCardSummaryDataBuilder() {
            this.orderable = new OrderableDataBuilder().build();
            this.stockOnHand = 10;
            this.lot = null;
        }

        function build() {
            return new StockCardSummary(
                this.orderable,
                this.stockOnHand,
                this.lot
            );
        }

    }

})();
