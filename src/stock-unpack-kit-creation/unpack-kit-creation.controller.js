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
        '$scope', '$state', '$stateParams', 'facility', 'kit', 'messageService', 'MAX_INTEGER_VALUE', 'alertService'
    ];

    function controller($scope, $state, $stateParams, facility, kit, messageService, MAX_INTEGER_VALUE, alertService) {
        var vm = this;

        vm.showProductList = false;
        vm.productList = [];

        vm.$onInit = function() {
            vm.facility = facility;
            vm.kit = _.extend({
                unpackQuantity: undefined,
                documentationNo: '',
                quantityInvalid: false,
                documentationNoInvalid: false
            }, kit);
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
            if (vm.validate()) {
                alertService.error('stockUnpackKitCreation.unpackInvalid');
            } else {
                vm.showProductList = true;
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
