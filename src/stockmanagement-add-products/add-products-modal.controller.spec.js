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

  var vm;

  beforeEach(function () {
    module('stockmanagement-add-products');

    inject(function (_$controller_) {
      vm = _$controller_('AddProductsModalController', {
        items: []
      });
    });
  });

  it("should NOT add if select box is empty", function () {
    //given
    vm.selectedItem = undefined;//select box is empty

    //when
    vm.addOneProduct();

    //then
    expect(vm.addedItems).toEqual([]);
  });

  it("should NOT add twice if selected item already added", function () {
    //given
    var addedItem = {};
    vm.addedItems = [addedItem];
    vm.selectedItem = addedItem;

    //when
    vm.addOneProduct();

    //then
    expect(vm.addedItems).toEqual([addedItem]);
  });

  it("should add if selected item not added yet", function () {
    //given
    var item = {};
    vm.selectedItem = item;

    //when
    vm.addOneProduct();

    //then
    expect(vm.addedItems).toEqual([item]);
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

});
