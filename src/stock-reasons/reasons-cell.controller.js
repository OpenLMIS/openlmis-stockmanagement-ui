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
        '$q', '$scope', '$filter', 'adjustmentsModalService', 'reasonCalculations',
        'confirmService', 'messageService', '$element'
    ];

    function ReasonsCellController($q, $scope, $filter, adjustmentsModalService, reasonCalculations,
                                   confirmService, messageService, $element) {

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
            adjustmentsModalService.open({
                reasons: vm.reasons,
                adjustments: vm.adjustments,
                title: messageService.get('stockReasons.reasonsFor', {
                    product: $scope.lineItem.orderable.fullProductName
                }),
                message: messageService.get('stockReasons.addReasonsToTheDifference', {
                    difference: reasonCalculations.calculateDifference($scope.lineItem)
                }),
                summaries: {
                    'stockReasons.unaccounted': function functionName(adjustments) {
                        return reasonCalculations.calculateUnaccounted(
                            $scope.lineItem,
                            adjustments
                        );
                    },
                    'stockReasons.total': reasonCalculations.calculateTotal
                },
                preSave: preSave
            }).then(function(adjustments) {
                vm.adjustments = adjustments;
                ngModelCtrl.$setViewValue(adjustments);
            });
        }

        function preSave(adjustments) {
            if (reasonCalculations.calculateUnaccounted($scope.lineItem, adjustments)) {
                return confirmService.confirm(messageService.get('stockReasons.updateReasonsFor', {
                    product: $scope.lineItem.orderable.fullProductName
                }));
            }
            return $q.when();
        }
    }

})();
