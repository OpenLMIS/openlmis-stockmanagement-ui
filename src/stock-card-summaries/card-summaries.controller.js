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
    'messageService', 'facility', 'user', 'supervisedPrograms', 'homePrograms',
    'loadingModalService', 'notificationService', '$filter',
    'authorizationService', 'facilityService', 'STOCKMANAGEMENT_RIGHTS', '$state', '$stateParams',
    'stockCardSummariesService', 'paginationService', 'SEARCH_OPTIONS'
  ];

  function controller(messageService, facility, user, supervisedPrograms, homePrograms,
                      loadingModalService, notificationService,
                      $filter, authorizationService, facilityService,
                      STOCKMANAGEMENT_RIGHTS, $state, $stateParams, stockCardSummariesService,
                      paginationService, SEARCH_OPTIONS) {
    var vm = this;

    /**
     * @ngdoc property
     * @propertyOf stock-card-summaries.controller:StockCardSummariesController
     * @name facilities
     * @type {Array}
     *
     * @description
     * Holds available facilities based on the selected type and/or programs
     */
    vm.facilities = [];

    /**
     * @ngdoc property
     * @propertyOf stock-card-summaries.controller:StockCardSummariesController
     * @name homeFacility
     * @type {Object}
     *
     * @description
     * Holds user's home facility
     */
    vm.homeFacility = facility;

    /**
     * @ngdoc property
     * @propertyOf stock-card-summaries.controller:StockCardSummariesController
     * @name programs
     * @type {Array}
     *
     * @description
     * Holds available programs.
     */
    vm.programs = [];

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
    vm.isSupervised = false;

    /**
     * @ngdoc method
     * @methodOf stock-card-summaries.controller:StockCardSummariesController
     * @name updateFacilityType
     *
     * @description
     * Responsible for displaying and updating select elements that allow to choose
     * program and facility to retrieve stock card summaries.
     * If isSupervised is true then it will display all programs where the current
     * user has supervisory permissions. If the it is false, then list of programs
     * from user's home facility will be displayed.
     *
     */
    vm.updateFacilityType = function () {
      vm.error = '';
      vm.hasSupervisedProgram = supervisedPrograms.length > 0;

      if (vm.isSupervised) {
        vm.programs = supervisedPrograms;
        vm.facilities = [];
        vm.selectedFacility = undefined;
        vm.selectedProgram = undefined;
        selectFacilityForSupervised();
      } else {
        vm.programs = homePrograms;
        vm.facilities = [facility];
        vm.selectedFacility = facility;
        selectProgramForHomeFacility();
      }
    };

    function selectFacilityForSupervised() {
      if (vm.programs.length === 1) {
        vm.selectedProgram = vm.programs[0];
        vm.loadFacilitiesForProgram();
      } else if ($stateParams.programId && $stateParams.facilityId) {
        vm.selectedProgram = _.find(vm.programs, function (program) {
          return program.id === $stateParams.programId;
        });
        vm.loadFacilitiesForProgram();
      }
    }

    function selectProgramForHomeFacility() {
      vm.selectedProgram = undefined;
      if (vm.programs.length <= 0) {
        vm.error = messageService.get('stockCardSummaries.noProgramAvailable');
      } else if ($stateParams.programId) {
        vm.selectedProgram = _.find(vm.programs, function (program) {
          return program.id === $stateParams.programId;
        });
        vm.search();
      }
    }

    /**
     * @ngdoc method
     * @methodOf stock-card-summaries.controller:StockCardSummariesController
     * @name loadFacilitiesForProgram
     *
     * @description
     * Responsible for providing a list of facilities where selected program is active and
     * where the current user has supervisory permissions.
     *
     */
    vm.loadFacilitiesForProgram = function () {
      if (vm.selectedProgram.id) {
        loadingModalService.open();
        var viewCardsRight = authorizationService.getRightByName(
          STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW);

        if (viewCardsRight) {
          facilityService.getUserSupervisedFacilities(user.user_id, vm.selectedProgram.id,
            viewCardsRight.id)
            .then(function (facilities) {
              vm.facilities = facilities;
              vm.error = '';

              if (vm.facilities.length <= 0) {
                vm.error = messageService.get('stockCardSummaries.noFacilitiesForProgram');
              } else if ($stateParams.facilityId) {
                vm.selectedFacility = _.find(vm.facilities, function (facility) {
                  return facility.id === $stateParams.facilityId;
                });
                vm.search();
              }
            }).catch(function (error) {
            notificationService.error('stockCardSummaries.errorOccurred');
          }).finally(loadingModalService.close);
        }
      } else {
        vm.facilities = [];
      }
    };

    var summariesWithEmptyCards = undefined;
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
      var facility = vm.selectedFacility;
      var program = vm.selectedProgram;
      vm.title = {
        facility: facility.name,
        program: program.name
      };

      stockCardSummariesService.getStockCardSummaries(program.id, facility.id, SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES)
        .then(function (response) {
          $stateParams.size = "@@STOCKMANAGEMENT_PAGE_SIZE";
          $stateParams.page = 0;
          $stateParams.facilityId = vm.selectedFacility.id;
          $stateParams.programId = vm.selectedProgram.id;
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
      stockCardSummariesService.print(vm.selectedProgram.id, vm.selectedFacility.id);
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
      if (_.isUndefined(facility)) {
        vm.isSupervised = true;
      }

      vm.updateFacilityType();
    }

    onInit();
  }
})();
