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

describe('StockCardController', function() {

    var vm, $state, stockCardService, stockCardId, debitReason, creditReason, ReasonDataBuilder, messageService;

    beforeEach(function() {
        module('stock-card');

        inject(function($injector) {
            $state = $injector.get('$state');
            stockCardService = $injector.get('stockCardService');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            messageService = $injector.get('messageService');

            stockCardId = 123;
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

        beforeEach(function() {
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

        // it('should initiate valid stock card', function() {
        //     vm.$onInit();
        //
        //     expect(vm.stockCard).toEqual(stockCard);
        // });

        it('should set state label to product name', function() {
            vm.$onInit();

            expect($state.current.label).toBe(stockCard.orderable.fullProductName);
        });
    });

    describe('print', function() {

        it('should call stock card service with card id', function() {
            spyOn(stockCardService, 'print');
            vm.$onInit();
            vm.print();

            expect(stockCardService.print).toHaveBeenCalledWith(stockCardId);
        });
    });

    describe('getReason', function() {

        beforeEach(function() {
            spyOn(messageService, 'get').andReturn('test message');
        });

        it('should get reason and free text', function() {
            var lineItem = {
                reasonFreeText: true,
                reason: new ReasonDataBuilder().buildAdjustmentReason()
            };

            expect(vm.getReason(lineItem)).toEqual('test message');
            expect(messageService.get).toHaveBeenCalledWith('stockCard.reasonAndFreeText', {
                name: lineItem.reason.name,
                freeText: lineItem.reasonFreeText
            });
        });

        it('should get message for physical reason', function() {
            var lineItem = {
                reasonFreeText: false,
                reason: new ReasonDataBuilder().buildPhysicalInventoryReason()
            };

            expect(vm.getReason(lineItem)).toEqual('test message');
            expect(messageService.get).toHaveBeenCalledWith('stockCard.physicalInventory');
        });

        it('should get reason name', function() {
            var lineItem = {
                reasonFreeText: false,
                reason: new ReasonDataBuilder().buildTransferReason()
            };

            expect(vm.getReason(lineItem)).toEqual(lineItem.reason.name);
        });
    });

});
