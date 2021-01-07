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

describe('StockCardSummaryRepositoryImpl', function() {

    var $rootScope, $q, $httpBackend, stockCardSummaryRepositoryImpl, StockCardSummaryRepositoryImpl,
        LotResource, OrderableResource, StockCardSummaryDataBuilder, LotDataBuilder,
        PageDataBuilder, CanFulfillForMeEntryDataBuilder, OrderableDataBuilder,
        stockCardSummary1, stockCardSummary2, lots, orderables, dateUtils, StockCardSummaryResource;

    beforeEach(function() {
        module('openlmis-pagination');
        module('stock-card-summary', function($provide) {
            $provide.factory('LotResource', function() {
                return function() {
                    LotResource = jasmine.createSpyObj('LotResource', ['query']);
                    return LotResource;
                };
            });

            $provide.factory('OrderableResource', function() {
                return function() {
                    OrderableResource = jasmine.createSpyObj('OrderableResource', ['query']);
                    return OrderableResource;
                };
            });

            $provide.factory('StockCardSummaryResource', function() {
                return function() {
                    StockCardSummaryResource = jasmine.createSpyObj('StockCardSummaryResource', ['query']);
                    return StockCardSummaryResource;
                };
            });
        });

        inject(function($injector) {
            StockCardSummaryRepositoryImpl = $injector.get('StockCardSummaryRepositoryImpl');
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
            $httpBackend = $injector.get('$httpBackend');
            StockCardSummaryDataBuilder = $injector.get('StockCardSummaryDataBuilder');
            CanFulfillForMeEntryDataBuilder = $injector.get('CanFulfillForMeEntryDataBuilder');
            LotDataBuilder = $injector.get('LotDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            PageDataBuilder = $injector.get('PageDataBuilder');
            dateUtils = $injector.get('dateUtils');
        });

        stockCardSummaryRepositoryImpl = new StockCardSummaryRepositoryImpl();

        stockCardSummary1 = new StockCardSummaryDataBuilder()
            .withCanFulfillForMeEntry(new CanFulfillForMeEntryDataBuilder()
                .withoutStockCard()
                .buildJson())
            .withCanFulfillForMeEntry(new CanFulfillForMeEntryDataBuilder()
                .buildJson())
            .buildJson();
        stockCardSummary2 = new StockCardSummaryDataBuilder()
            .withCanFulfillForMeEntry(new CanFulfillForMeEntryDataBuilder()
                .buildJson())
            .buildJson();

        lots = [
            new LotDataBuilder()
                .withId(stockCardSummary1.canFulfillForMe[0].lot.id)
                .build(),
            new LotDataBuilder()
                .withId(stockCardSummary1.canFulfillForMe[2].lot.id)
                .build(),
            new LotDataBuilder()
                .withId(stockCardSummary2.canFulfillForMe[0].lot.id)
                .build(),
            new LotDataBuilder()
                .withId(stockCardSummary2.canFulfillForMe[1].lot.id)
                .build()
        ];

        orderables = [
            new OrderableDataBuilder()
                .withId(stockCardSummary1.canFulfillForMe[0].orderable.id)
                .build(),
            new OrderableDataBuilder()
                .withId(stockCardSummary1.canFulfillForMe[1].orderable.id)
                .build(),
            new OrderableDataBuilder()
                .withId(stockCardSummary1.canFulfillForMe[2].orderable.id)
                .build(),
            new OrderableDataBuilder()
                .withId(stockCardSummary2.canFulfillForMe[0].orderable.id)
                .build(),
            new OrderableDataBuilder()
                .withId(stockCardSummary2.canFulfillForMe[1].orderable.id)
                .build()
        ];
    });

    describe('query', function() {

        var summariesPage, params;

        beforeEach(function() {
            params = {
                page: 0,
                size: 10,
                param: 'param'
            };

            summariesPage = new PageDataBuilder()
                .withContent([stockCardSummary1, stockCardSummary2])
                .build();

            OrderableResource.query.andReturn($q.resolve(new PageDataBuilder().withContent(orderables)
                .build()));
            LotResource.query.andReturn($q.resolve(new PageDataBuilder().withContent(lots)
                .build()));
        });

        it('should resolve to combined server responses if requests were successful', function() {
            StockCardSummaryResource.query.andReturn($q.resolve(summariesPage));

            var result;
            stockCardSummaryRepositoryImpl.query(params)
                .then(function(response) {
                    result = response;
                });

            $rootScope.$apply();

            expect(result.content[0].orderable).toEqual(orderables[0]);

            checkCanFulfillForMeEntry(result.content[0].canFulfillForMe[0], orderables[0], lots[0],
                stockCardSummary1.canFulfillForMe[0].stockCard,
                stockCardSummary1.canFulfillForMe[0].occurredDate,
                stockCardSummary1.canFulfillForMe[0].processedDate);
            checkCanFulfillForMeEntry(result.content[0].canFulfillForMe[1], orderables[1]);
            checkCanFulfillForMeEntry(result.content[0].canFulfillForMe[2], orderables[2], lots[1],
                stockCardSummary1.canFulfillForMe[2].stockCard,
                stockCardSummary1.canFulfillForMe[2].occurredDate,
                stockCardSummary1.canFulfillForMe[2].processedDate);

            expect(result.content[1].orderable).toEqual(orderables[3]);

            checkCanFulfillForMeEntry(result.content[1].canFulfillForMe[0], orderables[3], lots[2],
                stockCardSummary2.canFulfillForMe[0].stockCard,
                stockCardSummary2.canFulfillForMe[0].occurredDate,
                stockCardSummary2.canFulfillForMe[0].processedDate);
            checkCanFulfillForMeEntry(result.content[1].canFulfillForMe[1], orderables[4], lots[3],
                stockCardSummary2.canFulfillForMe[1].stockCard,
                stockCardSummary2.canFulfillForMe[1].occurredDate,
                stockCardSummary2.canFulfillForMe[1].processedDate);
        });

        it('should reject if shipment repository rejects', function() {
            StockCardSummaryResource.query.andReturn($q.resolve(summariesPage));
            OrderableResource.query.andReturn($q.reject());

            var rejected;
            stockCardSummaryRepositoryImpl.query(params)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(OrderableResource.query).toHaveBeenCalled();
        });

        it('should reject if request was unsuccessful', function() {
            StockCardSummaryResource.query.andReturn($q.reject());

            var rejected;
            stockCardSummaryRepositoryImpl.query(params)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should reject if lot repository rejectes', function() {
            StockCardSummaryResource.query.andReturn($q.resolve(summariesPage));
            LotResource.query.andReturn($q.reject());

            var rejected;
            stockCardSummaryRepositoryImpl.query(params)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
            expect(LotResource.query).toHaveBeenCalled();
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function checkCanFulfillForMeEntry(entry, orderable, lot, stockCard, occurredDate, processedDate) {
        expect(entry.orderable).toEqual(orderable);
        expect(entry.lot).toEqual(lot);
        expect(entry.stockCard).toEqual(stockCard);
        expect(entry.occurredDate).toEqual(dateUtils.toDate(occurredDate));
        expect(entry.processedDate).toEqual(processedDate);
    }
});
