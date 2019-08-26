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
        'confirmDiscardService', 'loadingModalService', 'stockKitUnpackService', 'alertService'
    ];

    function controller($scope, $state, $stateParams, facility, kit, messageService, MAX_INTEGER_VALUE,
                        confirmDiscardService, loadingModalService, stockKitUnpackService, alertService) {
        var vm = this;

        vm.showProductList = false;
        vm.productList = [];

        function isEmpty(value) {
            return _.isUndefined(value) || _.isNull(value);
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
            confirmDiscardService.register($scope, 'openlmis.stockmanagement.stockCardSummaries');
        };

        vm.validateQuantity = function() {
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

        vm.validateDocumentationNo = function() {
            if (vm.kit.documentationNo) {
                vm.kit.documentationNoInvalid = false;
            } else {
                vm.kit.documentationNoInvalid = true;
            }
            return vm.kit.documentationNoInvalid;
        };

        vm.validate = function() {
            var anyError = vm.validateQuantity();
            anyError = vm.validateDocumentationNo() || anyError;
            return anyError;
        };

        vm.unpack = function() {
            if (!vm.validate()) {
                loadingModalService.open();
                stockKitUnpackService.getUnpackKits(facility.id).then(function() {
                    vm.showProductList = true;
                    // vm.productList = _.map(products, function(product) {
                    //     return _.extend({
                    //         quantity: product.stockOnHand,
                    //         occurredDate: new Date()
                    //     }, product);
                    // });
                    vm.productList = [{
                        productCode: 'C0001',
                        fullProductName: 'Product Name',
                        Lots: [{
                            id: 1,
                            lotCode: 'LT01'
                        }, {
                            id: 2,
                            lotCode: 'LT02'
                        }],
                        quantityInKit: 10,
                        quantity: undefined,
                        occurredDate: new Date()
                    }, {
                        productCode: 'C0002',
                        fullProductName: 'Product Name',
                        Lots: [{
                            id: 1,
                            lotCode: 'LT01'
                        }, {
                            id: 2,
                            lotCode: 'LT02'
                        }],
                        quantityInKit: 12,
                        quantity: undefined,
                        occurredDate: new Date()
                    }];
                    loadingModalService.close();
                }, function(errorResponse) {
                    loadingModalService.close();
                    alertService.error(errorResponse.data.message);
                });
            }
        };

        vm.clear = function() {
            console.log('clear kit');
        };

        vm.submit = function() {
            console.log('submit kit');
        };
    }
})();
