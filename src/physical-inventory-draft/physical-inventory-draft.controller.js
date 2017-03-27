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

  controller.$inject = ['$controller', '$filter', '$state', 'stateParams', 'program', 'facility', 'draft', 'searchResult'];

  function controller($controller, $filter, $state, stateParams, program, facility, draft, searchResult) {
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

    $controller('BasePaginationController', {
      vm: vm,
      items: vm.lineItems,
      totalItems: vm.lineItems.length,
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
     * It searches from the total line items with given keyword. If keyword is empty then all line items will be shown.
     *
     */
    vm.search = function () {
      vm.keyword = vm.keyword.trim();
      if (vm.keyword.length > 0) {
        vm.stateParams.searchResult = draft.lineItems.filter(function (item) {
          var keyword = vm.keyword.toLowerCase();
          return item.orderable.productCode.toLowerCase().contains(keyword) ||
            item.orderable.fullProductName.toLowerCase().contains(keyword) ||
            (item.orderable.dispensable && item.orderable.dispensable.dispensingUnit.toLowerCase().contains(keyword)) ||
            (item.stockOnHand && item.stockOnHand.toString().toLowerCase().contains(keyword)) ||
            (item.quantity && item.quantity != -1 && item.quantity.toString().toLowerCase().contains(keyword))
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
