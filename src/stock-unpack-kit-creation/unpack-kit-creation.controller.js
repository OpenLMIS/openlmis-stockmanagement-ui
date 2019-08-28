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
        'confirmDiscardService', 'loadingModalService', 'stockKitUnpackService', 'alertService',
        'kitCreationService', 'signatureModalService', 'sourceAndDestination', 'notificationService',
        'dateUtils'
    ];

    function controller($scope, $state, $stateParams, facility, kit, messageService, MAX_INTEGER_VALUE,
                        confirmDiscardService, loadingModalService, stockKitUnpackService, alertService,
                        kitCreationService, signatureModalService, sourceAndDestination, notificationService,
                        dateUtils) {
        var vm = this;

        vm.showProducts = false;
        vm.kitChildren = [];
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
            $scope.$watchCollection(function() {
                return vm.pageProducts;
            }, function(newList) {
                vm.groupedPageProducts = _.chain(newList).flatten()
                    .groupBy('productCode')
                    .values()
                    .value();
            }, true);
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');
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
                product.quantityInvalid = messageService.get('stockUnpackKitCreation.required');
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
                product.lotInvalid = messageService.get('stockUnpackKitCreation.required');
            } else {
                product.lotInvalid = false;
            }
            return product.lotInvalid;
        };

        vm.validateDate = function(product) {
            if (isEmpty(product.occurredDate)) {
                product.dateInvalid = messageService.get('stockUnpackKitCreation.required');
            } else {
                product.dateInvalid = false;
            }
            return product.dateInvalid;
        };

        vm.lotChange = function(product) {
            product.expirationDate = product.lot.expirationDate;
        };

        vm.unpackValidate = function() {
            var anyError = vm.validateKitQuantity();
            anyError = vm.validateDocumentationNo() || anyError;
            return anyError;
        };

        vm.submitValidate = function() {
            var anyError = false;
            _.forEach(vm.products, function(product) {
                anyError = vm.validateLotCode(product) || anyError;
                anyError = vm.validateProductQuantity(product) || anyError;
                anyError = vm.validateDate(product) || anyError;
            });
            return anyError;
        };

        function getNewProduct(product) {
            return _.extend({}, angular.copy(product), {
                quantity: undefined,
                quantityInvalid: false,
                lot: null,
                expirationDate: undefined,
                lotInvalid: false,
                occurredDate: dateUtils.toStringDate(new Date()),
                dateInvalid: false,
                orderableId: product.id,
                sourceId: sourceAndDestination && sourceAndDestination.source && sourceAndDestination.source.node &&
                    sourceAndDestination.source.node.id,
                programId: vm.kit.parentProgramId,
                documentationNo: vm.kit.documentationNo
            });
        }

        vm.unpack = function() {
            if (!vm.unpackValidate()) {
                loadingModalService.open();
                kitCreationService.getKitProducts($stateParams.orderableId)
                    .then(function(products) {
                        loadingModalService.close();
                        vm.showProducts = true;
                        vm.products = _.map(products, function(product) {
                            product.quantityInKit = product.quantity;
                            return getNewProduct(product);
                        });
                        vm.kitChildren = angular.copy(vm.products);
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
            vm.products = vm.kitChildren;
        };

        vm.submit = function() {
            if (vm.submitValidate()) {
                $scope.$broadcast('openlmis-form-submit');
            } else {
                signatureModalService.confirm('stockUnpackKitCreation.signature').then(function(signature) {
                    loadingModalService.open();
                    var kitItme = {
                        orderableId: vm.kit.id,
                        lotId: null,
                        lotCode: null,
                        quantity: vm.kit.unpackQuantity,
                        occurredDate: dateUtils.toStringDate(new Date()),
                        documentationNo: vm.kit.documentationNo,
                        programId: vm.kit.parentProgramId,
                        destinationId: sourceAndDestination && sourceAndDestination.destination &&
                            sourceAndDestination.destination.node && sourceAndDestination.destination.node.id
                    };
                    var lineItems = _.map(vm.products, function(product) {
                        return  {
                            orderableId: product.orderableId,
                            lotId: product.lot ? product.lot.id : null,
                            lotCode: product.lot ? product.lot.lotCode : null,
                            expirationDate: product.expirationDate,
                            quantity: product.quantity,
                            occurredDate: product.occurredDate,
                            documentationNo: product.documentationNo,
                            programId: product.programId,
                            sourceId: product.sourceId
                        };
                    });
                    lineItems.unshift(kitItme);
                    kitCreationService.submitUnpack(facility.id, vm.kit.parentProgramId, signature, lineItems)
                        .then(function() {
                            notificationService.success('stockUnpackKitCreation.submitted');
                            $state.go('openlmis.stockmanagement.stockCardSummaries', {
                                program: vm.kit.parentProgramId,
                                facility: facility.id
                            });
                        })
                        .catch(function() {
                            loadingModalService.close();
                            alertService.error('stockUnpackKitCreation.saveFailed');
                        });
                });
            }
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
