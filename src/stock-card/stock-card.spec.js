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

describe('StockCard', function(){

    var StockCard, json, Reason, StockCardDataBuilder, StockCardLineItemDataBuilder,
        StockAdjustmentDataBuilder, ReasonDataBuilder;

    beforeEach(function() {
        module('stock-card');
        module('stock-adjustment');

        inject(function($injector) {
            StockCard = $injector.get('StockCard');
            Reason = $injector.get('Reason');
            StockCardDataBuilder = $injector.get('StockCardDataBuilder');
            StockCardLineItemDataBuilder = $injector.get('StockCardLineItemDataBuilder');
            StockAdjustmentDataBuilder = $injector.get('StockAdjustmentDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');

            json = new StockCardDataBuilder()
            .withId('1')
            .withLineItems([
                new StockCardLineItemDataBuilder()
                .withId('a')
                .withStockAdjustments([
                    new StockAdjustmentDataBuilder()
                    .withReason(new ReasonDataBuilder().withId('2').buildJson())
                    .withQuantity(10)
                    .buildJson()
                ])
                .withStockOnHand(35)
                .buildJson(),
                new StockCardLineItemDataBuilder()
                .withId('b')
                .withReason(new ReasonDataBuilder().withId('3').buildJson())
                .withQuantity(30)
                .withStockOnHand(10)
                .buildJson()
            ])
            .buildJson();

        });
    });

    describe('stockCard', function() {

        var stockCard;

        it('should be constructed', function () {
            var stockCard = new StockCard(json);

            expect(stockCard.id).toEqual('1');
            expect(stockCard.lineItems[0].id).toEqual('a');
            expect(stockCard.lineItems[0].stockAdjustments[0].reason instanceof Reason).toBe(true);
            expect(stockCard.lineItems[0].stockAdjustments[0].reason.id).toEqual('2');
            expect(stockCard.lineItems[0].stockAdjustments[0].quantity).toEqual(10);
            expect(stockCard.lineItems[0].stockOnHand).toEqual(35);
            expect(stockCard.lineItems[1].id).toEqual('b');
            expect(stockCard.lineItems[1].reason instanceof Reason).toBe(true);
            expect(stockCard.lineItems[1].reason.id).toEqual('3');
            expect(stockCard.lineItems[1].quantity).toEqual(30);
            expect(stockCard.lineItems[1].stockOnHand).toEqual(10);
        });

    });

});
