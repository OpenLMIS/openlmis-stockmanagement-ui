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
     * @name stock-reasons.controller:ReasonsCellController
     *
     * @description
     *
     */
    angular
        .module('stock-reasons')
        .controller('ReasonsCellController', ReasonsCellController);

    ReasonsCellController.$inject = [
        '$scope', '$filter', 'adjustmentsModalService', 'reasonCalculations', 'confirmService'
    ];

    function ReasonsCellController($scope, $filter, adjustmentsModalService, reasonCalculations,
                                   confirmService) {

        var vm = this;

        vm.$onInit = onInit;
        vm.openModal = openModal;

        function onInit() {

            if (!$scope.lineItem.stockAdjustments) {
                $scope.lineItem.stockAdjustments = [];
            }

            vm.adjustments = $scope.lineItem.stockAdjustments;
            vm.reasons = $scope.reasons;
        }

        function openModal() {
            adjustmentsModalService.open({
                reasons: vm.reasons,
                adjustments: vm.adjustments,
                title: {
                    key: 'stockReasons.reasonsFor',
                    params: {
                        product: $scope.lineItem.orderable.fullProductName
                    }
                },
                message: {
                    key: 'stockReasons.addReasonsToTheDifference',
                    params: {
                        difference: reasonCalculations.calculateDifference($scope.lineItem)
                    }
                },
                summaries: {
                    'stockReasons.unaccounted': function functionName(adjustments) {
                        return reasonCalculations.calculateUnaccounted(
                            $scope.lineItem,
                            adjustments
                        );
                    },
                    'stockReasons.total': reasonCalculations.calculateTotal
                },
                preSave: function() {
                    return confirmService.confirm();
                }
            }).then(function(adjustments) {
                vm.adjustments.splice(0, vm.adjustments.length);
                vm.adjustments.push.apply(vm.adjustments, adjustments);
            });
        }
    }

})();
