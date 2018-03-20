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

describe('StockProductsRepositoryImpl', function() {

    var $q, $rootScope, repository, stockCardRepositoryMock, stockCardSummaries, lots, SEARCH_OPTIONS,
        StockCardSummaryDataBuilder, lotRepositoryImplMock, OrderableDataBuilder, LotDataBuilder,
        StockProductsRepositoryImpl, CanFulfillForMeEntryDataBuilder;

    beforeEach(function() {
        stockCardRepositoryMock = jasmine.createSpyObj('stockCardSummaryRepository', ['query']);
        lotRepositoryImplMock = jasmine.createSpyObj('lotRepositoryImplMock', ['query']);
        module('stock-products', function($provide) {
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

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            StockProductsRepositoryImpl = $injector.get('StockProductsRepositoryImpl');
            SEARCH_OPTIONS = $injector.get('SEARCH_OPTIONS');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            LotDataBuilder = $injector.get('LotDataBuilder');
            CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
        });

        repository = new StockProductsRepositoryImpl();
    });

    describe('findAvailableStockProducts', function() {
        beforeEach(function() {
            prepareStockCardSummaries(
                new StockCardSummaryDataBuilder().build(),
                new StockCardSummaryDataBuilder().build()
            );

            lots = [
                new LotDataBuilder().withTradeItemId('trade-item-id-1').build(),
                new LotDataBuilder().withTradeItemId('trade-item-id-2').build()
            ];
            lotRepositoryImplMock.query.andReturn($q.when({
                content: lots
            }));

        });

        it('should query stock card summaries', function() {
            repository.findAvailableStockProducts('program-id', 'facility-id',
                SEARCH_OPTIONS.EXISTING_STOCK_CARDS_ONLY);

            expect(stockCardRepositoryMock.query).toHaveBeenCalledWith({
                programId: 'program-id',
                facilityId: 'facility-id'
            });
        });

        it('should create stock products from canFulfillForMe', function() {
            var stockProducts = findAvailableStockProducts(
                SEARCH_OPTIONS.EXISTING_STOCK_CARDS_ONLY);

            expect(stockProducts.length).toBe(2);
            stockProductEquals(stockProducts[0], stockCardSummaries[0].canFulfillForMe[0]);
            stockProductEquals(stockProducts[1], stockCardSummaries[1].canFulfillForMe[0]);
        });

        it('should not add duplicated items to stock products', function() {
            var stockCardSummary = new StockCardSummaryDataBuilder().build();
            var stockCardSummaryNotDuplicated = new StockCardSummaryDataBuilder()
                .withCanFulfillForMe([
                    new CanFulfillForMeEntryDataBuilder()
                        .withoutLot()
                        .withOrderable(stockCardSummary.canFulfillForMe[0].orderable)
                        .buildJson()
                ]).build();
            var stockCardSummaryDuplicated = new StockCardSummaryDataBuilder()
                .withCanFulfillForMe([
                    new CanFulfillForMeEntryDataBuilder()
                        .withLot(stockCardSummary.canFulfillForMe[0].lot)
                        .withOrderable(stockCardSummary.canFulfillForMe[0].orderable)
                        .buildJson()
                ]).build();

            stockCardSummaries = [
                stockCardSummary,
                stockCardSummaryDuplicated,
                stockCardSummaryNotDuplicated
            ];
            stockCardRepositoryMock.query.andReturn($q.when({
                content: stockCardSummaries
            }));

            var stockProducts = findAvailableStockProducts(
                SEARCH_OPTIONS.EXISTING_STOCK_CARDS_ONLY);

            expect(stockProducts.length).toBe(2);
            stockProductEquals(stockProducts[0], stockCardSummary.canFulfillForMe[0]);
            stockProductEquals(stockProducts[1], stockCardSummaryNotDuplicated.canFulfillForMe[0]);
        });

        it('should create stock products from canFulfillForMe and approved orderables', function() {
            var stockCardSummaryOne = new StockCardSummaryDataBuilder()
                .withOrderable(new OrderableDataBuilder().build())
                .build();
            var stockCardSummaryTwo = new StockCardSummaryDataBuilder()
                .withOrderable(new OrderableDataBuilder()
                    .withIdentifiers({
                        tradeItem: "trade-item-id-1"
                    }).build())
                .withoutCanFulfillForMe()
                .build();
            prepareStockCardSummaries(stockCardSummaryOne, stockCardSummaryTwo);

            var stockProducts = findAvailableStockProducts(
                SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES);

            expect(stockProducts.length).toBe(4);
            stockProductEquals(stockProducts[0], stockCardSummaries[0].canFulfillForMe[0]);
            stockProductEqualsNoLot(stockProducts[1], stockCardSummaryOne);
            stockProductEqualsNoLot(stockProducts[2], stockCardSummaryTwo);
            stockProductEqualsWithLot(stockProducts[3], stockCardSummaryTwo, lots[0]);
        });

        it('should create stock products from approved orderables', function() {
            var stockCardSummaryOne = new StockCardSummaryDataBuilder()
                .withOrderable(new OrderableDataBuilder()
                    .withIdentifiers({
                        tradeItem: "trade-item-id-1"
                    }).build())
                .withoutCanFulfillForMe()
                .build();
            var stockCardSummaryTwo = new StockCardSummaryDataBuilder()
                .withOrderable(new OrderableDataBuilder()
                    .withIdentifiers({
                        tradeItem: "trade-item-id-2"
                    }).build())
                .withoutCanFulfillForMe()
                .build();
            prepareStockCardSummaries(stockCardSummaryOne, stockCardSummaryTwo);

            var stockProducts = findAvailableStockProducts(
                SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES);

            expect(lotRepositoryImplMock.query).toHaveBeenCalledWith({
                tradeItemId: [
                    'trade-item-id-1',
                    'trade-item-id-2'
                ]
            });
            expect(stockProducts.length).toBe(4);
            stockProductEqualsNoLot(stockProducts[0], stockCardSummaryOne);
            stockProductEqualsNoLot(stockProducts[1], stockCardSummaryTwo);
            stockProductEqualsWithLot(stockProducts[2], stockCardSummaryOne, lots[0]);
            stockProductEqualsWithLot(stockProducts[3], stockCardSummaryTwo, lots[1]);
        });

        it('should create stock products from approved orderables without lots', function() {
            var stockCardSummaryOne = new StockCardSummaryDataBuilder()
                .withOrderable(new OrderableDataBuilder().build())
                .withoutCanFulfillForMe()
                .build();
            var stockCardSummaryTwo = new StockCardSummaryDataBuilder()
                .withOrderable(new OrderableDataBuilder().build())
                .withoutCanFulfillForMe()
                .build();
            prepareStockCardSummaries(stockCardSummaryOne, stockCardSummaryTwo);

            var stockProducts = findAvailableStockProducts(
                SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES);

            expect(lotRepositoryImplMock.query).not.toHaveBeenCalled();
            expect(stockProducts.length).toBe(2);
            stockProductEqualsNoLot(stockProducts[0], stockCardSummaryOne);
            stockProductEqualsNoLot(stockProducts[1], stockCardSummaryTwo);
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

        function findAvailableStockProducts(searchOption) {
            var stockProducts;
            repository.findAvailableStockProducts('program-id', 'facility-id', searchOption)
                .then(function(response) {
                    stockProducts = response;
                });
            $rootScope.$apply();
            return stockProducts;
        }

        function stockProductEquals(orderableGroupElement, expected) {
            stockProductEqualsWithLot(orderableGroupElement, expected, expected.lot);
        }

        function stockProductEqualsNoLot(orderableGroupElement, expected) {
            stockProductEqualsWithLot(orderableGroupElement, expected, undefined);
        }

        function stockProductEqualsWithLot(orderableGroupElement, expected, lot) {
            expect(orderableGroupElement.orderable).toEqual(expected.orderable);
            expect(orderableGroupElement.stockOnHand).toEqual(expected.stockOnHand);
            expect(orderableGroupElement.lot).toEqual(lot);
        }

    });

});
