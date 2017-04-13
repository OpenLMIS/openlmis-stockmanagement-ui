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

xdescribe("StockCardSummariesController", function () {

  var $q, programs, rootScope, stockCardSummariesService, $state, facility, user;

  beforeEach(function () {

    module('stock-card-summaries');

    inject(function (_$q_, $rootScope, $controller, _$state_, _stockCardSummariesService_) {

      rootScope = $rootScope;
      $state = _$state_;
      stockCardSummariesService = _stockCardSummariesService_;
      $q = _$q_;

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

    vm.getStockSummaries();
    expect(vm.title).toEqual(title);
  });

  it("should display summaries when search request get response", function () {
    spyOn(stockCardSummariesService, 'getStockCardSummaries');
    var defer = $q.defer();
    var stockCardSummaries = [{
      "stockOnHand": 123,
      "facility": {
        "id": "e6799d64-d10d-4011-b8c2-0e4d4a3f65ce",
        "code": "HC01",
        "name": "Comfort Health Clinic"
      },
      "program": {
        "id": "10845cb9-d365-4aaa-badd-b4fa39c6a26a",
        "code": "PRG002",
        "name": "Essential Meds"
      },
      "orderable": {
        "id": "c9e65f02-f84f-4ba2-85f7-e2cb6f0989af",
        "productCode": "C4",
        "fullProductName": "Streptococcus Pneumoniae Vaccine II"
      },
      "lastUpdate": null
    }
    ];
    defer.resolve(
      {
        content: stockCardSummaries
      }
    );

    stockCardSummariesService.getStockCardSummaries.andReturn(defer.promise);

    vm.selectedFacility = facility;
    vm.selectedProgram = programs[0];

    vm.getStockSummaries();
    rootScope.$apply();

    expect(stockCardSummariesService.getStockCardSummaries)
      .toHaveBeenCalledWith(vm.selectedProgram.id, vm.selectedFacility.id);
    expect(vm.stockCardSummaries).toEqual(stockCardSummaries);
  });
});
