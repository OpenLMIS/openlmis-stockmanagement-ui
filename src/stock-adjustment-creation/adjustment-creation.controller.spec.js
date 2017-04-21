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

describe("StockAdjustmentCreationController", function () {

  var vm, q, rootScope, state, stateParams, facility, program, confirmService,
    stockAdjustmentCreationService;

  beforeEach(function () {

    module('stock-adjustment-creation');

    inject(
      function (_messageService_, _confirmDiscardService_, _confirmService_,
                _stockAdjustmentCreationService_, $controller, $q, $rootScope, _$stateParams_) {
        q = $q;
        rootScope = $rootScope;
        state = jasmine.createSpyObj('$state', ['go']);
        state.current = {name: '/a/b'};
        state.params = {page: 0};
        stateParams = _$stateParams_;

        program = {name: 'HIV', id: '1'};
        facility = {id: "10134", name: "National Warehouse"};
        var stockCardSummaries = [{
          orderable: {fullProductName: "Implanon", id: "a"},
          stockOnHand: 2
        }];
        var reasons = [{id: "r1", name: "clinic return"}];

        confirmService = _confirmService_;
        stockAdjustmentCreationService = _stockAdjustmentCreationService_;

        vm = $controller('StockAdjustmentCreationController', {
          $scope: rootScope.$new(),
          $state: state,
          $stateParams: stateParams,
          confirmDiscardService: _confirmDiscardService_,
          program: program,
          facility: facility,
          stockCardSummaries: stockCardSummaries,
          reasons: reasons,
          confirmService: confirmService,
          messageService: _messageService_,
          stockAdjustmentCreationService: stockAdjustmentCreationService
        });
      });
  });

  it('should init page and size properly', function () {
    expect(stateParams.page).toEqual(0);
    expect(stateParams.size).toEqual('20');
  });

  describe('validate', function () {

    it('line item quantity is valid given positive integer', function () {
      var lineItem = {id: "1", quantity: 1};
      vm.validate(lineItem);

      expect(lineItem.quantityInvalid).toEqual('')
    });

    it('line item quantity is invalid given 0', function () {
      var lineItem = {id: "1", quantity: 0};
      vm.validate(lineItem);

      expect(lineItem.quantityInvalid).toEqual('stockAdjustmentCreation.positiveInteger')
    });

    it('line item quantity is invalid given -1', function () {
      var lineItem = {id: "1", quantity: -1};
      vm.validate(lineItem);

      expect(lineItem.quantityInvalid).toEqual('stockAdjustmentCreation.positiveInteger')
    });
  });

  it('should remove all line items', function () {
    spyOn(confirmService, 'confirmDestroy');
    var deferred = q.defer();
    deferred.resolve();
    confirmService.confirmDestroy.andReturn(deferred.promise);

    vm.removeAll();
    rootScope.$apply();

    expect(confirmService.confirmDestroy).toHaveBeenCalledWith('stockAdjustmentCreation.clearAll',
      'stockAdjustmentCreation.clear');
    expect(vm.addedLineItems).toEqual([]);
    expect(vm.displayItems).toEqual([]);
  });

  it('should remove one line item from added line items', function () {
    var lineItem1 = {id: "1", quantity: 0};
    var lineItem2 = {id: "2", quantity: 1};
    vm.addedLineItems = [lineItem1, lineItem2];

    vm.remove(lineItem1);

    expect(vm.addedLineItems).toEqual([lineItem2]);
  });

  it('should add one line item to added line items', function () {
    vm.occurredDate = new Date('Fri Apr 1 2016 11:23:34 GMT+0800 (CST)');
    vm.stockCardSummary = {
      orderable: {fullProductName: 'Implanon', id: 'a', productCode: 'c1'},
      stockOnHand: 2
    };
    vm.reason = {id: 'r1', name: 'clinic return'};

    vm.addProduct();

    var addedLineItem = vm.addedLineItems[0];
    expect(addedLineItem.stockOnHand).toEqual(2);
    expect(addedLineItem.orderable.fullProductName).toEqual('Implanon');
    expect(addedLineItem.reason).toEqual(vm.reason);
    expect(addedLineItem.occurredDate.getFullYear()).toEqual(2016);
    expect(addedLineItem.occurredDate.getDate()).toEqual(1);
  });

  it('should search from added line items', function () {
    var lineItem1 = {id: "1", quantity: 0};
    var lineItem2 = {id: "2", quantity: 1};
    vm.addedLineItems = [lineItem1, lineItem2];

    spyOn(stockAdjustmentCreationService, 'search');
    stockAdjustmentCreationService.search.andReturn([lineItem1]);
    var params = {
      size: '20',
      page: 0,
      program: program,
      facility: facility,
      reasons: [{id: 'r1', name: 'clinic return'}],
      stockCardSummaries: [{
        orderable: {fullProductName: 'Implanon', id: 'a'},
        stockOnHand: 2
      }],
      addedLineItems: [lineItem1, lineItem2],
      displayItems: [lineItem1],
      keyword: undefined
    };

    vm.search();

    expect(vm.displayItems).toEqual([lineItem1]);
    expect(state.go).toHaveBeenCalledWith('/a/b', params, {reload: true, notify: false})
  });
});
