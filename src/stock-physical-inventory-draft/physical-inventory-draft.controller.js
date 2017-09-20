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
    'messageService', 'physicalInventoryFactory', 'notificationService', 'alertService',
    'confirmDiscardService', 'chooseDateModalService', 'program', 'facility', 'draft',
    'displayLineItemsGroup', 'confirmService', 'physicalInventoryService', 'MAX_INTEGER_VALUE',
    'VVM_STATUS', 'reasons', 'stockReasonsCalculations', 'loadingModalService', '$window',
    'stockmanagementUrlFactory', 'accessTokenFactory'
];

  function controller($scope, $state, $stateParams, addProductsModalService, messageService,
                      physicalInventoryFactory, notificationService, alertService, confirmDiscardService,
                      chooseDateModalService, program, facility, draft, displayLineItemsGroup,
                      confirmService, physicalInventoryService, MAX_INTEGER_VALUE, VVM_STATUS,
                      reasons, stockReasonsCalculations, loadingModalService, $window,
                      stockmanagementUrlFactory, accessTokenFactory) {
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
      loadingModalService.open();
      return physicalInventoryFactory.saveDraft(draft).then(function () {
        notificationService.success('stockPhysicalInventoryDraft.saved');
        resetWatchItems();

        $stateParams.isAddProduct = false;

        //Reload parent state and current state to keep data consistency.
        $state.go($state.current.name, $stateParams, {reload: true});
      }, function () {
        loadingModalService.close();
        alertService.error('stockPhysicalInventoryDraft.saveFailed');
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
          loadingModalService.open();
          physicalInventoryService.delete(draft.id).then(function () {
            $scope.needToConfirm = false;
            $state.go('openlmis.stockmanagement.physicalInventory', $stateParams, {reload: true});
          })
          .catch(function(){
            loadingModalService.close();
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
      if(validate()){
        $scope.$broadcast('openlmis-form-submit');
        alertService.error('stockPhysicalInventoryDraft.submitInvalid');
      } else {
        chooseDateModalService.show().then(function (resolvedData) {
          loadingModalService.open();

          draft.occurredDate = resolvedData.occurredDate;
          draft.signature = resolvedData.signature;

          physicalInventoryService.submitPhysicalInventory(draft).then(function () {
            notificationService.success('stockPhysicalInventoryDraft.submitted');
            confirmService.confirm('stockPhysicalInventoryDraft.printModal.label',
                                   'stockPhysicalInventoryDraft.printModal.yes',
                                   'stockPhysicalInventoryDraft.printModal.no')
                .then(function () {
                    $window.open(accessTokenFactory.addAccessToken(getPrintUrl(draft.id)), '_blank');
                }).finally(function () {
                  $state.go('openlmis.stockmanagement.stockCardSummaries', {
                    program: program.id,
                    facility: facility.id
                  });
                });
          }, function () {
            loadingModalService.close();
            alertService.error('stockPhysicalInventoryDraft.submitFailed');
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
      $stateParams.program = undefined;
      $stateParams.facility = undefined;
      $stateParams.draft = undefined;

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
      var unaccountedValues = stockReasonsCalculations.calculateUnaccounted(lineItem, lineItem.stockAdjustments)
      if (unaccountedValues) {
        lineItem.stockAdjustmentsInvalid = messageService
          .get('stockPhysicalInventoryDraft.lineItemHasUnaccountedValues', {num: unaccountedValues});
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

    /**
     * @ngdoc method
     * @methodOf stock-physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name getPrintUrl
     *
     * @description
     * Prepares a print URL for the given physical inventory.
     *
     * @return {String} the prepared URL
     */
    function getPrintUrl(id) {
        return stockmanagementUrlFactory('/api/physicalInventories/' + id + '?format=pdf');
    }
  }
})();
