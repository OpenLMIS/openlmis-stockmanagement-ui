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

(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name stock-add-products-modal.controller:AddProductsModalController
     *
     * @description
     * Manages Add Products Modal.
     */
    angular
        .module('stock-add-products-modal')
        .controller('AddProductsModalController', controller);

    controller.$inject = ['availableItems', 'messageService', 'modalDeferred', 'orderableGroupService',
        '$scope', 'MAX_INTEGER_VALUE', 'hasPermissionToAddNewLot', 'selectedItems', 'alertService',
        'moment'];

    function controller(availableItems, messageService, modalDeferred, orderableGroupService,
                        $scope, MAX_INTEGER_VALUE, hasPermissionToAddNewLot, selectedItems, alertService,
                        moment) {
        var vm = this;

        vm.$onInit = onInit;
        vm.orderableSelectionChanged = orderableSelectionChanged;
        vm.addOneProduct = addOneProduct;
        vm.removeAddedProduct = removeAddedProduct;
        vm.validate = validate;
        vm.confirm = confirm;
        vm.lotChanged = lotChanged;
        vm.expirationDateChanged = expirationDateChanged;
        vm.newLotCodeChanged = newLotCodeChanged;

        /**
         * @ngdoc property
         * @propertyOf stock-add-products-modal.controller:AddProductsModalController
         * @name availableItems
         * @type {Array}
         *
         * @description
         * All products available for users to choose from.
         */
        vm.availableItems = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-add-products-modal.controller:AddProductsModalController
         * @name addedItems
         * @type {Array}
         *
         * @description
         * Indicates if any line item has lot. If all line items have not lot, page will not display
         *   any lot related information.
         */
        vm.addedItems = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-add-products-modal.controller:AddProductsModalController
         * @name selectedOrderableHasLots
         * @type {boolean}
         *
         * @description
         * True if selected orderable has lots defined.
         */
        vm.selectedOrderableHasLots = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-add-products-modal.controller:AddProductsModalController
         * @name newLot
         * @type {Object}
         *
         * @description
         * Holds new lot object.
         */
        vm.newLot = undefined;

        /**
         * @ngdoc property
         * @propertyOf stock-add-products-modal.controller:AddProductsModalController
         * @name hasPermissionToAddNewLot
         * @type {boolean}
         *
         * @description
         * True when user has permission to add new lots.
         */
        vm.hasPermissionToAddNewLot = undefined;

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name $onInit
         *
         * @description
         * Initialization method of the AddProductsModalController.
         */
        function onInit() {
            vm.orderableGroups = orderableGroupService.groupByOrderableId(availableItems);
            vm.availableItems = availableItems;
            vm.addedItems = [];
            vm.selectedOrderableHasLots = false;
            vm.hasPermissionToAddNewLot = hasPermissionToAddNewLot;
            vm.canAddNewLot = false;

            initiateNewLotObject();

            modalDeferred.promise.catch(function() {
                vm.addedItems.forEach(function(item) {
                    item.quantity = undefined;
                    item.quantityInvalid = undefined;
                });
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name orderableSelectionChanged
         *
         * @description
         * Reset form status and change content inside lots drop down list.
         */
        function orderableSelectionChanged() {
            //reset selected lot, so that lot field has no default value
            vm.selectedLot = null;
            vm.canAddNewLot = false;

            initiateNewLotObject();

            //same as above
            $scope.productForm.$setUntouched();
            //make form good as new, so errors won't persist
            $scope.productForm.$setPristine();

            vm.lots = orderableGroupService.lotsOf(vm.selectedOrderableGroup, vm.hasPermissionToAddNewLot);

            vm.selectedOrderableHasLots = vm.lots.length > 0;
        }

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name addOneProduct
         *
         * @description
         * Add the currently selected product into the table beneath it for users to do further actions.
         */
        function addOneProduct() {
            var selectedItem;

            if (vm.selectedOrderableGroup && vm.selectedOrderableGroup.length) {
                vm.newLot.tradeItemId = vm.selectedOrderableGroup[0].orderable.identifiers.tradeItem;
            }
            if (vm.newLot.lotCode) {
                selectedItem = orderableGroupService
                    .addItemWithNewLot(vm.newLot, vm.selectedOrderableGroup[0]);
            } else {
                selectedItem = orderableGroupService
                    .findByLotInOrderableGroup(vm.selectedOrderableGroup, vm.selectedLot);
            }

            validateDate();
            validateLotCode(selectedItem);
            var noErrors = !vm.newLot.expirationDateInvalid && !vm.newLot.lotCodeInvalid;
            if (selectedItem && !vm.addedItems.includes(selectedItem) && noErrors) {
                selectedItem.active = true;
                vm.addedItems.push(selectedItem);
            }
        }

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name validateDate
         *
         * @description
         * Validate if expirationDate is a future date.
         */
        function validateDate() {
            var currentDate = moment(new Date()).format('YYYY-MM-DD');
            if (vm.newLot.expirationDate && vm.newLot.expirationDate < currentDate) {
                vm.newLot.expirationDateInvalid = messageService.get('stockEditLotModal.expirationDateInvalid');
            }
        }

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name validateLotCode
         *
         * @description
         * Validate if on line item list exists the same orderable with the same lot code
         * 
         * @param {Object} selectedItem   item to add to form
         */
        function validateLotCode(selectedItem) {
            if (selectedItem && (Object.values(selectedItems).filter(function(item) {
                return (item.isAdded || selectedItem.$isNewItem) && isIdenticalOrderableAndLotCode(item, selectedItem);
            }).length > 0 ||  vm.addedItems && vm.addedItems.filter(function(item) {
                return isIdenticalOrderableAndLotCode(item, selectedItem);
            }).length > 0)) {
                vm.newLot.lotCodeInvalid = messageService.get('stockEditLotModal.lotCodeInvalid');
            }
        }

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name isIdenticalOrderableAndLotCode
         *
         * @description
         * Compare product code and lot code in two objects
         * 
         * @param {Object} item             item to compare
         * @param {Object} itemToCompare    item to compare
         */
        function isIdenticalOrderableAndLotCode(item, itemToCompare) {
            return itemToCompare.orderable.productCode === item.orderable.productCode
            && item.lot && itemToCompare.lot && itemToCompare.lot.lotCode === item.lot.lotCode;
        }

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name newLotCodeChanged
         *
         * @description
         * Hides the error message if exists after changed lot code.
         */
        function newLotCodeChanged() {
            vm.newLot.lotCodeInvalid = undefined;
        }

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name expirationDateChanged
         *
         * @description
         * Hides the error message if exists after changed expiration date.
         */
        function expirationDateChanged() {
            vm.newLot.expirationDateInvalid = undefined;
        }

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name removeAddedProduct
         *
         * @description
         * Removes an already added product and reset its quantity value.
         */
        function removeAddedProduct(item) {
            item.quantity = undefined;
            item.quantityMissingError = undefined;
            vm.addedItems.splice(vm.addedItems.indexOf(item), 1);
        }

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name validate
         *
         * @description
         * Validate if quantity is filled in by user.
         */
        function validate(item) {
            if (!item.quantity) {
                item.quantityInvalid = messageService.get('stockAddProductsModal.required');
            } else if (item.quantity > MAX_INTEGER_VALUE) {
                item.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else {
                item.quantityInvalid = undefined;
            }
        }

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name confirm
         *
         * @description
         * Confirm added products and close modal. Will not close modal if any quantity not filled in.
         */
        function confirm() {
            //some items may not have been validated yet, so validate all here.
            vm.addedItems.forEach(function(item) {
                vm.validate(item);
            });

            $scope.$broadcast('openlmis-form-submit');

            var noErrors = _.all(vm.addedItems, function(item) {
                return !item.quantityInvalid;
            });
            if (noErrors) {
                vm.addedItems.forEach(function(item) {
                    if (item.$isNewItem) {
                        selectedItems.push(item);
                    }
                });
                modalDeferred.resolve();
            }
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name lotChanged
         *
         * @description
         * Allows inputs to add missing lot to be displayed.
         */
        function lotChanged() {
            vm.canAddNewLot = vm.selectedLot &&
                vm.selectedLot.lotCode === messageService.get('orderableGroupService.addMissingLot');
            initiateNewLotObject();
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.controller:StockAdjustmentCreationController
         * @name initiateNewLotObject
         *
         * @description
         * Initiates new lot object.
         */
        function initiateNewLotObject() {
            vm.newLot = {
                active: true
            };
        }
    }
})();
