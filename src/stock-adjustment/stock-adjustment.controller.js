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
     * @ngdoc controller
     * @name stock-adjustment.controller:StockAdjustmentController
     *
     * @description
     * Controller for making adjustment.
     */
    angular
        .module('stock-adjustment')
        .controller('StockAdjustmentController', controller);

    controller.$inject = ['facility', 'programs', 'adjustmentType', '$state', 'offlineService',
        'localStorageService', 'ADJUSTMENT_TYPE'];

    function controller(facility, programs, adjustmentType, $state, offlineService, localStorageService,
                        ADJUSTMENT_TYPE) {
        var vm = this;

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment.controller:StockAdjustmentController
         * @name facility
         * @type {Object}
         *
         * @description
         * Holds user's home facility.
         */
        vm.facility = facility;

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment.controller:StockAdjustmentController
         * @name programs
         * @type {Array}
         *
         * @description
         * Holds available programs for home facility.
         */
        vm.programs = programs;

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment.controller:StockAdjustmentController
         * @name offline
         * @type {boolean}
         *
         * @description
         * Holds information about internet connection
         */
        vm.offline = offlineService.isOffline;

        vm.goToPendingOfflineEventsPage = goToPendingOfflineEventsPage;

        vm.key = function(secondaryKey) {
            return adjustmentType.prefix + '.' + secondaryKey;
        };

        vm.proceed = function(program) {
            $state.go('openlmis.stockmanagement.' + adjustmentType.state + '.creation', {
                programId: program.id,
                program: program,
                facility: facility
            });
        };

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment.controller:StockAdjustmentController
         * @name offlineStockEvents
         * @type {boolean}
         *
         * @description
         * Holds information whether there is at least one cached stock event
         * of a given adjustment type
         */
        vm.offlineStockEvents = function() {
            var prefix,
                sameAdjustmentTypeEvent = false,
                stockEventsOffline = localStorageService.get('stockEvents');

            if (stockEventsOffline) {
                var events = angular.fromJson(stockEventsOffline);
                angular.forEach(events, function(value) {
                    value.find(function(event) {
                        // all line items in a given stock event are of the same adjustment type
                        prefix = getAdjustmentTypePrefix(event.lineItems[0]);
                        return sameAdjustmentTypeEvent = prefix === adjustmentType.prefix;
                    });
                });
                return sameAdjustmentTypeEvent;
            }
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment.controller:StockAdjustmentController
         * @name goToPendingOfflineEventsPage
         *
         * @description
         * Takes the user to the pending offline events page.
         */
        function goToPendingOfflineEventsPage() {
            $state.go('openlmis.pendingOfflineEvents');
        }

        function getAdjustmentTypePrefix(lineItem) {
            if (lineItem.sourceId) {
                return ADJUSTMENT_TYPE.RECEIVE.prefix;
            } else if (lineItem.destinationId) {
                return ADJUSTMENT_TYPE.ISSUE.prefix;
            }
            return ADJUSTMENT_TYPE.ADJUSTMENT.prefix;
        }
    }
})();
