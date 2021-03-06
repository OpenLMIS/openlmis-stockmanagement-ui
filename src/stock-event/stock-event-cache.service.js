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
     * Service responsible for retrieving stockEvents and stockEventsSynchronizationErrors
     * cached data from local storage.
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
        this.createErrorEventObjectAndCacheSynchronizationError = createErrorEventObjectAndCacheSynchronizationError;
        this.cacheStockEventSynchronizationErrors = cacheStockEventSynchronizationErrors;

        /**
         * @ngdoc method
         * @methodOf stock-event.stockEventCacheService
         * @name getStockEvents
         *
         * @description
         * Returns all cached stock events.
         *
         * @return {Object}     users stock events
         */
        function getStockEvents() {
            var stockEvents = localStorageService.get(STOCK_EVENTS);
            if (stockEvents) {
                return angular.fromJson(stockEvents);
            }
            return {};
        }

        /**
         * @ngdoc method
         * @methodOf stock-event.stockEventCacheService
         * @name getStockEventsSynchronizationErrors
         *
         * @description
         * Returns all cached stock events synchronization errors.
         *
         * @return {Object}     users stock events synchronization errors
         */
        function getStockEventsSynchronizationErrors() {
            var stockEventsErrors = localStorageService.get(STOCK_EVENTS_SYNCHRONIZATION_ERRORS);
            if (stockEventsErrors) {
                return angular.fromJson(stockEventsErrors);
            }
            return {};
        }

        /**
         * @ngdoc method
         * @methodOf stock-event.stockEventCacheService
         * @name cacheStockEvent
         *
         * @description
         * Caches given stock event in the local storage for a specific user.
         *
         * @param {Object} stockEvent  the stock event to be cached
         * @param {String} userId      user creating a stock event
         */
        function cacheStockEvent(stockEvent, userId) {
            var stockEventsMap = getStockEvents();
            if (!stockEventsMap[userId]) {
                stockEventsMap[userId] = [];
            }
            stockEventsMap[userId].push(stockEvent);
            localStorageService.add(STOCK_EVENTS, angular.toJson(stockEventsMap));
        }

        /**
         * @ngdoc method
         * @methodOf stock-event.stockEventCacheService
         * @name cacheStockEvents
         *
         * @description
         * Caches given stock events in the local storage for a specific user.
         * Overwrite in local storage all current stock events of the given user
         *
         * @param {Object} stockEvents  the stock events to be cached
         * @param {String} userId      user creating a stock events
         */
        function cacheStockEvents(stockEvents, userId) {
            var stockEventsMap = getStockEvents();
            stockEventsMap[userId] = stockEvents;
            localStorageService.add(STOCK_EVENTS, angular.toJson(stockEventsMap));
        }

        /**
         * @ngdoc method
         * @methodOf stock-event.stockEventCacheService
         * @name cacheStockEventSynchronizationError
         *
         * @description
         * Caches given stock event synchronization error in the local storage for a specific user.
         *
         * @param {Object} stockEventSynchronizationError  the stockEventSynchronizationError to be cached
         * @param {String} userId      user creating a stock event
         */
        function cacheStockEventSynchronizationError(stockEventSynchronizationError, userId) {
            var stockEventsErrorsMap = getStockEventsSynchronizationErrors();
            if (!stockEventsErrorsMap[userId]) {
                stockEventsErrorsMap[userId] = [];
            }
            stockEventsErrorsMap[userId].push(stockEventSynchronizationError);
            localStorageService.add(STOCK_EVENTS_SYNCHRONIZATION_ERRORS, angular.toJson(stockEventsErrorsMap));
        }

        /**
         * @ngdoc method
         * @methodOf stock-event.stockEventCacheService
         * @name createErrorEventObjectAndCacheSynchronizationError
         *
         * @description
         * Creates stock event synchronization error and caches it in the local storage for a specific user.
         *
         * @param {Object} stockEvent  the stock event to be cached
         * @param {Object} error       the error response from the server
         * @param {String} userId      user creating a stock event
         */
        function createErrorEventObjectAndCacheSynchronizationError(stockEvent, error, userId) {
            cacheStockEventSynchronizationError(
                createStockEventErrorObject(stockEvent, error), userId
            );
        }

        /**
         * @ngdoc method
         * @methodOf stock-event.stockEventCacheService
         * @name cacheStockEventSynchronizationErrors
         *
         * @description
         * Caches given stock event synchronization errors in the local storage for a specific user.
         * Overwrite in local storage all current stock event synchronization errors of the given user
         *
         * @param {Object} stockEventSynchronizationErrors  the stockEventSynchronizationErrors to be cached
         * @param {String} userId      user creating stock events
         */
        function cacheStockEventSynchronizationErrors(stockEventSynchronizationErrors, userId) {
            var stockEventsErrorsMap = getStockEventsSynchronizationErrors();
            stockEventsErrorsMap[userId] = stockEventSynchronizationErrors;
            localStorageService.add(STOCK_EVENTS_SYNCHRONIZATION_ERRORS, angular.toJson(stockEventsErrorsMap));
        }

        function createStockEventErrorObject(event, error) {
            var errorEvent = angular.copy(event);
            errorEvent.error = {
                status: error.status,
                data: error.data
            };

            return errorEvent;
        }
    }
})();
