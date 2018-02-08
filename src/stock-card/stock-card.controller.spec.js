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

describe('StockCardController', function(){

    var $rootScope, $state, stockCardService, stockCardId, debitReason, creditReason;

    beforeEach(function() {
        module('stock-card');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $state = $injector.get('$state');
            stockCardService = $injector.get('stockCardService');
            var ReasonDataBuilder = $injector.get('ReasonDataBuilder');

            stockCardId= 123;
            debitReason = new ReasonDataBuilder().buildDebitReason();
            creditReason = new ReasonDataBuilder().buildCreditReason();
            var stockCard = {
                id: stockCardId,
                orderable: {
                    fullProductName: 'Glibenclamide'
                },
                lineItems: [
                    {
                        id: 1,
                        stockAdjustments: [
                            {
                                reason: debitReason,
                                quantity: 10
                            },
                            {
                                reason: debitReason,
                                quantity: 5
                            },
                            {
                                reason: creditReason,
                                quantity: 20
                            }
                        ],
                        stockOnHand: 35
                    },
                    {
                        id: 2,
                        reason: 'Overstock',
                        quantity: 30,
                        stockOnHand: 30,
                        stockAdjustments: []
                    }
                ]
            };

            vm = $injector.get('$controller')('StockCardController', {
                stockCard: stockCard,
                $state: $state,
                stockCardService: stockCardService
            });
        });
    });

    describe('onInit', function() {

        var stockCard;

        beforeEach(function () {
            stockCard = {
                id: 123,
                orderable: {
                    fullProductName: 'Glibenclamide'
                },
                lineItems: [
                    {
                        id: 1,
                        reason: creditReason,
                        quantity: 20,
                        stockOnHand: 35,
                        stockAdjustments: []
                    },
                    {
                        id: 1,
                        reason: debitReason,
                        quantity: 5,
                        stockOnHand: 15,
                        stockAdjustments: []
                    },
                    {
                        id: 1,
                        reason: debitReason,
                        quantity: 10,
                        stockOnHand: 20,
                        stockAdjustments: []
                    },
                    {
                        id: 2,
                        reason: 'Overstock',
                        quantity: 30,
                        stockOnHand: 30,
                        stockAdjustments: []
                    }
                ]
            };
        });


        it('should initiate valid stock card', function () {
            vm.$onInit();

            expect(vm.stockCard).toEqual(stockCard);
        });

        it('should set state label to product name', function () {
            vm.$onInit();

            expect($state.current.label).toBe(stockCard.orderable.fullProductName);
        });
    });

    describe('print', function() {

        it('should call stock card service with card id', function () {
            spyOn(stockCardService, 'print');
            vm.$onInit();
            vm.print();

            expect(stockCardService.print).toHaveBeenCalledWith(stockCardId);
        });
    });

});
