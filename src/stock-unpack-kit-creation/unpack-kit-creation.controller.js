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
        'dateUtils', 'receivedReasons', 'issuedReasons', 'autoGenerateService'
    ];

    function controller($scope, $state, $stateParams, facility, kit, messageService, MAX_INTEGER_VALUE,
                        confirmDiscardService, loadingModalService, stockKitUnpackService, alertService,
                        kitCreationService, signatureModalService, sourceAndDestination, notificationService,
                        dateUtils, receivedReasons, issuedReasons, autoGenerateService) {
        var vm = this;

        vm.showProducts = false;
        vm.kitChildren = [];
        vm.products = [];
        vm.groupedProducts = [];

        function isEmpty(value) {
            return value === '' || _.isUndefined(value) || _.isNull(value);
        }

        vm.$onInit = function() {
            $state.current.label = kit.fullProductName;
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
            }, function(newValue, oldValue) {
                if (newValue.length !== oldValue.length) {
                    vm.groupedProducts = getGroupedProducts(newValue);
                }
            }, true);
            // $scope.$watchCollection(function() {
            //     return vm.pageProducts;
            // }, function(newList) {
            //     vm.groupedPageProducts = _.chain(newList).flatten()
            //         .groupBy('productCode')
            //         .values()
            //         .value();
            // }, true);
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');
        };

        function getGroupedProducts(products) {
            return _.chain(products).groupBy('productCode')
                .values()
                .value();
        }

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
            if (isEmpty(product.lot) || isEmpty(product.lot.lotCode)) {
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

        vm.validateExpirationDate = function(product) {
            if (isEmpty(product.lot) || isEmpty(product.lot.expirationDate)) {
                product.expirationInvalid = messageService.get('stockUnpackKitCreation.required');
            } else {
                product.expirationInvalid = false;
            }
            return product.expirationInvalid;
        };

        vm.expirationDateChange = function(product) {
            vm.validateExpirationDate(product);
            vm.updateAutoLot(product);
        };

        vm.unpackValidate = function() {
            var anyError = vm.validateKitQuantity();
            anyError = vm.validateDocumentationNo() || anyError;
            return anyError;
        };

        vm.showSelect = function($event, product) {
            if (!product.showSelect) {
                hideAllSelect();
                product.showSelect = true;
                var target = $event.target.parentNode.parentNode.querySelector('.adjustment-custom-item');
                product.positionTop = {
                    top: getOffset(target)
                };
            }
        };

        function getOffset(element) {
            var rect = element.getBoundingClientRect();
            return - (rect.top + window.scrollY);
        }

        function hideAllSelect() {
            vm.products.forEach(function(product) {
                product.showSelect = false;
            });
        }

        $scope.$on('lotCodeChange', function(event, data) {
            var product = data.lineItem;
            if (product.lot && product.lot.lotCode) {
                product.lotInvalid = false;
            } else {
                product.lotInvalid = messageService.get('stockUnpackKitCreation.required');
            }
        });

        vm.clearLot = function(product) {
            if (product.lot && product.lot.id) {
                product.lot = null;
            } else if (product.lot) {
                product.lot.lotCode = undefined;
            }
            product.showSelect = false;
            product.isExpirationDateRequired = false;
        };

        vm.updateAutoLot = function(product) {
            if (product.lot.isAuto || product.isTryAuto) {
                if (product.lot.expirationDate) {
                    var lotCode = autoGenerateService.autoGenerateLotCode(product);
                    product.lot = {
                        lotCode: lotCode,
                        expirationDate: product.lot.expirationDate,
                        isAuto: true
                    };
                    product.isTryAuto = false;
                } else {
                    product.lot = {};
                }

            }
        };

        vm.submitValidate = function() {
            var anyError = false;
            _.forEach(vm.products, function(product) {
                anyError = vm.validateLotCode(product) || anyError;
                anyError = vm.validateExpirationDate(product) || anyError;
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
                lotInvalid: false,
                lotOptions: product.lots,
                orderable: {
                    productCode: product.productCode
                },
                showSelect: false,
                expirationInvalid: false,
                isExpirationDateRequired: false,
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
                        vm.kitChildren = vm.products.slice();
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
            vm.products = _.map(vm.kitChildren, function(product) {
                return getNewProduct(product);
            });
            vm.groupedProducts = getGroupedProducts(vm.products);
        };

        vm.submit = function() {
            if (vm.submitValidate()) {
                $scope.$broadcast('openlmis-form-submit');
            } else {
                signatureModalService.confirm('stockUnpackKitCreation.signature').then(function(signature) {
                    loadingModalService.open();
                    var receiveReason = _.find(receivedReasons, {
                        name: 'Receive'
                    });
                    var issueReason = _.find(issuedReasons, {
                        name: 'Issue'
                    });
                    var kitItem = {
                        orderableId: vm.kit.id,
                        quantity: vm.kit.unpackQuantity,
                        occurredDate: dateUtils.toStringDate(new Date()),
                        documentationNo: vm.kit.documentationNo,
                        programId: vm.kit.parentProgramId,
                        destinationId: sourceAndDestination && sourceAndDestination.destination &&
                            sourceAndDestination.destination.node && sourceAndDestination.destination.node.id,
                        reasonId: issueReason ? issueReason.id : null
                    };
                    var lineItems = _.map(vm.products, function(product) {
                        return  {
                            orderableId: product.orderableId,
                            lotId: product.lot ? product.lot.id : null,
                            lotCode: product.lot ? product.lot.lotCode : null,
                            expirationDate: product.lot ? product.lot.expirationDate : null,
                            quantity: product.quantity,
                            occurredDate: product.occurredDate,
                            documentationNo: product.documentationNo,
                            programId: product.programId,
                            sourceId: product.sourceId,
                            reasonId: receiveReason ? receiveReason.id : null
                        };
                    });
                    lineItems.unshift(kitItem);
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
