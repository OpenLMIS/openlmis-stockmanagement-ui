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

(function () {

  'use strict';

  /**
   * @ngdoc controller
   * @name stock-card-summaries.controller:StockCardSummariesController
   *
   * @description
   * Controller responsible for actions connected with displaying stock card summaries.
   */
  angular
    .module('stock-card-summaries')
    .controller('StockCardSummariesController', controller);

  controller.$inject = [
    'messageService',
    'loadingModalService', 'notificationService', '$filter',
    'authorizationService', 'facilityService', 'STOCKMANAGEMENT_RIGHTS', '$state', '$stateParams',
    'stockCardSummariesService', 'paginationService', 'SEARCH_OPTIONS'
  ];

  function controller(messageService, loadingModalService, notificationService, $filter,
                      authorizationService, facilityService, STOCKMANAGEMENT_RIGHTS, $state,
                      $stateParams, stockCardSummariesService, paginationService, SEARCH_OPTIONS) {

    var vm = this,
        summariesWithEmptyCards;

    /**
     * @ngdoc property
     * @propertyOf stock-card-summaries.controller:StockCardSummariesController
     * @name isSupervised
     * @type {Boolean}
     *
     * @description
     * Holds currently selected facility selection type:
     *  false - my facility
     *  true - supervised facility
     */
    vm.isSupervised = undefined;

    /**
     * @ngdoc method
     * @methodOf stock-card-summaries.controller:StockCardSummariesController
     * @name getStockSummaries
     *
     * @description
     * Responsible for retrieving stock card summaries based on selected program and facility.
     *
     */
    vm.search = function () {
      loadingModalService.open();
      vm.title = {
        facility: vm.facility.name,
        program: vm.program.name
      };

      stockCardSummariesService.getStockCardSummaries(
          vm.program.id, vm.facility.id, SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES
      ).then(function (response) {
          $stateParams.size = "@@STOCKMANAGEMENT_PAGE_SIZE";
          $stateParams.page = 0;
          $stateParams.facility = vm.facility.id;
          $stateParams.program = vm.program.id;
          $stateParams.supervised = vm.isSupervised;
          $state.go($state.current.name, $stateParams, {reload: false, notify: false});

          summariesWithEmptyCards = response;

          paginationService.registerList(null, $stateParams, function () {
            var summariesWithActiveCards = _.filter(response, function (summary) {
              return summary.stockOnHand !== null;
            });
            vm.hasLot = summariesWithActiveCards.find(function (summary) {
              return !_.isEmpty(summary.lot);
            });

            var searchResult = stockCardSummariesService.search(vm.keyword, summariesWithActiveCards);
            searchResult = $filter('orderBy')(searchResult, 'orderable.productCode');

            vm.stockCardSummaries = _.chain(searchResult).groupBy(function (summary) {
              return summary.orderable.id;
            }).values().value();

            return vm.stockCardSummaries;
          });
        }).finally(loadingModalService.close);
    };

    /**
     * @ngdoc method
     * @methodOf stock-card-summaries.controller:StockCardSummariesController
     * @name calculateSOH
     *
     * @description
     * Calculate total soh when lot enabled.
     *
     */
    vm.calculateSOH = function (stockCardSummaries) {
      return _.chain(stockCardSummaries).map(function (summary) {
        return summary.stockOnHand;
      }).reduce(function (memo, soh) {
        return soh + memo;
      }, 0).value();
    };

    /**
     * @ngdoc method
     * @methodOf stock-card-summaries.controller:StockCardSummariesController
     * @name viewSingleCard
     *
     * @description
     * Go to the clicked stock card's page to view its details.
     *
     */
    vm.viewSingleCard = function (stockCardId) {
      $state.go("openlmis.stockmanagement.stockCardSummaries.singleCard", {stockCardId: stockCardId});
    };

    /**
     * @ngdoc method
     * @methodOf stock-card-summaries.controller:StockCardSummariesController
     * @name print
     *
     * @description
     * Print SOH summary of current selected program and facility.
     *
     */
    vm.print = function () {
      stockCardSummariesService.print(vm.program.id, vm.facility.id);
    };

    /**
     * @ngdoc method
     * @methodOf stock-card-summaries.controller:StockCardSummariesController
     * @name determineLotMessage
     *
     * @description
     * Determine the message when a summary has no lot.
     *
     */
    vm.determineLotMessage = function (displayedSummary) {
      var sameOrderables = _.filter(summariesWithEmptyCards, function (summary) {
        return summary.orderable.id === displayedSummary.orderable.id;
      });
      var messageKey = sameOrderables.length > 1 ? 'noLotDefined' : 'productHasNoLots';
      return messageService.get('stockCardSummaries.' + messageKey);
    };

    function onInit() {
      //When user go to this page from Administrator.user page, there would be a pagination UI component
      //with paged items information like the Administrator.user page.
      //So that, we need register an empty list to override it.
      paginationService.registerList(null, $stateParams, function () {
        return [];
      });
      vm.title = undefined;
      vm.stockCardSummaries = [];
    }

    onInit();
  }
})();
