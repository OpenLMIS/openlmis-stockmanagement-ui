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

describe('stockEventCacheService', function() {

    beforeEach(function() {
        module('stock-event');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.stockEventCacheService = $injector.get('stockEventCacheService');
            this.localStorageService = $injector.get('localStorageService');
        });

        spyOn(this.localStorageService, 'get');
        spyOn(this.localStorageService, 'add');

        this.stockEventsKey = 'stockEvents';
        this.stockEventsSynchronizationErrorsKey = 'stockEventsSynchronizationErrors';

        //eslint-disable-next-line camelcase
        this.stockEvents_1 = {
            //eslint-disable-next-line camelcase
            user_1: [
                {
                    id: 'event_1'
                },
                {
                    id: 'event_2'
                }
            ],
            //eslint-disable-next-line camelcase
            user_2: [
                {
                    id: 'event_3'
                }
            ]
        };

        //eslint-disable-next-line camelcase
        this.stockEvents_2 = {
            //eslint-disable-next-line camelcase
            user_1: [
                {
                    id: 'event_1'
                }
            ],
            //eslint-disable-next-line camelcase
            user_2: [
                {
                    id: 'event_3'
                }
            ]
        };

        this.stockEventErrors = {
            //eslint-disable-next-line camelcase
            user_1: [
                {
                    id: 'event_1',
                    error: 'error_1'
                },
                {
                    id: 'event_2',
                    error: 'error_2'
                }
            ]
        };

        this.stockEventErrors2 = {
            //eslint-disable-next-line camelcase
            user_1: [
                {
                    id: 'event_3',
                    error: 'error_3'
                },
                {
                    id: 'event_4',
                    error: 'error_4'
                }
            ]
        };

        this.event = {
            id: 'event_4'
        };

        this.errorEvent = {
            id: 'event_3',
            error: 'error_3'
        };

    });

    describe('stockEvents', function() {

        it('should return cached data if available', function() {
            this.localStorageService.get.and.returnValue(angular.toJson(this.stockEvents_1));

            var result = this.stockEventCacheService.getStockEvents();
            this.$rootScope.$apply();

            expect(this.localStorageService.get).toHaveBeenCalledWith(this.stockEventsKey);
            expect(result).toEqual(this.stockEvents_1);
        });

        it('should no return cached data if stockEvents cache is empty', function() {
            this.localStorageService.get.and.returnValue({});

            var result = this.stockEventCacheService.getStockEvents();
            this.$rootScope.$apply();

            expect(this.localStorageService.get).toHaveBeenCalledWith(this.stockEventsKey);
            expect(result).toEqual({});
        });

        it('should cache stock event for specific user that has events in the cache', function() {
            this.localStorageService.get.and.returnValue(angular.toJson(this.stockEvents_1));

            this.stockEventCacheService.cacheStockEvent(this.event, 'user_1');
            this.$rootScope.$apply();

            this.stockEvents_1['user_1'].push(this.event);

            expect(this.localStorageService.get).toHaveBeenCalledWith(this.stockEventsKey);
            expect(this.localStorageService.add).toHaveBeenCalledWith(
                this.stockEventsKey,
                angular.toJson(this.stockEvents_1)
            );
        });

        it('should cache stock event for specific user that has no events in the cache', function() {
            this.localStorageService.get.and.returnValue(angular.toJson(this.stockEvents_1));

            this.stockEventCacheService.cacheStockEvent(this.event, 'user_3');
            this.$rootScope.$apply();

            this.stockEvents_1['user_3'] = [];
            this.stockEvents_1['user_3'].push(this.event);

            expect(this.localStorageService.get).toHaveBeenCalledWith(this.stockEventsKey);
            expect(this.localStorageService.add).toHaveBeenCalledWith(
                this.stockEventsKey,
                angular.toJson(this.stockEvents_1)
            );
        });

        it('should cache stock events for specific user', function() {
            this.localStorageService.get.and.returnValue(angular.toJson(this.stockEvents_1));

            this.stockEventCacheService.cacheStockEvents(this.stockEvents_2['user_1'], 'user_1');
            this.$rootScope.$apply();

            expect(this.localStorageService.get).toHaveBeenCalledWith(this.stockEventsKey);
            expect(this.localStorageService.add).toHaveBeenCalledWith(
                this.stockEventsKey,
                angular.toJson(this.stockEvents_2)
            );
        });
    });

    describe('stockEventsSynchronizationErrors', function() {

        it('should return cached data if available', function() {
            this.localStorageService.get.and.returnValue(angular.toJson(this.stockEventErrors));

            var result = this.stockEventCacheService.getStockEventsSynchronizationErrors();
            this.$rootScope.$apply();

            expect(this.localStorageService.get).toHaveBeenCalledWith(this.stockEventsSynchronizationErrorsKey);
            expect(result).toEqual(this.stockEventErrors);
        });

        it('should no return cached data if stockEvents cache is empty', function() {
            this.localStorageService.get.and.returnValue({});

            var result = this.stockEventCacheService.getStockEventsSynchronizationErrors();
            this.$rootScope.$apply();

            expect(this.localStorageService.get).toHaveBeenCalledWith(this.stockEventsSynchronizationErrorsKey);
            expect(result).toEqual({});
        });

        it('should cache stock event error for specific user that has events in the cache', function() {
            this.localStorageService.get.and.returnValue(angular.toJson(this.stockEventErrors));

            this.stockEventCacheService.cacheStockEventSynchronizationError(this.errorEvent, 'user_1');
            this.$rootScope.$apply();

            this.stockEventErrors['user_1'].push(this.errorEvent);

            expect(this.localStorageService.get).toHaveBeenCalledWith(this.stockEventsSynchronizationErrorsKey);
            expect(this.localStorageService.add).toHaveBeenCalledWith(
                this.stockEventsSynchronizationErrorsKey,
                angular.toJson(this.stockEventErrors)
            );
        });

        it('should cache stock event error for specific user that has no events in the cache', function() {
            this.localStorageService.get.and.returnValue(angular.toJson(this.stockEventErrors));

            this.stockEventCacheService.cacheStockEventSynchronizationError(this.errorEvent, 'user_5');
            this.$rootScope.$apply();

            this.stockEventErrors['user_5'] = [];
            this.stockEventErrors['user_5'].push(this.errorEvent);

            expect(this.localStorageService.get).toHaveBeenCalledWith(this.stockEventsSynchronizationErrorsKey);
            expect(this.localStorageService.add).toHaveBeenCalledWith(
                this.stockEventsSynchronizationErrorsKey,
                angular.toJson(this.stockEventErrors)
            );
        });

        it('should cache stock event errors for specific user', function() {
            this.localStorageService.get.and.returnValue(angular.toJson(this.stockEventErrors));

            this.stockEventCacheService.cacheStockEventSynchronizationErrors(
                this.stockEventErrors2['user_1'], 'user_1'
            );
            this.$rootScope.$apply();

            expect(this.localStorageService.get).toHaveBeenCalledWith(this.stockEventsSynchronizationErrorsKey);
            expect(this.localStorageService.add).toHaveBeenCalledWith(
                this.stockEventsSynchronizationErrorsKey,
                angular.toJson(this.stockEventErrors2)
            );
        });
    });
});
