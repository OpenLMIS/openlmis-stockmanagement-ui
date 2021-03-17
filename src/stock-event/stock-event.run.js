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

    angular
        .module('stock-event')
        .run(synchronizeEvents);

    synchronizeEvents.$inject = ['$rootScope', 'offlineService', 'StockEventResource', 'localStorageService',
        'currentUserService', 'loginService'];

    function synchronizeEvents($rootScope, offlineService, StockEventResource, localStorageService,
                               currentUserService, loginService) {

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
         *
         * @return {StockEvent}       the new instance of stock events
         */
        function synchronizeOfflineEvents() {
            var resource = new StockEventResource();

            currentUserService.getUserInfo()
                .then(function(user) {
                    sendStockEvents(user.id, resource);
                });
        }

        function sendStockEvents(userId, resource) {
            var stockEvents = getAllStockEventsFromCache();
            if (!stockEvents[userId]) {
                stockEvents[userId] = [];
            }

            var event = stockEvents[userId].find(function(e) {
                return !e.sent && !e.error;
            });

            if (!event) {
                return;
            }

            if (offlineService.isOffline()) {
                return;
            }

            var eventToSent = angular.copy(event);

            event.sent = true;
            updateStockEventsMap(stockEvents);

            resource.create(eventToSent)
                .then(function() {
                    stockEvents[userId].splice(event, 1);
                    updateStockEventsMap(stockEvents);
                    sendStockEvents(userId, resource);
                })
                .catch(function(error) {
                    event.error = {
                        status: error.status,
                        data: error.data
                    };
                    updateStockEventsMap(stockEvents);
                    sendStockEvents(userId, resource);
                });
        }

        function getAllStockEventsFromCache() {
            var stockEvents = localStorageService.get('stockEvents');
            if (stockEvents) {
                return angular.fromJson(stockEvents);
            }
            return {};
        }

        function updateStockEventsMap(stockEvents) {
            localStorageService.add('stockEvents', angular.toJson(stockEvents));
        }
    }

})();
