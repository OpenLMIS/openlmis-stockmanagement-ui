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
   * @name physical-inventory-draft.controller:PhysicalInventoryDraftController
   *
   * @description
   * Controller for managing physical inventory draft.
   */
  angular
    .module('physical-inventory-draft')
    .controller('PhysicalInventoryDraftController', controller);

  controller.$inject =
    ['$controller', '$filter', '$state', 'stateParams', 'program', 'facility', 'draft',
      'searchResult'];

  function controller($controller, $filter, $state, stateParams, program, facility, draft,
                      searchResult) {
    var vm = this;

    vm.lineItems = $filter('orderBy')(searchResult || draft.lineItems, 'orderable.productCode');

    /**
     * @ngdoc property
     * @propertyOf physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name displayLineItems
     * @type {Array}
     *
     * @description
     * Holds current display physical inventory draft line items into.
     */
    vm.displayLineItems = _.filter(vm.lineItems, function (lineItem) {
      return lineItem.quantity != null;
    });

    /**
     * @ngdoc property
     * @propertyOf physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name itemsWithQuantity
     * @type {Array}
     *
     * @description
     * Holds line items with quantity not null.
     */
    vm.itemsWithQuantity = _.filter(vm.displayLineItems, function (lineItem) {
      return lineItem.quantity != null && lineItem.quantity != -1;
    });

    /**
     * @ngdoc method
     * @methodOf physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name getPercentage
     * @type {String}
     *
     * @description
     * Holds complete percentage of physical inventory.
     */
    vm.getPercentage = function () {
      if (vm.displayLineItems.length == 0) {
        return $filter('percentage')(0);
      }
      return $filter('percentage')(vm.itemsWithQuantity.length / vm.displayLineItems.length);
    };

    vm.updateProgress = function () {
      vm.itemsWithQuantity = _.filter(vm.displayLineItems, function (lineItem) {
        return lineItem.quantity != null && lineItem.quantity != -1;
      });
    };

    $controller('BasePaginationController', {
      vm: vm,
      items: vm.displayLineItems,
      totalItems: vm.displayLineItems.length,
      stateParams: stateParams,
      externalPagination: false,
      itemValidator: undefined
    });

    /**
     * @ngdoc property
     * @propertyOf physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name program
     * @type {Object}
     *
     * @description
     * Holds current program info.
     */
    vm.program = program;

    /**
     * @ngdoc property
     * @propertyOf physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name facility
     * @type {Object}
     *
     * @description
     * Holds home facility info.
     */
    vm.facility = facility;

    /**
     * @ngdoc property
     * @propertyOf physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name keyword
     * @type {String}
     *
     * @description
     * Holds keywords for searching.
     */
    vm.keyword = stateParams.keyword;

    /**
     * @ngdoc method
     * @methodOf physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name search
     *
     * @description
     * It searches from the total line items with given keyword. If keyword is empty then all line
     *     items will be shown.
     *
     */
    vm.search = function () {
      vm.keyword = vm.keyword.trim();
      if (vm.keyword.length > 0) {
        vm.stateParams.searchResult = draft.lineItems.filter(function (item) {
          var searchableFields = [
            item.orderable.productCode, item.orderable.fullProductName,
            item.orderable.dispensable ? item.orderable.dispensable.dispensingUnit : "",
            item.stockOnHand ? item.stockOnHand.toString() : "",
            item.quantity && item.quantity != -1 ? item.quantity.toString() : ""
          ];
          return _.any(searchableFields, function (field) {
            return field.toLowerCase().contains(vm.keyword.toLowerCase());
          });
        });
      } else {
        vm.stateParams.searchResult = undefined;
      }

      vm.stateParams.page = 0;
      vm.stateParams.keyword = vm.keyword;
      $state.go($state.current.name, vm.stateParams, {reload: true});
    }
  }
})();
