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
   * @name stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
   *
   * @description
   * Controller for managing physical inventory draft.
   */
  angular
    .module('stock-physical-inventory-draft')
    .controller('PhysicalInventoryDraftController', controller);

  controller.$inject =
    ['$scope', '$state', '$stateParams', 'addProductsModalService', 'messageService',
      'physicalInventoryDraftService', 'notificationService', 'confirmDiscardService',
      'chooseDateModalService', 'program', 'facility', 'draft', 'displayLineItemsGroup'];

  function controller($scope, $state, $stateParams, addProductsModalService, messageService,
                      physicalInventoryDraftService, notificationService, confirmDiscardService,
                      chooseDateModalService, program, facility, draft, displayLineItemsGroup) {
    var vm = this;
    vm.stateParams = $stateParams;

    /**
     * @ngdoc property
     * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name displayLineItemsGroup
     * @type {Array}
     *
     * @description
     * Holds current display physical inventory draft line items grouped by orderable id.
     */
    vm.displayLineItemsGroup = displayLineItemsGroup;

    vm.updateProgress = function () {
      vm.itemsWithQuantity = _.filter(vm.displayLineItemsGroup, function (lineItems) {
        return _.every(lineItems, function (lineItem) {
          return !isEmpty(lineItem.quantity);
        });
      });
    };

    /**
     * @ngdoc property
     * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name program
     * @type {Object}
     *
     * @description
     * Holds current program info.
     */
    vm.program = program;

    /**
     * @ngdoc property
     * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name facility
     * @type {Object}
     *
     * @description
     * Holds home facility info.
     */
    vm.facility = facility;

    /**
     * @ngdoc property
     * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name keyword
     * @type {String}
     *
     * @description
     * Holds keywords for searching.
     */
    vm.keyword = $stateParams.keyword;

    /**
     * @ngdoc method
     * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name addProducts
     *
     * @description
     * Pops up a modal for users to add products for physical inventory.
     */
    vm.addProducts = function () {
      var notYetAddedItems = _.chain(draft.lineItems)
        .difference(_.flatten(vm.displayLineItemsGroup))
        .value();

      addProductsModalService.show(notYetAddedItems, vm.hasLot).then(function () {
        $stateParams.isAddProduct = true;

        //Only reload current state and avoid reloading parent state
        $state.go($state.current.name, $stateParams, {reload: $state.current.name});
      });
    };

    /**
     * @ngdoc method
     * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name calculate
     *
     * @description
     * Aggregate values of provided field for a group of line items.
     *
     * @param {Object} lineItems line items to be calculate.
     * @param {String} field     property name of line items to be aggregate.
     */
    vm.calculate = function (lineItems, field) {
      var allEmpty = _.every(lineItems, function (lineItem) {
        return isEmpty(lineItem[field]);
      });
      if (allEmpty) return undefined;

      return _.chain(lineItems).map(function (lineItem) {
        return lineItem[field];
      }).compact().reduce(function (memo, num) {
        return parseInt(num) + memo;
      }, 0).value();
    };

    /**
     * @ngdoc method
     * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name search
     *
     * @description
     * It searches from the total line items with given keyword. If keyword is empty then all line
     * items will be shown.
     */
    vm.search = function () {
      $stateParams.page = 0;
      $stateParams.keyword = vm.keyword;
      $stateParams.draft = draft;

      //Only reload current state and avoid reloading parent state
      $state.go($state.current.name, $stateParams, {reload: $state.current.name});
    };

    /**
     * @ngdoc method
     * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name saveDraft
     *
     * @description
     * Save physical inventory draft.
     */
    vm.saveDraft = function () {
      return physicalInventoryDraftService.saveDraft(draft).then(function () {
        notificationService.success('stockPhysicalInventoryDraft.saved');
        resetWatchItems();

        $stateParams.draft = draft;
        $stateParams.isAddProduct = false;

        //Reload parent state and current state to keep data consistency.
        $state.go($state.current.name, $stateParams, {reload: true});
      }, function () {
        notificationService.error('stockPhysicalInventoryDraft.saveFailed');
      });
    };

    /**
     * @ngdoc method
     * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name submit
     *
     * @description
     * Submit physical inventory.
     */
    vm.submit = function () {
      var anyError = validate();
      if (!anyError) {
        chooseDateModalService.show().then(function (resolvedData) {
          draft.occurredDate = resolvedData.occurredDate;
          draft.signature = resolvedData.signature;

          physicalInventoryDraftService.submitPhysicalInventory(draft).then(function () {
            notificationService.success('stockPhysicalInventoryDraft.submitted');
            $state.go('openlmis.stockmanagement.stockCardSummaries', {
              programId: program.id,
              facilityId: facility.id
            });
          }, function () {
            notificationService.error('stockPhysicalInventoryDraft.submitFailed');
          });
        });
      }
    };

    function isEmpty(value) {
      return value === '' || value === undefined || value === null;
    }

    function validate() {
      var anyError = false;

      _.chain(displayLineItemsGroup).flatten().each(function (item) {
        var isQuantityMissing = isEmpty(item.quantity);
        item.quantityMissingError = isQuantityMissing;
        if (isQuantityMissing) {
          anyError = true;
        }
      });
      return anyError;
    }

    var watchItems = [];

    function resetWatchItems() {
      $scope.needToConfirm = false;
      watchItems = angular.copy(vm.displayLineItemsGroup);
    }

    function onInit() {
      $state.current.label = messageService.get('stockPhysicalInventoryDraft.title', {
        'facilityCode': facility.code,
        'facilityName': facility.name,
        'program': program.name
      });

      $stateParams.program = program;
      $stateParams.programId = program.id;
      $stateParams.facility = facility;
      $stateParams.draft = draft;

      vm.hasLot = _.any(draft.lineItems, function (item) {
        return item.lot;
      });

      vm.updateProgress();
      resetWatchItems();
      $scope.$watch(function () {
        return vm.displayLineItemsGroup;
      }, function (newValue) {
        $scope.needToConfirm = ($stateParams.isAddProduct || !angular.equals(newValue, watchItems));
      }, true);
      confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');
    }

    onInit();
  }
})();
