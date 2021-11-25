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
     * @name stock-card-summary-list.controller:StockCardSummaryListController
     *
     * @description
     * Controller responsible displaying Stock Card Summaries.
     */
    angular
        .module('stock-card-summary-list')
        .controller('StockCardSummaryListController', controller);

    controller.$inject = [
        'loadingModalService', '$state', '$stateParams', 'StockCardSummaryRepositoryImpl', 'stockCardSummaries',
        'offlineService', '$scope', 'STOCKCARD_STATUS', 'messageService'
    ];

    function controller(loadingModalService, $state, $stateParams, StockCardSummaryRepositoryImpl, stockCardSummaries,
                        offlineService, $scope, STOCKCARD_STATUS, messageService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.loadStockCardSummaries = loadStockCardSummaries;
        vm.viewSingleCard = viewSingleCard;
        vm.print = print;
        vm.search = search;
        vm.offline = offlineService.isOffline;
        vm.goToPendingOfflineEventsPage = goToPendingOfflineEventsPage;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name stockCardSummaries
         * @type {Array}
         *
         * @description
         * List of Stock Card Summaries.
         */
        vm.stockCardSummaries = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name displayStockCardSummaries
         * @type {Array}
         *
         * @description
         *  Holds current display list of Stock Card Summaries.
         */
        vm.displayStockCardSummaries = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name stockCardStatus
         * @type {String}
         *
         * @description
         * Holds stack cards status.
         */
        vm.stockCardStatus = $stateParams.active;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name stockCardStatuses
         * @type {Object}
         *
         * @description
         * Holds list of Stock Card statuses.
         */
        vm.stockCardStatuses = STOCKCARD_STATUS;

        /**
        * @ngdoc method
        * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
        * @name getStockCardStatusDisplay
        *
        * @description
        * Returns Stock Card status display.
        *
        * @param  {String} status Stock Card status
        * @return {String}        Stock Card status display name
        */
        vm.getStockCardStatusDisplay = function(status) {
            return messageService.get(STOCKCARD_STATUS.$getDisplayName(status));
        };

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name getStockSummaries
         *
         * @description
         * Initialization method for StockCardSummaryListController.
         */
        function onInit() {
            vm.stockCardSummaries = stockCardSummaries;
            vm.displayStockCardSummaries = angular.copy(stockCardSummaries);

            $scope.$watchCollection(function() {
                return vm.pagedList;
            }, function(newList) {
                if (vm.offline()) {
                    vm.displayStockCardSummaries = newList;
                }
            }, true);
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name loadStockCardSummaries
         *
         * @description
         * Responsible for retrieving Stock Card Summaries based on selected program and facility.
         */
        function loadStockCardSummaries() {
            var stateParams = angular.copy($stateParams);

            stateParams.facility = vm.facility.id;
            stateParams.program = vm.program.id;
            stateParams.active = STOCKCARD_STATUS.ACTIVE;
            stateParams.supervised = vm.isSupervised;

            $state.go('openlmis.stockmanagement.stockCardSummaries', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name viewSingleCard
         *
         * @description
         * Go to the clicked stock card's page to view its details.
         *
         * @param {sting} stockCardId the Stock Card UUID
         */
        function viewSingleCard(stockCardId) {
            $state.go('openlmis.stockmanagement.stockCardSummaries.singleCard', {
                stockCardId: stockCardId
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name print
         *
         * @description
         * Print SOH summary of current selected program and facility.
         */
        function print() {
            new StockCardSummaryRepositoryImpl().print(vm.program.id, vm.facility.id);
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name search
         *
         * @description
         * It searches from the total line items with given stockCardStatus.
         * If stockCardStatus are empty then all line items will be shown.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.facility = vm.facility.id;
            stateParams.program = vm.program.id;
            stateParams.supervised = vm.isSupervised;
            stateParams.active = vm.stockCardStatus;
            $state.go('openlmis.stockmanagement.stockCardSummaries', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name goToPendingOfflineEventsPage
         *
         * @description
         * Takes the user to the pending offline events page.
         */
        function goToPendingOfflineEventsPage() {
            $state.go('openlmis.pendingOfflineEvents');
        }

    }
})();
