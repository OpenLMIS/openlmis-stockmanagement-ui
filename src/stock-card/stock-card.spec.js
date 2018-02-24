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

    var StockCard, json, Reason;

    beforeEach(function() {
        module('stock-card');

        inject(function($injector) {
            StockCard = $injector.get('StockCard');
            Reason = $injector.get('Reason');

            json = {
                id: '1',
                lineItems: [
                    {
                        id: 'a',
                        stockAdjustments: [
                            {
                                reason: { id: '2' },
                                quantity: 10
                            },
                        ],
                        stockOnHand: 35
                    },
                    {
                        id: 'b',
                        reason: { id: '3' },
                        stockAdjustments: [],
                        quantity: 30,
                        stockOnHand: 10
                    }
                ]
            };

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
