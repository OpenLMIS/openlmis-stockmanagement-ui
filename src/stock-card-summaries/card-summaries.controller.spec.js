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

  var $q, programs, rootScope, stockCardSummariesService, facility, user, SEARCH_OPTIONS;

  beforeEach(function () {

    module('stock-card-summaries');

    inject(function (_$q_, $rootScope, $controller, _stockCardSummariesService_, _SEARCH_OPTIONS_) {

      rootScope = $rootScope;
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
      });
    });
  });


  it("should change title when search stock card summaries", function () {
    vm.facility = facility;
    vm.program = programs[0];
    var title = {
      facility: vm.facility.name,
      program: vm.program.name
    };

    vm.search();
    expect(vm.title).toEqual(title);
  });

  it("should call stock summaries service to get summaries", function () {
    spyOn(stockCardSummariesService, 'getStockCardSummaries');
    var defer = $q.defer();

    vm.facility = facility;
    vm.program = programs[0];

    stockCardSummariesService.getStockCardSummaries.andReturn(defer.promise);

    vm.search();
    rootScope.$apply();

    expect(stockCardSummariesService.getStockCardSummaries)
      .toHaveBeenCalledWith(vm.program.id, vm.facility.id, SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES);
  });

  it('should calculate total soh when lot enabled', function () {
    var lineItems = [{stockOnHand: 1}, {stockOnHand: 2}];

    expect(vm.calculateSOH(lineItems)).toEqual(3);
  });
});
