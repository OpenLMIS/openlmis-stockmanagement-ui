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
   * @name stockmanagement-add-products.controller:AddProductsModalController
   *
   * @description
   * Manages Add Products Modal.
   */
  angular
    .module('stockmanagement-add-products')
    .controller('AddProductsModalController', controller);

  controller.$inject = ['items', 'messageService', 'modalDeferred'];

  function controller(items, messageService, modalDeferred) {
    var vm = this;

    /**
     * @ngdoc property
     * @propertyOf stockmanagement-add-products.controller:AddProductsModalController
     * @name items
     * @type {Array}
     *
     * @description
     * All products available for users to choose from.
     */
    vm.items = items;

    /**
     * @ngdoc property
     * @propertyOf stockmanagement-add-products.controller:AddProductsModalController
     * @name addedItems
     * @type {Array}
     *
     * @description
     * Products that users have chosen in this modal.
     */
    vm.addedItems = [];

    /**
     * @ngdoc method
     * @methodOf stockmanagement-add-products.controller:AddProductsModalController
     * @name addOneProduct
     *
     * @description
     * Add the currently selected product into the table beneath it for users to do further actions.
     */
    vm.addOneProduct = function () {
      var notAlreadyAdded = vm.selectedItem && !_.contains(vm.addedItems, vm.selectedItem);
      if (notAlreadyAdded) {
        vm.addedItems.push(vm.selectedItem);
      }
    };

    /**
     * @ngdoc method
     * @methodOf stockmanagement-add-products.controller:AddProductsModalController
     * @name removeAddedProduct
     *
     * @description
     * Removes an already added product and reset its quantity value.
     */
    vm.removeAddedProduct = function (item) {
      item.quantity = undefined;
      item.quantityMissingError = undefined;
      vm.addedItems = _.without(vm.addedItems, item);
    };

    /**
     * @ngdoc method
     * @methodOf stockmanagement-add-products.controller:AddProductsModalController
     * @name validate
     *
     * @description
     * Validate if quantity is filled in by user.
     */
    vm.validate = function (item) {
      if (!item.quantity) {
        item.quantityMissingError = messageService.get("error.required");
      } else {
        item.quantityMissingError = undefined;
      }
    };

    /**
     * @ngdoc method
     * @methodOf stockmanagement-add-products.controller:AddProductsModalController
     * @name confirm
     *
     * @description
     * Confirm added products and close modal. Will not close modal if any quanity not filled in.
     */
    vm.confirm = function () {
      //some items may not have been validated yet, so validate all here.
      _.forEach(vm.addedItems, function (item) {
        vm.validate(item);
      });

      var noErrors = _.all(vm.addedItems, function (item) {
        return !item.quantityMissingError;
      });
      if (noErrors) {
        modalDeferred.resolve();
      }
    };

    modalDeferred.promise.catch(function () {
      _.forEach(vm.addedItems, function (item) {
        item.quantity = undefined;
        item.quantityMissingError = undefined;
      });
    });

  }
})();
