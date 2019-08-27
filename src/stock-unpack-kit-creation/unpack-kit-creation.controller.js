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
     * @name stock-unpack-kit-creation.controller:UnpackKitCreationController
     *
     * @description
     * Controller for managing stock adjustment creation.
     */
    angular
        .module('stock-unpack-kit-creation')
        .controller('UnpackKitCreationController', controller);

    controller.$inject = [
        '$scope', '$state', '$stateParams', 'facility', 'kit', 'messageService', 'MAX_INTEGER_VALUE',
        'confirmDiscardService', 'loadingModalService', 'stockKitUnpackService', 'alertService', 'KitResource'
    ];

    function controller($scope, $state, $stateParams, facility, kit, messageService, MAX_INTEGER_VALUE,
                        confirmDiscardService, loadingModalService, stockKitUnpackService, alertService, KitResource) {
        var vm = this;

        vm.showProducts = false;
        vm.products = [];
        vm.groupedProducts = [];

        function isEmpty(value) {
            return value === '' || _.isUndefined(value) || _.isNull(value);
        }

        vm.$onInit = function() {
            vm.maxDate = new Date();
            vm.facility = facility;
            vm.kit = _.extend({
                unpackQuantity: undefined,
                documentationNo: undefined,
                quantityInvalid: false,
                documentationNoInvalid: false
            }, kit);
            $scope.$watch(function() {
                return vm.kit;
            }, function(newValue) {
                $scope.needToConfirm = !isEmpty(newValue.unpackQuantity) || !isEmpty(newValue.documentationNo);
            }, true);
            $scope.$watch(function() {
                return vm.products;
            }, function(newValue) {
                vm.groupedProducts = _.chain(newValue).groupBy('productCode')
                    .values()
                    .value();
            }, true);
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');
        };

        vm.validateProductQuantity = function(product) {
            if (product.quantity > MAX_INTEGER_VALUE) {
                product.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else if (isEmpty(product.quantity)) {
                product.quantityInvalid = messageService.get('stockPhysicalInventoryDraft.required');
            } else {
                product.quantityInvalid = false;
            }
            return product.quantityInvalid;
        };

        vm.validateKitQuantity = function() {
            if (vm.kit.unpackQuantity > MAX_INTEGER_VALUE) {
                vm.kit.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else if (vm.kit.unpackQuantity > vm.kit.stockOnHand) {
                vm.kit.quantityInvalid = messageService.get('stockUnpackKitCreation.lessThanSOH');
            } else if (vm.kit.unpackQuantity >= 1) {
                vm.kit.quantityInvalid = false;
            } else {
                vm.kit.quantityInvalid = messageService.get('stockUnpackKitCreation.positiveInteger');
            }
            return vm.kit.quantityInvalid;
        };

        vm.validateProductQuantity = function(product) {
            if (product.quantity > MAX_INTEGER_VALUE) {
                product.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else if (isEmpty(product.quantity)) {
                product.quantityInvalid = messageService.get('stockPhysicalInventoryDraft.required');
            } else {
                product.quantityInvalid = false;
            }
            return product.quantityInvalid;
        };

        vm.validateDocumentationNo = function() {
            if (vm.kit.documentationNo) {
                vm.kit.documentationNoInvalid = false;
            } else {
                vm.kit.documentationNoInvalid = true;
            }
            return vm.kit.documentationNoInvalid;
        };

        vm.validateLotCode = function(product) {
            if (isEmpty(product.lot)) {
                product.lotInvalid = messageService.get('stockPhysicalInventoryDraft.required');
            } else {
                product.lotInvalid = false;
            }
            return product.lotInvalid;
        };

        vm.validateDate = function(product) {
            if (isEmpty(product.occurredDate)) {
                product.dateInvalid = messageService.get('stockPhysicalInventoryDraft.required');
            } else {
                product.dateInvalid = false;
            }
            return product.dateInvalid;
        };

        vm.unpackValidate = function() {
            var anyError = vm.validateKitQuantity();
            anyError = vm.validateDocumentationNo() || anyError;
            return anyError;
        };

        function getNewProduct(product) {
            return _.extend({}, angular.copy(product), {
                quantity: undefined,
                quantityInvalid: false,
                lot: null,
                lotInvalid: false,
                occurredDate: new Date(),
                dateInvalid: false
            });
        }

        vm.unpack = function() {
            if (!vm.unpackValidate()) {
                loadingModalService.open();
                new KitResource().query({
                    kitProductId: $stateParams.orderableId
                })
                    .then(function(products) {
                        loadingModalService.close();
                        vm.showProducts = true;
                        vm.products = _.map(products, function(product) {
                            product.quantityInKit = product.quantity;
                            return getNewProduct(product);
                        });
                    }, function(errorResponse) {
                        loadingModalService.close();
                        alertService.error(errorResponse.data.message);
                    });
            }
        };

        vm.addLot = function(product) {
            var newProduct = getNewProduct(product);
            vm.products.push(newProduct);
        };

        vm.removeLot = function(product) {
            var index = _.findIndex(vm.products, product);
            if (!isEmpty(index)) {
                vm.products.splice(index, 1);
            }
        };

        vm.clear = function() {
            console.log('clear kit');
        };

        vm.submit = function() {
            console.log('submit kit');
        };

        vm.calculate = function(products, field) {
            var allEmpty = _.every(products, function(product) {
                return isEmpty(product[field]);
            });
            if (allEmpty) {
                return undefined;
            }

            return _.chain(products).map(function(product) {
                return product[field];
            })
                .compact()
                .reduce(function(memo, num) {
                    return parseInt(num) + memo;
                }, 0)
                .value();
        };
    }
})();
