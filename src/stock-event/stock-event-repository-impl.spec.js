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
        stockEventCacheService, offlineService, currentUserService, $rootScope, user;

    beforeEach(function() {
        module('stock-event', function($provide) {
            stockEventResourceMock = jasmine.createSpyObj('stockEventResource', ['create']);
            $provide.factory('StockEventResource', function() {
                return function() {
                    return stockEventResourceMock;
                };
            });

            currentUserService = jasmine.createSpyObj('currentUserService', ['getUserInfo']);
            $provide.service('currentUserService', function() {
                return currentUserService;
            });
            offlineService = jasmine.createSpyObj('offlineService', ['isOffline', 'checkConnection']);
            $provide.service('offlineService', function() {
                return offlineService;
            });
        });

        inject(function($injector) {
            StockEventRepositoryImpl = $injector.get('StockEventRepositoryImpl');
            stockEventCacheService = $injector.get('stockEventCacheService');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
        });

        user = {
            id: 'user_1'
        };
        //eslint-disable-next-line camelcase
        this.event_1 = {
            id: 'event_1'
        };
        //eslint-disable-next-line camelcase
        this.event_2 = {
            id: 'event_2'
        };
        //eslint-disable-next-line camelcase
        this.savedEvents_1 = {};
        this.savedEvents_1['user_1'] = [this.event_1];
        //eslint-disable-next-line camelcase
        this.savedEvents_2 = {};
        this.savedEvents_2['user_1'] = [this.event_1, this.event_2];

        spyOn(stockEventCacheService, 'cacheStockEvent');
        currentUserService.getUserInfo.and.returnValue($q.resolve(user));
        stockEventRepositoryImpl = new StockEventRepositoryImpl();
    });

    describe('create', function() {

        it('should create stock event when online', function() {
            offlineService.isOffline.and.returnValue(false);

            stockEventResourceMock.create.and.returnValue($q.resolve());

            stockEventRepositoryImpl.create(this.event_1);

            expect(stockEventResourceMock.create).toHaveBeenCalled();
            expect(currentUserService.getUserInfo).not.toHaveBeenCalled();
            expect(stockEventCacheService.cacheStockEvent).not.toHaveBeenCalled();
        });

        it('should save stock event in local storage when offline', function() {
            offlineService.isOffline.and.returnValue(true);
            stockEventCacheService.cacheStockEvent.and.callThrough();

            stockEventRepositoryImpl.create(this.event_1);
            $rootScope.$apply();

            expect(stockEventResourceMock.create).not.toHaveBeenCalled();
            expect(currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.cacheStockEvent).toHaveBeenCalled();
        });
    });
});
