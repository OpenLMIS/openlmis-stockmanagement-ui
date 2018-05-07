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
     * @ngdoc directive
     * @restrict E
     * @name stock-reasons-modal.directive:stockReasons
     *
     * @description
     * The stock-reasons directive modifies a list of adjustments that are set
     * on the ngModel value.
     *
     * @example
     * <stock-reasons ng-model="vm.adjustments"
     *     line-item="lineItem"
     *     reasons="reasons"
     *     is-disabled="lineItem.isDisabled" />
     * 
     */
    angular
        .module('stock-reasons-modal')
        .directive('stockReasons', stockReasons);

    function stockReasons() {
        var directive = {
            templateUrl: 'stock-reasons-modal/stock-reasons.html',
            controller: 'StockReasonsController',
            controllerAs: 'stockReasonsCtrl',
            restrict: 'E',
            require: 'ngModel',
            scope: {
                lineItem: '=',
                reasons: '=',
                isDisabled: '='
            }
        };
        return directive;
    }

})();
