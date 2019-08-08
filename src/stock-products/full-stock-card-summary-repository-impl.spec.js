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

describe('FullStockCardSummaryRepositoryImpl', function() {

    var fullStockCardSummaryRepositoryImpl, FullStockCardSummaryRepositoryImpl, lotResourceMock, $q, $rootScope,
        orderableResourceMock, orderableFulfillsResourceMock, stockCardSummaryResourceMock, PageDataBuilder,
        StockCardSummaryDataBuilder, CanFulfillForMeEntryDataBuilder, OrderableDataBuilder, LotDataBuilder,
        ObjectReferenceDataBuilder;

    beforeEach(function() {
        module('stock-card-summary');
        module('openlmis-pagination');
        module('stock-products', function($provide) {
            lotResourceMock = jasmine.createSpyObj('LotResource', ['query']);
            $provide.factory('LotResource', function() {
                return function() {
                    return lotResourceMock;
                };
            });

            orderableResourceMock = jasmine.createSpyObj('orderableResource', ['query']);
            $provide.factory('OrderableResource', function() {
                return function() {
                    return orderableResourceMock;
                };
            });

            orderableFulfillsResourceMock = jasmine.createSpyObj('orderableFulfillsResource', ['query']);
            $provide.factory('OrderableFulfillsResource', function() {
                return function() {
                    return orderableFulfillsResourceMock;
                };
            });

            stockCardSummaryResourceMock = jasmine.createSpyObj('stockCardSummaryResource', ['query']);
            $provide.factory('StockCardSummaryResource', function() {
                return function() {
                    return stockCardSummaryResourceMock;
                };
            });
        });

        inject(function($injector) {
            FullStockCardSummaryRepositoryImpl = $injector.get('FullStockCardSummaryRepositoryImpl');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            PageDataBuilder = $injector.get('PageDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            LotDataBuilder = $injector.get('LotDataBuilder');
            ObjectReferenceDataBuilder = $injector.get('ObjectReferenceDataBuilder');
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
        });

        stockCardSummaryResourceMock.query.andReturn($q.resolve(
            new PageDataBuilder()
                .withContent([
                    new StockCardSummaryDataBuilder()
                        .withOrderable(new ObjectReferenceDataBuilder().withId('id-one')
                            .build())
                        .withCanFulfillForMe([
                            new CanFulfillForMeEntryDataBuilder()
                                .withOrderable(new ObjectReferenceDataBuilder().withId('id-two')
                                    .build())
                                .withLot(new ObjectReferenceDataBuilder().withId('lot-1')
                                    .build())
                                .buildJson(),
                            new CanFulfillForMeEntryDataBuilder()
                                .withOrderable(new ObjectReferenceDataBuilder().withId('id-two')
                                    .build())
                                .withLot(new ObjectReferenceDataBuilder().withId('lot-2')
                                    .build())
                                .buildJson(),
                            new CanFulfillForMeEntryDataBuilder()
                                .withOrderable(new ObjectReferenceDataBuilder().withId('id-three')
                                    .build())
                                .withLot(new ObjectReferenceDataBuilder().withId('lot-4')
                                    .build())
                                .buildJson(),
                            new CanFulfillForMeEntryDataBuilder()
                                .withOrderable(new ObjectReferenceDataBuilder().withId('id-three')
                                    .build())
                                .withLot(new ObjectReferenceDataBuilder().withId('lot-5')
                                    .build())
                                .buildJson()
                        ])
                        .build(),
                    new StockCardSummaryDataBuilder()
                        .withOrderable(new ObjectReferenceDataBuilder().withId('id-five')
                            .build())
                        .withCanFulfillForMe([
                            new CanFulfillForMeEntryDataBuilder()
                                .withOrderable(new ObjectReferenceDataBuilder().withId('id-six')
                                    .build())
                                .withLot(new ObjectReferenceDataBuilder().withId('lot-8')
                                    .build())
                                .buildJson()
                        ])
                        .build()
                ])
                .build()
        ));
        orderableFulfillsResourceMock.query.andReturn($q.resolve({
            'id-one': {
                canFulfillForMe: ['id-two', 'id-three', 'id-four']
            },
            'id-five': {
                canFulfillForMe: ['id-six']
            }
        }));
        orderableResourceMock.query.andReturn($q.resolve(
            new PageDataBuilder()
                .withContent([
                    new OrderableDataBuilder().withId('id-one')
                        .build(),
                    new OrderableDataBuilder().withId('id-two')
                        .withIdentifiers({
                            tradeItem: 'trade-item-2'
                        })
                        .build(),
                    new OrderableDataBuilder().withId('id-three')
                        .withIdentifiers({
                            tradeItem: 'trade-item-3'
                        })
                        .build(),
                    new OrderableDataBuilder().withId('id-four')
                        .withIdentifiers({
                            tradeItem: 'trade-item-4'
                        })
                        .build(),
                    new OrderableDataBuilder().withId('id-five')
                        .build(),
                    new OrderableDataBuilder().withId('id-six')
                        .withIdentifiers({
                            tradeItem: 'trade-item-6'
                        })
                        .build()
                ])
                .build()
        ));
        lotResourceMock.query.andReturn($q.resolve(
            new PageDataBuilder()
                .withContent([
                    new LotDataBuilder().withId('lot-1')
                        .withTradeItemId('trade-item-2')
                        .build(),
                    new LotDataBuilder().withId('lot-2')
                        .withTradeItemId('trade-item-2')
                        .build(),
                    new LotDataBuilder().withId('lot-3')
                        .withTradeItemId('trade-item-2')
                        .build(),
                    new LotDataBuilder().withId('lot-4')
                        .withTradeItemId('trade-item-3')
                        .build(),
                    new LotDataBuilder().withId('lot-5')
                        .withTradeItemId('trade-item-3')
                        .build(),
                    new LotDataBuilder().withId('lot-6')
                        .withTradeItemId('trade-item-4')
                        .build(),
                    new LotDataBuilder().withId('lot-7')
                        .withTradeItemId('trade-item-6')
                        .build(),
                    new LotDataBuilder().withId('lot-8')
                        .withTradeItemId('trade-item-6')
                        .build()
                ])
                .build()
        ));

        fullStockCardSummaryRepositoryImpl = new FullStockCardSummaryRepositoryImpl();
    });

    describe('query', function() {

        it('should reject if summary download fails', function() {
            stockCardSummaryResourceMock.query.andReturn($q.reject());

            var rejected;
            fullStockCardSummaryRepositoryImpl.query()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockCardSummaryResourceMock.query).toHaveBeenCalled();

        });

        it('should reject if orderable fulfills download fails', function() {
            orderableFulfillsResourceMock.query.andReturn($q.reject());

            var rejected;
            fullStockCardSummaryRepositoryImpl.query()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockCardSummaryResourceMock.query).toHaveBeenCalled();
            expect(orderableFulfillsResourceMock.query).toHaveBeenCalled();
        });

        it('should reject if orderable download fails', function() {
            orderableResourceMock.query.andReturn($q.reject());

            var rejected;
            fullStockCardSummaryRepositoryImpl.query()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockCardSummaryResourceMock.query).toHaveBeenCalled();
            expect(orderableFulfillsResourceMock.query).toHaveBeenCalled();
            expect(orderableResourceMock.query).toHaveBeenCalled();
        });

        it('should reject if lot download fails', function() {
            lotResourceMock.query.andReturn($q.reject());

            var rejected;
            fullStockCardSummaryRepositoryImpl.query()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockCardSummaryResourceMock.query).toHaveBeenCalled();
            expect(orderableFulfillsResourceMock.query).toHaveBeenCalled();
            expect(orderableResourceMock.query).toHaveBeenCalled();
            expect(lotResourceMock.query).toHaveBeenCalled();
        });

        it('should build proper response', function() {
            var result;
            fullStockCardSummaryRepositoryImpl.query()
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(stockCardSummaryResourceMock.query).toHaveBeenCalled();
            expect(orderableFulfillsResourceMock.query).toHaveBeenCalled();
            expect(orderableResourceMock.query).toHaveBeenCalled();
            expect(lotResourceMock.query).toHaveBeenCalled();
            expect(result).not.toBeUndefined();
        });
    });
});