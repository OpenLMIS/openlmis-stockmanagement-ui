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
   * @name stock-adjustment-creation.controller:StockAdjustmentCreationController
   *
   * @description
   * Controller for managing stock adjustment creation.
   */
  angular
    .module('stock-adjustment-creation')
    .controller('StockAdjustmentCreationController', controller);

  controller.$inject =
    ['$scope', '$state', '$stateParams', '$filter', 'confirmDiscardService', 'program', 'facility',
     'stockCardSummaries', 'reasons', 'confirmService', 'messageService',
     'stockAdjustmentCreationService', 'notificationService', 'authorizationService'];

  function controller($scope, $state, $stateParams, $filter, confirmDiscardService, program,
                      facility, stockCardSummaries, reasons, confirmService, messageService,
                      stockAdjustmentCreationService, notificationService, authorizationService) {
    var vm = this;

    /**
     * @ngdoc method
     * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name search
     *
     * @description
     * It searches from the total line items with given keyword. If keyword is empty then all line
     * items will be shown.
     */
    vm.search = function () {
      vm.displayItems = stockAdjustmentCreationService.search(vm.keyword, vm.addedLineItems);

      $stateParams.addedLineItems = vm.addedLineItems;
      $stateParams.displayItems = vm.displayItems;
      $stateParams.keyword = vm.keyword;
      $stateParams.page = getPageNumber();
      $state.go($state.current.name, $stateParams, {reload: true, notify: false});
    };

    /**
     * @ngdoc method
     * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name addProduct
     *
     * @description
     * Add a product for stock adjustment.
     */
    vm.addProduct = function () {
      var occurredDate = new Date();
      occurredDate.setFullYear(vm.selectedOccurredDate.getFullYear());
      occurredDate.setMonth(vm.selectedOccurredDate.getMonth());
      occurredDate.setDate(vm.selectedOccurredDate.getDate());

      var reasonFreeText = vm.selectedReason.isFreeTextAllowed ? vm.reasonFreeText : null;

      vm.addedLineItems.unshift(angular.merge({
        occurredDate: occurredDate,
        reason: vm.selectedReason,
        reasonFreeText: reasonFreeText
      }, vm.selectedStockCardSummary));

      vm.search();
    };

    /**
     * @ngdoc method
     * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name remove
     *
     * @description
     * Remove a line item from added products.
     *
     * @param {Object} lineItem line item to be removed.
     */
    vm.remove = function (lineItem) {
      var index = vm.addedLineItems.indexOf(lineItem);
      vm.addedLineItems.splice(index, 1);

      vm.search();
    };

    /**
     * @ngdoc method
     * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name removeDisplayItems
     *
     * @description
     * Remove all displayed line items.
     */
    vm.removeDisplayItems = function () {
      confirmService.confirmDestroy('stockAdjustmentCreation.clearAll',
        'stockAdjustmentCreation.clear')
        .then(function () {
          vm.addedLineItems = _.difference(vm.addedLineItems, vm.displayItems);
          vm.displayItems = [];
        });
    };

    /**
     * @ngdoc method
     * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name validate
     *
     * @description
     * Validate line item quantity.
     *
     * @param {Object} lineItem line item to be validated.
     *
     */
    vm.validate = function (lineItem) {
      if (lineItem.quantity >= 1) {
        lineItem.quantityInvalid = '';
      } else {
        lineItem.quantityInvalid = messageService.get('stockAdjustmentCreation.positiveInteger');
      }
    };

    /**
     * @ngdoc property
     * @propertyOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name hasNoErrors
     * @type {Boolean}
     *
     * @description
     * Holds currently all added items has no errors:
     *  false - has some errors
     *  true - has no errors
     */
    vm.hasNoErrors = true;

    /**
     * @ngdoc method
     * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name validateAllAddedItems
     *
     * @description
     * Validate all added line item quantity and SOH.
     *
     */
    vm.validateAllAddedItems = function () {
      _.forEach(vm.addedLineItems, function (item) {
        vm.validate(item);
      });

      var sameOrderableGroups = _.groupBy(vm.addedLineItems, function (item) {
        return item.orderable.id
      });

      _.forEach(sameOrderableGroups, function (group) {
        var hasDebit = _.some(group, function (item) {
          return item.reason.reasonType === 'DEBIT';
        });
        if (hasDebit) {
          validateDebitQuantity(group);
        }
      });

      vm.hasNoErrors = _.all(vm.addedLineItems, function (item) {
        return !item.quantityInvalid;
      });
    };

    function validateDebitQuantity(itemsToValidate) {
      var items = _.sortBy(itemsToValidate, function (item) {
        return item.occurredDate;
      });
      var previousSoh = items[0].stockOnHand ? items[0].stockOnHand : 0;
      _.forEach(items, function (item) {
        item.stockOnHand = previousSoh;
        if (item.reason.reasonType === 'CREDIT') {
          previousSoh += item.quantity;
        } else if (item.reason.reasonType === 'DEBIT') {
          previousSoh -= item.quantity;
        }

        if (previousSoh < 0) {
          item.quantityInvalid =
            messageService.get('stockAdjustmentCreation.sohCanNotBeNegative');
        }
      });
    }

    /**
     * @ngdoc method
     * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name reorderItems
     *
     * @description
     * Reorder items when items with debit reason would cause negative SOH.
     *
     */
    vm.reorderItems = function () {
      var sorted = $filter('orderBy')(vm.addedLineItems, ['orderable.productCode', '-occurredDate']);

      vm.displayItems = _.chain(sorted).groupBy(function (item) {
        return item.orderable.id
      }).sortBy(function (group) {
        return _.every(group, function (item) {
          return item.quantityInvalid !== messageService.get(
              'stockAdjustmentCreation.sohCanNotBeNegative');
        });
      }).flatten(true).value();

    };

    /**
     * @ngdoc method
     * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
     * @name submit
     *
     * @description
     * Submit all added items.
     *
     */
    vm.submit = function () {
      vm.validateAllAddedItems();

      if (vm.hasNoErrors) {
        var confirmMessage = messageService.get('stockAdjustmentCreation.confirmAdjustment', {
          username: authorizationService.getUser().username,
          number: vm.addedLineItems.length
        });

        confirmService.confirm(confirmMessage, 'stockAdjustmentCreation.confirm').then(function () {
          stockAdjustmentCreationService.submitAdjustments(program.id, facility.id,
                                                           vm.addedLineItems)
            .then(function () {
              notificationService.success('stockAdjustmentCreation.submitted');
              $state.go('openlmis.stockmanagement.stockCardSummaries', {
                programId: program.id,
                facilityId: facility.id,
                program: program,
                facility: facility
              });
            }, function () {
              notificationService.error('stockAdjustmentCreation.submitFailed');
            });
        });
      } else {
        vm.keyword = null;
        vm.reorderItems();
      }
    };

    function onInit() {
      $state.current.label = messageService.get('stockAdjustmentCreation.title', {
        'facilityCode': facility.code,
        'facilityName': facility.name,
        'program': program.name
      });
      vm.maxDate = new Date();
      vm.selectedOccurredDate = vm.maxDate;

      vm.program = program;
      vm.facility = facility;
      vm.reasons = reasons;
      vm.stockCardSummaries = stockCardSummaries;

      vm.addedLineItems = $stateParams.addedLineItems || [];
      vm.displayItems = $stateParams.displayItems || [];
      vm.keyword = $stateParams.keyword;

      $stateParams.page = getPageNumber();

      $stateParams.program = program;
      $stateParams.facility = facility;
      $stateParams.reasons = reasons;
      $stateParams.stockCardSummaries = stockCardSummaries;

      $scope.needToConfirm = true;
      confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');

      $scope.$on('$stateChangeStart', function () {
        angular.element('.popover').popover('destroy');
      });
    }

    function getPageNumber() {
      var totalPages = Math.ceil(vm.displayItems.length / parseInt($stateParams.size));
      var pageNumber = parseInt($state.params.page || 0);
      if (pageNumber > totalPages - 1) {
        return totalPages > 0 ? totalPages - 1 : 0;
      }
      return pageNumber;
    }

    onInit();
  }
})();
