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
     * @name stock-event.stockEventCacheService
     *
     * @description
     * ??????????????????????
     */
    angular
        .module('stock-event')
        .service('stockEventCacheService', stockEventCacheService);

    stockEventCacheService.$inject = ['localStorageService'];

    function stockEventCacheService(localStorageService) {

        var STOCK_EVENTS = 'stockEvents';
        var STOCK_EVENTS_SYNCHRONIZATION_ERRORS = 'stockEventsSynchronizationErrors';

        this.getStockEvents = getStockEvents;
        this.getStockEventsSynchronizationErrors = getStockEventsSynchronizationErrors;
        this.cacheStockEvent = cacheStockEvent;
        this.cacheStockEvents = cacheStockEvents;
        this.cacheStockEventSynchronizationError = cacheStockEventSynchronizationError;

        function getStockEvents() {
            var stockEvents = localStorageService.get(STOCK_EVENTS);
            if (stockEvents && stockEvents) {
                return angular.fromJson(stockEvents);
            }
            return {};
        }

        function getStockEventsSynchronizationErrors() {
            var stockEventsErrors = localStorageService.get(STOCK_EVENTS_SYNCHRONIZATION_ERRORS);
            if (stockEventsErrors) {
                return angular.fromJson(stockEventsErrors);
            }
            return {};
        }

        function cacheStockEvent(stockEvent, userId) {
            var stockEventsMap = getStockEvents();
            if (!stockEventsMap[userId]) {
                stockEventsMap[userId] = [];
            }
            stockEventsMap[userId].push(stockEvent);
            localStorageService.add('stockEvents', angular.toJson(stockEventsMap));
        }

        function cacheStockEvents(stockEvents, userId) {
            var stockEventsMap = getStockEvents(userId);
            stockEventsMap[userId] = stockEvents;
            localStorageService.add('stockEvents', angular.toJson(stockEventsMap));
        }

        function cacheStockEventSynchronizationError(event, userId) {
            var stockEventsErrorsMap = getStockEventsSynchronizationErrors();
            if (!stockEventsErrorsMap[userId]) {
                stockEventsErrorsMap[userId] = [];
            }
            stockEventsErrorsMap[userId].push(event);
            localStorageService.add('stockEventsSynchronizationErrors', angular.toJson(stockEventsErrorsMap));
        }
    }
})();
