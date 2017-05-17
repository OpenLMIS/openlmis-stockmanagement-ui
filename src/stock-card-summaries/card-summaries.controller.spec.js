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

describe("StockCardSummariesController", function () {

  var $q, programs, rootScope, stockCardSummariesService, $state, $stateParams, facility, user, SEARCH_OPTIONS;

  beforeEach(function () {

    module('stock-card-summaries');

    inject(function (_$q_, $rootScope, $controller, _$state_, _$stateParams_, _stockCardSummariesService_, _SEARCH_OPTIONS_) {

      rootScope = $rootScope;
      $state = _$state_;
      $stateParams = _$stateParams_;
      stockCardSummariesService = _stockCardSummariesService_;
      $q = _$q_;
      SEARCH_OPTIONS = _SEARCH_OPTIONS_;

      programs = [{"code": "HIV", "id": 1}, {"code": "programCode", "id": 2}];
      facility = {
        "id": "10134",
        "name": "National Warehouse",
        "description": null,
        "code": "CODE",
        "supportedPrograms": programs
      };

      vm = $controller('StockCardSummariesController', {
        facility: facility,
        user: user,
        supervisedPrograms: programs,
        homePrograms: programs,
        stockCardSummariesService: stockCardSummariesService,
      });
    });
  });

  it("should assign proper values when facility is assigned", function () {
    expect(vm.selectedFacility).toEqual(facility);
    expect(vm.programs).toEqual(programs);
    expect(vm.selectedProgram).toEqual(undefined);
  });

  it("should change title when search stock card summaries", function () {
    vm.selectedFacility = facility;
    vm.selectedProgram = programs[0];
    var title = {
      facility: vm.selectedFacility.name,
      program: vm.selectedProgram.name
    };

    vm.search();
    expect(vm.title).toEqual(title);
  });

  it("should call stock summaries service to get summaries", function () {
    spyOn(stockCardSummariesService, 'getStockCardSummaries');
    var defer = $q.defer();

    vm.selectedFacility = facility;
    vm.selectedProgram = programs[0];

    stockCardSummariesService.getStockCardSummaries.andReturn(defer.promise);

    vm.search();
    rootScope.$apply();

    expect(stockCardSummariesService.getStockCardSummaries)
      .toHaveBeenCalledWith(vm.selectedProgram.id, vm.selectedFacility.id, SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES);
  });

  it('should calculate total soh when lot enabled', function () {
    var lineItems = [{stockOnHand: 1}, {stockOnHand: 2}];

    expect(vm.calculateSOH(lineItems)).toEqual(3);
  });
});
