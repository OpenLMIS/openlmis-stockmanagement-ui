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
    ['$scope', '$state', '$stateParams', 'addProductsModalService',
     'confirmService', 'physicalInventoryDraftService', 'notificationService',
     'loadingModalService', 'chooseDateModalService', 'program', 'facility', 'draft',
     'displayLineItems'];

  function controller($scope, $state, $stateParams, addProductsModalService,
                      confirmService, physicalInventoryDraftService, notificationService,
                      loadingModalService, chooseDateModalService, program, facility, draft,
                      displayLineItems) {
    var vm = this;
    vm.stateParams = $stateParams;

    /**
     * @ngdoc property
     * @propertyOf physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name displayLineItems
     * @type {Array}
     *
     * @description
     * Holds current display physical inventory draft line items into.
     */
    vm.displayLineItems = displayLineItems;

    /**
     * @ngdoc property
     * @propertyOf physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name items
     * @type {Array}
     *
     * @description
     * Holds current page of display line items.
     */
    vm.items = undefined;

    vm.updateProgress = function () {
      vm.itemsWithQuantity = _.filter(vm.displayLineItems, function (lineItem) {
        return lineItem.quantity != null && lineItem.quantity != -1;
      });
    };

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
    vm.keyword = $stateParams.keyword;

    /**
     * @ngdoc method
     * @methodOf physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name addProducts
     *
     * @description
     * Pops up a modal for users to add products for physical inventory.
     */
    vm.addProducts = function () {
      var notYetAddedItems = _.difference(draft.lineItems, vm.displayLineItems);
      addProductsModalService.show(notYetAddedItems).then(function () {
        var params = {
          program: program,
          programId: program.id,
          facility: facility,
          draft: draft
        };
        $state.go($state.current.name, params, {reload: true});
      });
    };

    /**
     * @ngdoc method
     * @methodOf physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name search
     *
     * @description
     * It searches from the total line items with given keyword. If keyword is empty then all line
     * items will be shown.
     */
    vm.search = function () {
      var params = {
        page: 0,
        keyword: vm.keyword,
        program: program,
        programId: program.id,
        facility: facility,
        draft: draft
      };
      $state.go($state.current.name, params, {reload: true});
    };

    /**
     * @ngdoc method
     * @methodOf physical-inventory-draft.controller:PhysicalInventoryDraftController
     * @name saveDraft
     *
     * @description
     * Save physical inventory draft.
     */
    vm.saveDraft = function () {
      return physicalInventoryDraftService.saveDraft(draft).then(function () {
        notificationService.success('msg.stockmanagement.physicalInventory.draft.saved');
      }, function () {
        notificationService.error('msg.stockmanagement.physicalInventory.draft.saveFailed');
      });
    };

    /**
     * @ngdoc method
     * @methodOf physical-inventory-draft.controller:PhysicalInventoryDraftController
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
            notificationService.success('msg.stockmanagement.physicalInventory.submitted');
            $state.go('stockmanagement.stockCardSummaries');
          }, function () {
            notificationService.error('msg.stockmanagement.physicalInventory.submitFailed');
          });
        });
      }
    };

    function validate() {
      var anyError = false;
      displayLineItems.forEach(function (item) {
        var isQuantityMissing = (_.isNull(item.quantity) || _.isUndefined(item.quantity));
        item.quantityMissingError = isQuantityMissing;
        if (isQuantityMissing) {
          anyError = true;
        }
      });
      return anyError;
    }

    var isConfirmQuit = false;

    function onInit() {
      vm.updateProgress();
      window.onbeforeunload = function () {
        // According to the document of https://www.chromestatus.com/feature/5349061406228480,
        // we can't custom messages in onbeforeunload dialogs now.
        return '';
      };
      $scope.$on('$stateChangeStart', function (event, toState) {
        if (toState.name !== $state.current.name && toState.name !== 'auth.login'
            && !isConfirmQuit) {
          event.preventDefault();
          loadingModalService.close();
          confirmService.confirm('msg.stockmanagement.discardDraft').then(function () {
            isConfirmQuit = true;
            window.onbeforeunload = null;
            $state.go(toState.name);
          });
        }
      });
    }

    onInit();
  }
})();
