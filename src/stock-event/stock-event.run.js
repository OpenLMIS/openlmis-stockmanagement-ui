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

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name stock-event.synchronizeEvents
     *
     * @description
     * Calls synchronizeOfflineEvents after logging in to OLMIS or after changing mode from offline to onlnie.
     */
    angular
        .module('stock-event')
        .run(synchronizeEvents);

    synchronizeEvents.$inject = ['$rootScope', 'offlineService', 'StockEventResource', 'localStorageService',
        'currentUserService', 'loginService', 'stockEventCacheService', 'alertService', 'messageService'];

    function synchronizeEvents($rootScope, offlineService, StockEventResource, localStorageService,
                               currentUserService, loginService, stockEventCacheService, alertService, messageService) {

        $rootScope.$watch(function() {
            return offlineService.isOffline();
        }, function(isOffline, wasOffline) {
            if (!isOffline && isOffline !== wasOffline) {
                synchronizeOfflineEvents();
            }
        }, true);

        loginService.registerPostLoginAction(function() {
            if (!offlineService.isOffline()) {
                synchronizeOfflineEvents();
            }
        });

        /**
         * @ngdoc method
         * @methodOf stock-event.synchronizeEvents
         * @name synchronizeOfflineEvents
         *
         * @description
         * Gets stock events from cache for the current user and sends them
         */
        function synchronizeOfflineEvents() {
            var resource = new StockEventResource();

            currentUserService.getUserInfo()
                .then(function(user) {
                    sendStockEvents(user.id, resource);
                });
        }

        function sendStockEvents(userId, resource) {
            var stockEvents = stockEventCacheService.getStockEvents();
            if (!stockEvents[userId]) {
                return;
            }

            var event = angular.copy(stockEvents[userId][0]);
            if (!event || offlineService.isOffline()) {
                return;
            }

            stockEvents[userId].splice(event, 1);
            stockEventCacheService.cacheStockEvents(stockEvents[userId], userId);

            resource.create(event)
                .then(function() {
                    sendStockEvents(userId, resource);
                })
                .catch(function(error) {
                    alertService.error(
                        'stockEvent.stockEventSynchronizationErrorTitle',
                        messageService.get('stockEvent.stockEventSynchronizationErrorMessage', {
                            error: error.data.message
                        })
                    );
                    stockEventCacheService.cacheStockEventSynchronizationError(
                        createStockEventErrorObject(event, error), userId
                    );
                    sendStockEvents(userId, resource);
                });
        }

        function createStockEventErrorObject(event, error) {
            return {
                event: event,
                error: {
                    status: error.status,
                    data: error.data
                }
            };
        }
    }

})();
