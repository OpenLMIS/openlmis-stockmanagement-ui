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

describe('StockEventRepositoryImpl', function() {

    var stockEventRepositoryImpl, StockEventRepositoryImpl, $q, stockEventResourceMock,
        localStorageService, offlineService;

    beforeEach(function() {
        module('stock-event', function($provide) {
            stockEventResourceMock = jasmine.createSpyObj('stockEventResource', ['create']);
            $provide.factory('StockEventResource', function() {
                return function() {
                    return stockEventResourceMock;
                };
            });

            offlineService = jasmine.createSpyObj('offlineService', ['isOffline', 'checkConnection']);
            $provide.service('offlineService', function() {
                return offlineService;
            });
        });

        inject(function($injector) {
            StockEventRepositoryImpl = $injector.get('StockEventRepositoryImpl');
            localStorageService = $injector.get('localStorageService');
            $q = $injector.get('$q');
        });

        spyOn(localStorageService, 'get').andCallThrough();

        stockEventRepositoryImpl = new StockEventRepositoryImpl();
    });

    describe('create', function() {

        it('should create stock event when online', function() {
            offlineService.isOffline.andReturn(false);

            stockEventResourceMock.create.andReturn($q.resolve());

            var event = {};
            stockEventRepositoryImpl.create(event);

            expect(stockEventResourceMock.create).toHaveBeenCalled();
        });

        it('should save stock event in local storage when offline', function() {
            offlineService.isOffline.andReturn(true);

            var event = {
                id: 'event1'
            };
            stockEventRepositoryImpl.create(event);

            expect(stockEventResourceMock.create).not.toHaveBeenCalled();
            expect(angular.fromJson(localStorageService.get('stockEvents'))).toContain(event);
        });

        it('should allow to add multiple events to local storage', function() {
            offlineService.isOffline.andReturn(true);

            var existingEvent = {
                id: 'existingEvent'
            };
            localStorageService.add('stockEvents', angular.toJson([existingEvent]));

            var event = {
                id: 'event1'
            };
            stockEventRepositoryImpl.create(event);

            var events = angular.fromJson(localStorageService.get('stockEvents'));

            expect(events).toContain(existingEvent);
            expect(events).toContain(event);
        });
    });

    afterEach(function() {
        localStorageService.remove('stockEvents');
    });
});
