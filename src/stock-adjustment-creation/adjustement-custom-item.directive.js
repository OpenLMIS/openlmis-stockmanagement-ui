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
    angular
        .module('stock-adjustment-creation')
        .directive('adjustmentCustomItem', [function() {
            return {
                templateUrl: 'stock-adjustment-creation/adjustment-custom-item.html',
                restrict: 'E',
                scope: {
                    lineItem: '=',
                    itemIndex: '<'
                },
                controller: ['$scope', 'dateUtils', 'alertService',
                    'orderableGroupService', 'autoGenerateService', 'orderableLotMapping',
                    function($scope, dateUtils, alertService, orderableGroupService,
                        autoGenerateService, orderableLotMapping) {

                        $scope.$watch('lineItem.lot', function(newLot) {
                            if (newLot && newLot.lotCode) {
                                // if NOT input
                                if (newLot.isAuto || $scope.lineItem.isFromSelect) {
                                    // not lot defined handled in finish input
                                    if (newLot.lotCode !== 'No lot defined') {
                                        var item = $scope.lineItem;
                                        item.isFromInput = false;
                                        item.isFromSelect = true;

                                        var selectedOrderableGroup = orderableLotMapping
                                            .findSelectedOrderableGroupsByOrderableId(item.orderableId);
                                        var selectedItem = orderableGroupService
                                            .findByLotInOrderableGroup(selectedOrderableGroup, newLot);

                                        // if auto generate, then no selectedItem
                                        item.$previewSOH = selectedItem ? selectedItem.stockOnHand : null;

                                        item.showSelect = false;

                                        $scope.$emit('lotCodeChange', {
                                            index: $scope.itemIndex,
                                            lineItem: item
                                        });
                                    }
                                }
                            }
                        }, true);

                        $scope.select = function(lot) {
                            $scope.lineItem.lot = lot;
                            $scope.lineItem.isFromInput = false;
                            $scope.lineItem.isFromSelect = true;
                        };

                        $scope.autoLotCode = function(lineItem) {
                            if (lineItem.lot && lineItem.lot.expirationDate) {
                                var lotCode = autoGenerateService.autoGenerateLotCode(lineItem);
                                $scope.lineItem.lot = {
                                    lotCode: lotCode,
                                    expirationDate: lineItem.lot.expirationDate,
                                    isAuto: true
                                };
                                $scope.lineItem.isFromInput = false;
                                $scope.lineItem.isFromSelect = true;

                            } else {
                                // alertService.error('Please choose the expiration date before auto generate!');
                                lineItem.isExpirationDateRequired = true;
                                lineItem.isTryAuto = true;
                                lineItem.showSelect = false;
                            }
                        };
                    }],
                replace: true
            };
        }]);
})();