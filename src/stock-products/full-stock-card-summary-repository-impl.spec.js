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

    var fullStockCardSummaryRepositoryImpl, FullStockCardSummaryRepositoryImpl, lotRepositoryImplMock, $q, $rootScope,
        orderableRepositoryImplMock, orderableFulfillsResourceMock, stockCardSummaryResourceMock, PageDataBuilder,
        StockCardSummaryDataBuilder, CanFulfillForMeEntryDataBuilder, OrderableDataBuilder, LotDataBuilder;

    beforeEach(function() {
        module('stock-card-summary');
        module('openlmis-pagination');
        module('stock-products', function($provide) {
            lotRepositoryImplMock = jasmine.createSpyObj('lotRepositoryImpl', ['query']);
            $provide.factory('LotRepositoryImpl', function() {
                return function() {
                    return lotRepositoryImplMock;
                };
            });

            orderableRepositoryImplMock = jasmine.createSpyObj('orderableRepositoryImpl', ['query']);
            $provide.factory('OrderableRepositoryImpl', function() {
                return function() {
                    return orderableRepositoryImplMock;
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
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
        });

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
            stockCardSummaryResourceMock.query.andReturn($q.resolve(
                new PageDataBuilder()
                    .withContent([
                        new StockCardSummaryDataBuilder().build()
                    ])
                    .build()
            ));
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

        it('should reject if orderable fulfills download fails', function() {
            stockCardSummaryResourceMock.query.andReturn($q.resolve(
                new PageDataBuilder()
                    .withContent([
                        new StockCardSummaryDataBuilder().build()
                    ])
                    .build()
            ));
            orderableFulfillsResourceMock.query.andReturn($q.resolve({
                'id-one': {
                    canFulfillForMe: ['id-two', 'id-three', 'id-four']
                },
                'id-five': {
                    canFulfillForMe: ['id-six', '']
                }
            }));
            orderableRepositoryImplMock.query.andReturn($q.reject());

            var rejected;
            fullStockCardSummaryRepositoryImpl.query()
            .catch(function() {
                rejected = true;
            });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockCardSummaryResourceMock.query).toHaveBeenCalled();
            expect(orderableFulfillsResourceMock.query).toHaveBeenCalled();
            expect(orderableRepositoryImplMock.query).toHaveBeenCalled();
        });

        it('should reject if orderable fulfills download fails', function() {
            stockCardSummaryResourceMock.query.andReturn($q.resolve(
                new PageDataBuilder()
                    .withContent([
                        new StockCardSummaryDataBuilder().build()
                    ])
                    .build()
            ));
            orderableFulfillsResourceMock.query.andReturn($q.resolve({
                'id-one': {
                    canFulfillForMe: ['id-two', 'id-three', 'id-four']
                },
                'id-five': {
                    canFulfillForMe: ['id-six', '']
                }
            }));
            orderableRepositoryImplMock.query.andReturn($q.resolve(
                new PageDataBuilder()
                    .withContent([
                        new OrderableDataBuilder().build()
                    ])
                    .build()
            ));

            var rejected;
            fullStockCardSummaryRepositoryImpl.query()
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(stockCardSummaryResourceMock.query).toHaveBeenCalled();
            expect(orderableFulfillsResourceMock.query).toHaveBeenCalled();
            expect(orderableRepositoryImplMock.query).toHaveBeenCalled();
            expect(lotRepositoryImplMock.query).toHaveBeenCalled();
        });
    
    });

});