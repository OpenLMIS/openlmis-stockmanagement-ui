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
     * @name stock-reasons.directive:stockReasons
     *
     * @description
     * Adds an on-click action that will download file from the url passed as the attribute
     * value. If the given URL doesn't include an access token this directive will add it.
     * If target attribute is set as _blank resource will be opened in new tab.
     *
     * @example
     * Add a on click action to a button that will cause it to download a file.
     * ```
     * <button openlmis-download="http://some.url/api/file"></button>
     * ```
     */
    angular
        .module('stock-reasons')
        .directive('stockReasons', stockReasons);

    function stockReasons() {
        var directive = {
            templateUrl: 'stock-reasons/stock-reasons.html',
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
