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

describe('StockCardSummary', function() {

    var StockCardSummary, StockCardSummaryDataBuilder,
        json;

    beforeEach(function() {
        module('stock-card-summary');

        inject(function($injector) {
            StockCardSummary = $injector.get('StockCardSummary');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
        });

        json = new StockCardSummaryDataBuilder().buildJson();
    });

    describe('constructor', function() {

        it('should copy properties from JSON', function() {
            var result = new StockCardSummary(json);

            expect(result.orderable).toEqual(json.orderable);
            expect(result.canFulfillForMe).toEqual(json.canFulfillForMe);
            expect(result.stockOnHand).toEqual(json.stockOnHand);
        });
    });
});
