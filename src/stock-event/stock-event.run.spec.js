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

    var offlineService, localStorageService, $rootScope;

    beforeEach(function() {
        var context = this;
        module('stock-event', function($provide) {
            offlineService = jasmine.createSpyObj('offlineService', ['isOffline']);
            $provide.service('offlineService', function() {
                return offlineService;
            });

            localStorageService = jasmine.createSpyObj('localStorageService', ['get', 'add']);
            $provide.service('localStorageService', function() {
                return localStorageService;
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
        });
        this.postLoginAction = getLastCall(this.loginServiceSpy.registerPostLoginAction).args[0];
        this.user = new this.UserDataBuilder().build();

        spyOn($rootScope, '$watch').andCallThrough();
        spyOn(this.currentUserService, 'getUserInfo').andReturn();
        spyOn(this.StockEventResource.prototype, 'create').andReturn();

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
            id: 'event_2',
            sent: true
        };
        //eslint-disable-next-line camelcase
        this.event_3 = {
            id: 'event_3',
            sent: true,
            error: {
                status: 'status_1',
                data: 'message error'
            }
        };
        //eslint-disable-next-line camelcase
        this.savedEvents_1 = {};
        this.savedEvents_1['user_3'] = [this.event_1];
        //eslint-disable-next-line camelcase
        this.savedEvents_2 = {};
        this.savedEvents_2['user_1'] = [this.event_1, this.event_2, this.event_3];
        localStorageService.get.andReturn(this.savedEvents_2);
    });

    describe('watch', function() {
        it('should not call methods from synchronizeOfflineEvents when isOffline', function() {
            offlineService.isOffline.andReturn(true);
            $rootScope.$apply();

            expect(this.currentUserService.getUserInfo).not.toHaveBeenCalled();
            expect(localStorageService.get).not.toHaveBeenCalled();
            expect(this.StockEventResource.prototype.create).not.toHaveBeenCalled();
        });

        it('should not call methods from synchronizeOfflineEvents when mode has not been changed', function() {
            offlineService.isOffline.andReturn(false);
            $rootScope.$apply();

            offlineService.isOffline.andReturn(false);
            $rootScope.$apply();

            expect(this.currentUserService.getUserInfo).not.toHaveBeenCalled();
            expect(localStorageService.get).not.toHaveBeenCalled();
            expect(this.StockEventResource.prototype.create).not.toHaveBeenCalled();
        });

        it('should call methods from synchronizeOfflineEvents when mode has been changed to online', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user_1));

            changeModeFromOnlineToOffline();

            expect(this.currentUserService.getUserInfo).toHaveBeenCalled();
            expect(localStorageService.get).toHaveBeenCalled();
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
        it('should not call stock event repository if the event is marked as sent or error', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user_1));
            localStorageService.get.andReturn(this.savedEvents_2);

            changeModeFromOnlineToOffline();

            expect(this.StockEventResource.prototype.create).toHaveBeenCalledWith({
                id: 'event_1'
            });

            expect(this.StockEventResource.prototype.create).not.toHaveBeenCalledWith(this.event_2);
            expect(this.StockEventResource.prototype.create).not.toHaveBeenCalledWith(this.event_3);
        });

        it('should remove the cache event after successful response from the backend', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user_3));
            localStorageService.get.andReturn(this.savedEvents_1);
            this.StockEventResource.prototype.create.andReturn(this.$q.resolve(this.event_1));

            changeModeFromOnlineToOffline();

            expect(this.StockEventResource.prototype.create).toHaveBeenCalledWith({
                id: 'event_1'
            });

            expect(localStorageService.add.calls.length).toBe(2);
            expect(localStorageService.add.calls[1].args[1]).toBe('{"user_3":[]}');
        });

        it('should add error information to the event object when creating the event has failed', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user_3));
            localStorageService.get.andReturn(this.savedEvents_1);
            this.StockEventResource.prototype.create.andReturn(this.$q.reject({
                status: 'status_1',
                data: 'error_message'
            }));

            var savedEvent = {
                //eslint-disable-next-line camelcase
                user_3: [{
                    id: 'event_1',
                    sent: true,
                    error: {
                        status: 'status_1',
                        data: 'error_message'
                    }
                }]
            };

            changeModeFromOnlineToOffline();

            expect(this.StockEventResource.prototype.create).toHaveBeenCalledWith({
                id: 'event_1'
            });

            expect(localStorageService.add.calls.length).toBe(2);
            expect(localStorageService.add.calls[1].args[1]).toBe(angular.toJson(savedEvent));
        });

        it('should not call stock event repository if current user has no offline events', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user_2));
            localStorageService.get.andReturn(this.savedEvents_2);

            changeModeFromOnlineToOffline();

            expect(this.currentUserService.getUserInfo).toHaveBeenCalled();
            expect(localStorageService.get).toHaveBeenCalled();
            expect(this.StockEventResource.prototype.create).not.toHaveBeenCalled();
        });

        it('should not call stock event repository if there are no offline events in local storage', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.resolve(this.user_2));
            localStorageService.get.andReturn(undefined);

            changeModeFromOnlineToOffline();

            expect(this.currentUserService.getUserInfo).toHaveBeenCalled();
            expect(localStorageService.get).toHaveBeenCalled();
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
