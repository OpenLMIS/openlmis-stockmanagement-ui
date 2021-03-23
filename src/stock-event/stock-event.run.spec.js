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

describe('synchronizeEvents', function() {

    var offlineService, stockEventCacheService, $rootScope;

    beforeEach(function() {
        var context = this;
        module('stock-event', function($provide) {
            offlineService = jasmine.createSpyObj('offlineService', ['isOffline']);
            $provide.service('offlineService', function() {
                return offlineService;
            });

            stockEventCacheService = jasmine.createSpyObj('stockEventCacheService', [
                'getStockEvents', 'cacheStockEvents', 'cacheStockEventSynchronizationError'
            ]);
            $provide.service('stockEventCacheService', function() {
                return stockEventCacheService;
            });
        });
        module('referencedata-user', function($provide) {
            context.loginServiceSpy = jasmine.createSpyObj('loginService', [
                'registerPostLoginAction', 'registerPostLogoutAction'
            ]);
            $provide.value('loginService', context.loginServiceSpy);
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            this.StockEventResource = $injector.get('StockEventResource');
            this.currentUserService = $injector.get('currentUserService');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.alertService = $injector.get('alertService');
        });
        this.postLoginAction = getLastCall(this.loginServiceSpy.registerPostLoginAction).args[0];
        this.user = new this.UserDataBuilder().build();

        spyOn($rootScope, '$watch').andCallThrough();
        spyOn(this.currentUserService, 'getUserInfo').andReturn();
        spyOn(this.StockEventResource.prototype, 'create').andReturn();
        spyOn(this.alertService, 'error');
        spyOn($rootScope, '$emit');

        //eslint-disable-next-line camelcase
        this.user_1 = {
            id: 'user_1'
        };
        //eslint-disable-next-line camelcase
        this.user_2 = {
            id: 'user_2'
        };
        //eslint-disable-next-line camelcase
        this.user_3 = {
            id: 'user_3'
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
        this.savedEvents_1['user_3'] = [this.event_1];
        //eslint-disable-next-line camelcase
        this.savedEvents_2 = {};
        this.savedEvents_2['user_1'] = [this.event_1, this.event_2];
        stockEventCacheService.getStockEvents.andReturn(this.savedEvents_2);
    });

    describe('watch', function() {
        it('should not call methods from synchronizeOfflineEvents when isOffline', function() {
            offlineService.isOffline.andReturn(true);
            $rootScope.$apply();

            expect(this.currentUserService.getUserInfo).not.toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).not.toHaveBeenCalled();
            expect(this.StockEventResource.prototype.create).not.toHaveBeenCalled();
        });

        it('should not call methods from synchronizeOfflineEvents when mode has not been changed', function() {
            offlineService.isOffline.andReturn(false);
            $rootScope.$apply();

            offlineService.isOffline.andReturn(false);
            $rootScope.$apply();

            expect(this.currentUserService.getUserInfo).not.toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).not.toHaveBeenCalled();
            expect(this.StockEventResource.prototype.create).not.toHaveBeenCalled();
        });

        it('should call methods from synchronizeOfflineEvents when mode has been changed to online', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user_1));

            changeModeFromOnlineToOffline();

            expect(this.currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).toHaveBeenCalled();
            expect(this.StockEventResource.prototype.create).toHaveBeenCalled();
        });

        it('should call methods from synchronizeOfflineEvents after login', function() {
            offlineService.isOffline.andReturn(false);
            this.currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user_1));

            this.postLoginAction(this.user);
            $rootScope.$apply();

            expect(this.loginServiceSpy.registerPostLoginAction).toHaveBeenCalled();
            expect(this.currentUserService.getUserInfo).toHaveBeenCalled();
        });
    });

    describe('synchronizeOfflineEvents', function() {
        it('should remove the event before call stock event repository', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user_3));
            stockEventCacheService.getStockEvents.andReturn(this.savedEvents_1);
            this.StockEventResource.prototype.create.andReturn(this.$q.resolve(this.event_1));

            changeModeFromOnlineToOffline();
            var cachedEvents = this.savedEvents_1[this.user_3.id].splice(event, 1);

            expect(stockEventCacheService.cacheStockEvents).toHaveBeenCalledWith(cachedEvents, this.user_3.id);
            expect(this.StockEventResource.prototype.create).toHaveBeenCalledWith({
                id: 'event_1'
            });
        });

        it('should add error information to the event object when creating event has failed', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user_3));
            stockEventCacheService.getStockEvents.andReturn(this.savedEvents_1);
            this.StockEventResource.prototype.create.andReturn(this.$q.reject({
                status: 'status_1',
                data: {
                    message: 'error_message'
                }
            }));

            var savedEvent = {
                //eslint-disable-next-line camelcase
                event: {
                    id: 'event_1'
                },
                error: {
                    status: 'status_1',
                    data: {
                        message: 'error_message'
                    }
                }
            };

            changeModeFromOnlineToOffline();

            expect(this.StockEventResource.prototype.create).toHaveBeenCalledWith({
                id: 'event_1'
            });

            expect(stockEventCacheService.cacheStockEventSynchronizationError).toHaveBeenCalledWith(
                savedEvent, this.user_3.id
            );

            expect(this.alertService.error).toHaveBeenCalledWith(
                'stockEvent.stockEventSynchronizationErrorTitle',
                'stockEvent.stockEventSynchronizationErrorMessage'
            );

            expect($rootScope.$emit)
                .toHaveBeenCalledWith('openlmis-referencedata.offline-events-indicator');
        });

        it('should not call stock event repository if current user has no offline events', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user_2));
            stockEventCacheService.getStockEvents.andReturn(this.savedEvents_2);

            changeModeFromOnlineToOffline();

            expect(this.currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).toHaveBeenCalled();
            expect(this.StockEventResource.prototype.create).not.toHaveBeenCalled();
        });

        it('should not call stock event repository if there are no offline events in local storage', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user_2));
            stockEventCacheService.getStockEvents.andReturn(undefined);

            changeModeFromOnlineToOffline();

            expect(this.currentUserService.getUserInfo).toHaveBeenCalled();
            expect(stockEventCacheService.getStockEvents).toHaveBeenCalled();
            expect(this.StockEventResource.prototype.create).not.toHaveBeenCalled();
        });
    });

    function changeModeFromOnlineToOffline() {
        offlineService.isOffline.andReturn(true);
        $rootScope.$apply();

        offlineService.isOffline.andReturn(false);
        $rootScope.$apply();
    }

    function getLastCall(method) {
        return method.calls[method.calls.length - 1];
    }
});
