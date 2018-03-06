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

describe("AddProductsModalController", function () {

  var vm, deferred, $rootScope, scope, item1;

  beforeEach(function () {
    module('stock-add-products-modal');
    module('referencedata');

    inject(function (_$controller_, _messageService_, _$q_,
                     _$rootScope_, _orderableGroupService_) {
      $rootScope = _$rootScope_;
      deferred = _$q_.defer();

      scope = $rootScope.$new();
      spyOn(scope, '$broadcast').andCallThrough();

      item1 = {orderable: {id: 'O1'}, lot: {id: 'L1'}};
      vm = _$controller_('AddProductsModalController', {
        items: [item1],
        hasLot: true,
        messageService: _messageService_,
        modalDeferred: deferred,
        orderableGroupService: _orderableGroupService_,
        $scope: scope
      });
    });
  });

  it("should NOT add if select box is empty", function () {
    //given
    //do nothing here, to simulate that select box is empty

    //when
    vm.addOneProduct();

    //then
    expect(vm.addedItems).toEqual([]);
  });

  it("should NOT add twice if selected item already added", function () {
    //given
    vm.selectedOrderableGroup = [item1];
    vm.selectedLot = item1.lot;

    vm.addedItems = [item1];
    //when
    vm.addOneProduct();

    //then
    expect(vm.addedItems).toEqual([item1]);//only appear once, not twice
  });

  it("should add if selected item not added yet", function () {
    //given
    vm.selectedOrderableGroup = [item1];
    vm.selectedLot = item1.lot;

    vm.addedItems = [];

    //when
    vm.addOneProduct();

    //then
    expect(vm.addedItems).toEqual([item1]);
  });

  it("should remove added product and reset its quantity value", function () {
    //given
    var item = {quantity: 123};
    vm.addedItems = [item];

    //when
    vm.removeAddedProduct(item);

    //then
    expect(item.quantity).not.toBeDefined();
    expect(vm.addedItems).toEqual([]);
  });

  it("should reset all items' quantities and error messages when cancel", function () {
    //given
    var item1 = {quantity: 123, quantityInvalid: "blah"};
    var item2 = {quantity: 456};
    vm.addedItems = [item1, item2];

    //when
    deferred.reject();//pretend modal was closed by user
    $rootScope.$apply();

    //then
    expect(item1.quantity).not.toBeDefined();
    expect(item1.quantityInvalid).not.toBeDefined();

    expect(item2.quantity).not.toBeDefined();
  });

  it("should assign error message when quantity missing", function () {
    //given
    var item1 = {quantity: undefined};

    //when
    vm.validate(item1);

    //then
    expect(item1.quantityInvalid).toBeDefined();
  });

  it("should remove error message when quantity filled in", function () {
    //given
    var item1 = {quantityInvalid: "blah"};

    //when
    item1.quantity = 123;
    vm.validate(item1);

    //then
    expect(item1.quantityInvalid).not.toBeDefined();
  });

  it("should broadcast form submit when confirming", function(){
    vm.confirm();

    expect(scope.$broadcast).toHaveBeenCalledWith('openlmis-form-submit');
  });

  it("should confirm add products if all items have quantities", function () {
    //given
    var item1 = {quantity: 1};
    var item2 = {quantity: 2};
    vm.addedItems = [item1, item2];

    spyOn(deferred, "resolve");

    //when
    vm.confirm();

    //then
    expect(deferred.resolve).toHaveBeenCalled();
  });

  it("should NOT confirm add products if some items have no quantity", function () {
    //given
    var item1 = {quantity: 1};
    var item2 = {quantity: undefined};
    vm.addedItems = [item1, item2];

    spyOn(deferred, "resolve");

    //when
    vm.confirm();

    //then
    expect(deferred.resolve).not.toHaveBeenCalled();
  });

});
