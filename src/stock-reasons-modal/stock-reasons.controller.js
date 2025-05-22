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
     * @name stock-reasons-modal.controller:StockReasonsController
     *
     * @description
     *
     */
    angular
        .module('stock-reasons-modal')
        .controller('StockReasonsController', StockReasonsController);

    StockReasonsController.$inject = [
        '$q', '$scope', '$filter', '$element', 'adjustmentsModalService',
        'stockReasonsCalculations', 'confirmService', 'messageService', 'localStorageService', 'QUANTITY_UNIT'
    ];

    function StockReasonsController($q, $scope, $filter, $element, adjustmentsModalService,
                                    stockReasonsCalculations, confirmService, messageService, localStorageService,
                                    QUANTITY_UNIT) {

        var vm = this,
            ngModelCtrl = $element.controller('ngModel');

        vm.$onInit = onInit;
        vm.openModal = openModal;

        function onInit() {
            vm.reasons = $scope.reasons;

            ngModelCtrl.$render = function() {
                vm.adjustments = ngModelCtrl.$viewValue;
            };
        }

        function openModal() {
            adjustmentsModalService.open(
                vm.adjustments,
                vm.reasons,
                $scope.lineItem,
                showInDoses(),
                getTitle(),
                getMessage(),
                $scope.isDisabled,
                getSummaries(),
                preSave
            ).then(function(adjustments) {
                vm.adjustments = adjustments;
                ngModelCtrl.$setViewValue(adjustments);
            });
        }

        function getTitle() {
            return messageService.get('stockReasonsModal.reasonsFor', {
                product: $scope.lineItem.orderable.fullProductName
            });
        }

        function getMessage() {
            return messageService.get('stockReasonsModal.addReasonsToTheDifference', {
                difference: showInDoses() ? stockReasonsCalculations.calculateDifference($scope.lineItem) :
                    stockReasonsCalculations.calculateDifferenceInPacks($scope.lineItem)
            });
        }

        function getSummaries() {
            return {
                'stockReasonsModal.unaccounted': function(adjustments) {
                    return showInDoses() ? stockReasonsCalculations.calculateUnaccounted(
                        $scope.lineItem,
                        adjustments
                    ) : stockReasonsCalculations.calculateUnaccountedInPacks(
                        $scope.lineItem,
                        adjustments
                    );
                },
                'stockReasonsModal.total': function(adjustments) {
                    return showInDoses() ? stockReasonsCalculations.calculateTotal(adjustments) :
                        stockReasonsCalculations.calculateTotalInPacks(
                            adjustments, $scope.lineItem.orderable.netContent, false
                        );
                }
            };
        }

        function preSave(adjustments) {
            if (stockReasonsCalculations.calculateUnaccounted($scope.lineItem, adjustments)) {
                return confirmService.confirm(
                    messageService.get('stockReasonsModal.updateReasonsFor', {
                        product: $scope.lineItem.orderable.fullProductName
                    }),
                    'stockReasonsModal.update'
                );
            }
            return $q.when();
        }

        function showInDoses() {
            var cachedQuantityUnit = localStorageService.get('quantityUnit');
            if (cachedQuantityUnit === null) {
                cachedQuantityUnit = QUANTITY_UNIT.$getDefaultQuantityUnit();
            }

            return cachedQuantityUnit === QUANTITY_UNIT.DOSES;
        }
    }

})();
