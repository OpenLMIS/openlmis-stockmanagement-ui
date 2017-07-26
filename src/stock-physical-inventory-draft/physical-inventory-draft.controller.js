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

  controller.$inject = ['$scope', '$state', '$stateParams', 'addProductsModalService',
    'messageService', 'physicalInventoryDraftFactory', 'notificationService',
    'confirmDiscardService', 'chooseDateModalService', 'program', 'facility', 'draft',
    'displayLineItemsGroup', 'confirmService', 'physicalInventoryDraftService', 'MAX_INTEGER_VALUE',
    'VVM_STATUS', 'reasons', 'stockReasonsCalculations'
];

  function controller($scope, $state, $stateParams, addProductsModalService, messageService,
                      physicalInventoryDraftFactory, notificationService, confirmDiscardService,
                      chooseDateModalService, program, facility, draft, displayLineItemsGroup,
                      confirmService, physicalInventoryDraftService, MAX_INTEGER_VALUE, VVM_STATUS,
                      reasons, stockReasonsCalculations) {
    var vm = this;

    vm.validateStockAdjustments = validateStockAdjustments;
    vm.quantityChanged = quantityChanged;

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
     * @ngdoc property
     * @propertyOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name vvmStatuses
     * @type {Object}
     *
     * @description
     * Holds list of VVM statuses.
     */
    vm.vvmStatuses = VVM_STATUS;

    /**
     * @ngdoc method
     * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name getStatusDisplay
     *
     * @description
     * Returns VVM status display.
     *
     * @param  {String} status VVM status
     * @return {String}        VVM status display name
     */
    vm.getStatusDisplay = function(status) {
        return messageService.get(VVM_STATUS.$getDisplayName(status));
    };

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
      return physicalInventoryDraftFactory.saveDraft(draft).then(function () {
        notificationService.success('stockPhysicalInventoryDraft.saved');
        resetWatchItems();

        draft.isStarter = false;
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
     * @name delete
     *
     * @description
     * Delete physical inventory draft.
     */
    vm.delete = function () {
      confirmService.confirmDestroy('stockPhysicalInventoryDraft.deleteDraft', 'stockPhysicalInventoryDraft.delete')
        .then(function () {
          physicalInventoryDraftService.delete(program.id, facility.id).then(function () {
            $scope.needToConfirm = false;
            $stateParams.draft = undefined;
            $state.go('openlmis.stockmanagement.physicalInventory', $stateParams, {reload: true});
          });
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
      $scope.$broadcast('openlmis-form-submit');
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

    /**
     * @ngdoc method
     * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name validateQuantity
     *
     * @description
     * Validate line item quantity and returns self.
     *
     * @param {Object} lineItem line item to be validated.
     */
    vm.validateQuantity = function (lineItem) {
      if (lineItem.quantity > MAX_INTEGER_VALUE) {
        lineItem.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
      } else if (isEmpty(lineItem.quantity)) {
        lineItem.quantityInvalid = messageService.get('stockPhysicalInventoryDraft.required');
      } else {
        lineItem.quantityInvalid = false;
      }
      return lineItem.quantityInvalid;
    };

    function isEmpty(value) {
      return value === '' || value === undefined || value === null;
    }

    function validate() {
      var anyError = false;

      _.chain(displayLineItemsGroup).flatten().each(function (item) {
        anyError = vm.validateQuantity(item) || anyError;
        anyError = validateStockAdjustments(item) || anyError;
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

      vm.reasons = reasons;
      vm.stateParams = $stateParams;
      $stateParams.program = program;
      $stateParams.programId = program.id;
      $stateParams.facility = facility;
      $stateParams.draft = draft;

      vm.isDraftSaved = !draft.isStarter;
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

    /**
     * @ngdoc method
     * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name validateStockAdjustments
     *
     * @description
     * Validates the list of stock adjustments of the given line item.
     *
     * @param   {Object}    lineItem    the lineItem containing stock adjustments
     */
    function validateStockAdjustments(lineItem) {
      if (stockReasonsCalculations.calculateUnaccounted(lineItem, lineItem.stockAdjustments)) {
        lineItem.stockAdjustmentsInvalid = 'stockPhysicalInventoryDraft.lineItemHasUnaccountedValues';
      } else {
        lineItem.stockAdjustmentsInvalid = false;
      }

      return lineItem.stockAdjustmentsInvalid;
    }

    /**
     * @ngdoc method
     * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name quantityChanged
     *
     * @description
     * Callback method for quantity change. It will update progress and fire up validations.
     *
     * @param   {Object}    lineItem    the lineItem containing quantity
     */
    function quantityChanged(lineItem) {
      vm.updateProgress();
      vm.validateQuantity(lineItem);
      vm.validateStockAdjustments(lineItem);
    }
  }
})();
