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

describe('orderableGroupService', function() {

    var $q, $rootScope, service, stockCardRepositoryMock, stockCardSummaries, lots, StockCardSummaryDataBuilder,
        lotRepositoryImplMock, OrderableDataBuilder, LotDataBuilder, CanFulfillForMeEntryDataBuilder;

    var lot1 = {
        id: 'lot id 1'
    };

    var item1 = {
        orderable: {
            id: 'a'
        },
        lot: lot1
    };
    var item2 = {
        orderable: {
            id: 'a'
        }
    };
    var item3 = {
        orderable: {
            id: 'b'
        }
    };

    beforeEach(function() {
        stockCardRepositoryMock = jasmine.createSpyObj('stockCardSummaryRepository', ['query']);
        lotRepositoryImplMock = jasmine.createSpyObj('lotRepositoryImplMock', ['query']);
        module('stock-orderable-group', function($provide) {
            $provide.factory('StockCardSummaryRepository', function() {
                return function() {
                    return stockCardRepositoryMock;
                };
            });
            $provide.factory('LotRepositoryImpl', function() {
                return function() {
                    return lotRepositoryImplMock;
                };
            });
        });
        module('referencedata');
        module('referencedata-orderable');
        module('referencedata-lot');

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            service = $injector.get('orderableGroupService');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            LotDataBuilder = $injector.get('LotDataBuilder');
            this.OrderableChildrenDataBuilder = $injector.get('OrderableChildrenDataBuilder');
            this.OrderableGroupDataBuilder = $injector.get('OrderableGroupDataBuilder');
        });

        this.kitConstituents = [
            new this.OrderableChildrenDataBuilder().withId('child_product_1_id')
                .withQuantity(30)
                .buildJson()
        ];
        this.orderable = new OrderableDataBuilder().withChildren(this.kitConstituents)
            .buildJson();
        this.kitOrderableGroup = new this.OrderableGroupDataBuilder().withOrderable(this.orderable)
            .build();
        this.orderableGroups = [
            new this.OrderableGroupDataBuilder().withOrderable(
                new OrderableDataBuilder().withChildren([])
                    .buildJson()
            )
                .build(),
            new this.OrderableGroupDataBuilder().withOrderable(this.orderable)
                .build()
        ];

    });

    it('should group items by orderable id', function() {
        //given
        var items = [item1, item2, item3];

        //when
        var groups = service.groupByOrderableId(items);

        //then
        expect(groups).toEqual([
            [item1, item2],
            [item3]
        ]);
    });

    it('should find item in group by lot', function() {
        //given
        var items = [item1, item2, item3];

        //when
        var found = service.findByLotInOrderableGroup(items, lot1);

        //then
        expect(found).toBe(item1);
    });

    it('should find item in group by NULL lot', function() {
        //given
        var items = [item1, item2, item3];

        //when
        var found = service.findByLotInOrderableGroup(items, null);

        //then
        expect(found).toBe(item2);
    });

    it('should find lots in orderable group', function() {
        //given
        var group = [item1, item2];

        //when
        var lots = service.lotsOf(group);

        //then
        expect(lots[0]).toEqual({
            lotCode: 'orderableGroupService.noLotDefined'
        });

        expect(lots[1]).toEqual(lot1);
    });

    it('should return kit only orderableGroups', function() {
        var item = service.getKitOnlyOrderablegroup(this.orderableGroups);

        expect(item).toEqual([this.orderableGroups.pop()]);

    });

    describe('findAvailableProductsAndCreateOrderableGroups', function() {
        beforeEach(function() {
            prepareStockCardSummaries(
                new StockCardSummaryDataBuilder().build(),
                new StockCardSummaryDataBuilder().build()
            );

            lots = [
                new LotDataBuilder().withTradeItemId('trade-item-id-1')
                    .build(),
                new LotDataBuilder().withTradeItemId('trade-item-id-2')
                    .build()
            ];
            lotRepositoryImplMock.query.andReturn($q.when({
                content: lots
            }));
        });

        it('should query stock card summaries', function() {
            service.findAvailableProductsAndCreateOrderableGroups('program-id', 'facility-id', false);

            expect(stockCardRepositoryMock.query).toHaveBeenCalledWith({
                programId: 'program-id',
                facilityId: 'facility-id'
            });
        });

        it('should create orderable groups from canFulfillForMe', function() {
            var orderableGroups = findAvailableProductsAndCreateOrderableGroups(false);

            expect(orderableGroups.length).toBe(2);
            orderableGroupElementEquals(orderableGroups[0][0], stockCardSummaries[0].canFulfillForMe[0]);
            orderableGroupElementEquals(orderableGroups[1][0], stockCardSummaries[1].canFulfillForMe[0]);
        });

        it('should create orderable groups from approved products', function() {
            var orderableOne = new OrderableDataBuilder()
                    .withIdentifiers({
                        tradeItem: 'trade-item-id-1'
                    })
                    .build(),
                orderableTwo = new OrderableDataBuilder()
                    .withIdentifiers({
                        tradeItem: 'trade-item-id-2'
                    })
                    .build();

            var stockCardSummaryOne = new StockCardSummaryDataBuilder()
                .withOrderable(orderableOne)
                .withCanFulfillForMe([
                    new CanFulfillForMeEntryDataBuilder()
                        .withoutLot()
                        .withOrderable(orderableOne)
                        .buildJson(),
                    new CanFulfillForMeEntryDataBuilder()
                        .withLot(lots[0])
                        .withOrderable(orderableOne)
                        .buildJson()
                ])
                .build();
            var stockCardSummaryTwo = new StockCardSummaryDataBuilder()
                .withOrderable(orderableTwo)
                .withCanFulfillForMe([
                    new CanFulfillForMeEntryDataBuilder()
                        .withoutLot()
                        .withOrderable(orderableTwo)
                        .buildJson(),
                    new CanFulfillForMeEntryDataBuilder()
                        .withLot(lots[1])
                        .withOrderable(orderableTwo)
                        .buildJson()
                ])
                .build();
            prepareStockCardSummaries(stockCardSummaryOne, stockCardSummaryTwo);

            var orderableGroups = findAvailableProductsAndCreateOrderableGroups(true);

            expect(orderableGroups.length).toBe(2);
            orderableGroupElementEqualsNoLot(orderableGroups[0][0], stockCardSummaryOne);
            orderableGroupElementEqualsNoLot(orderableGroups[1][0], stockCardSummaryTwo);
            orderableGroupElementEqualsWithLot(orderableGroups[0][1], stockCardSummaryOne, lots[0]);
            orderableGroupElementEqualsWithLot(orderableGroups[1][1], stockCardSummaryTwo, lots[1]);
        });

        function prepareStockCardSummaries(stockCardSummaryOne, stockCardSummaryTwo) {
            stockCardSummaries = [
                stockCardSummaryOne,
                stockCardSummaryTwo
            ];
            stockCardRepositoryMock.query.andReturn($q.when({
                content: stockCardSummaries
            }));
        }

        function findAvailableProductsAndCreateOrderableGroups(includeApprovedProducts) {
            var orderableGroups;
            service.findAvailableProductsAndCreateOrderableGroups('program-id', 'facility-id', includeApprovedProducts)
                .then(function(response) {
                    orderableGroups = response;
                });
            $rootScope.$apply();
            return orderableGroups;
        }

        function orderableGroupElementEquals(orderableGroupElement, expected) {
            expect(orderableGroupElement.orderable).toEqual(expected.orderable);
            expect(orderableGroupElement.lot).toEqual(expected.lot);
            expect(orderableGroupElement.stockOnHand).toEqual(expected.stockOnHand);
        }

        function orderableGroupElementEqualsNoLot(orderableGroupElement, expected) {
            expect(orderableGroupElement.orderable).toEqual(expected.orderable);
            expect(orderableGroupElement.stockOnHand).toEqual(expected.stockOnHand);
            expect(orderableGroupElement.lot).toBe(null);
        }

        function orderableGroupElementEqualsWithLot(orderableGroupElement, expected, lot) {
            expect(orderableGroupElement.orderable).toEqual(expected.orderable);
            expect(orderableGroupElement.stockOnHand).toEqual(expected.stockOnHand);
            expect(orderableGroupElement.lot).toEqual(lot);
        }

    });

});