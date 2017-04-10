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

describe("PhysicalInventoryDraftController", function () {

  var vm, q, rootScope, scope, state, stateParams, addProductsModalService, draftService,
    facility, program, draft, lineItem1, lineItem2, lineItem3;

  beforeEach(function () {

    module('physical-inventory-draft');

    inject(function (_$controller_, _$q_, _$rootScope_, _$filter_, _addProductsModalService_,
                     _physicalInventoryDraftService_) {
      q = _$q_;
      rootScope = _$rootScope_;
      scope = _$rootScope_.$new();
      state = jasmine.createSpyObj('$state', ['go']);
      state.current = {name: '/a/b'};

      addProductsModalService = _addProductsModalService_;
      spyOn(addProductsModalService, 'show');

      draftService = _physicalInventoryDraftService_;

      program = {name: 'HIV', id: '1'};
      facility = {
        id: "10134",
        name: "National Warehouse",
      };

      stateParams = {};

      lineItem1 = {quantity: 1, orderable: {productCode: 'C100', fullProductName: 'a'}};
      lineItem2 = {quantity: null, orderable: {productCode: 'C300', fullProductName: 'b'}};
      lineItem3 =
        {
          quantity: null,
          isAdded: true,
          orderable: {productCode: 'C200', fullProductName: 'c'}
        };
      draft = {lineItems: [lineItem1, lineItem2, lineItem3]};

      vm = _$controller_('PhysicalInventoryDraftController', {
        $filter: _$filter_,
        facility: facility,
        program: program,
        $state: state,
        $scope: scope,
        $stateParams: stateParams,
        displayLineItems: [lineItem1, lineItem3],
        draft: draft,
        addProductsModalService: addProductsModalService,
        draftService: draftService
      });
    });
  });

  it("should init displayLineItems and sort by product code properly", function () {
    expect(vm.displayLineItems).toEqual([lineItem1, lineItem3]);
  });

  it("should calculate percentage", function () {
    vm.displayLineItems = [1, 2];
    vm.itemsWithQuantity = [1];
    expect(vm.getPercentage()).toEqual('50%');

    vm.displayLineItems = [];
    expect(vm.getPercentage()).toEqual('0%');
  });

  it("should reload with page and keyword when search", function () {
    vm.keyword = '200';
    vm.search();

    var params = {
      page: 0,
      keyword: '200',
      program: program,
      programId: '1',
      facility: facility,
      draft: draft
    };

    expect(state.go).toHaveBeenCalledWith('/a/b', params, {reload: true})
  });

  it("should only pass items not added yet to add products modal", function () {
    var deferred = q.defer();
    deferred.resolve();
    addProductsModalService.show.andReturn(deferred.promise);

    vm.addProducts();
    expect(addProductsModalService.show).toHaveBeenCalledWith([lineItem2]);
  });

  it('should save draft', function () {
    spyOn(draftService, 'saveDraft');
    draftService.saveDraft.andReturn(q.defer().promise);
    rootScope.$apply();

    vm.saveDraft();
    expect(draftService.saveDraft).toHaveBeenCalledWith(draft);
  });

  it('should highlight empty quantities before submit', function () {
    vm.submit();
    expect(lineItem1.quantityMissingError).toBe(false);
    expect(lineItem3.quantityMissingError).toBe(true);
  });
});
