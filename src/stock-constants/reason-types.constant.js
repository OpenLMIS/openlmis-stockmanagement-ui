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
     * @ngdoc object
     * @name stock-constants.REASON_TYPES
     *
     * @description
     * This is constant for stock reason types.
     */
    angular
        .module('stock-constants')
        .constant('REASON_TYPES', reasonTypes());

    function reasonTypes() {
        var REASON_TYPES = {
                CREDIT: 'CREDIT',
                DEBIT: 'DEBIT',
                BALANCE_ADJUSTMENT: 'BALANCE_ADJUSTMENT',
                getLabel: getLabel,
                getTypes: getTypes
            },
            labels = {
                CREDIT: 'stockConstants.credit',
                DEBIT: 'stockConstants.debit',
                BALANCE_ADJUSTMENT: 'stockConstants.balanceAdjustment'
            };

        return REASON_TYPES;

        /**
         * @ngdoc method
         * @methodOf stock-constants.REASON_TYPES
         * @name getLabel
         *
         * @description
         * Returns a label for the given type. Throws an exception if the type is not recognized.
         *
         * @param  {String} type the reason type
         * @return {String}      the label
         */
        function getLabel(type) {
            var label = labels[type];

            if (!label) {
                throw '"' + type + '" is not a valid type';
            }

            return label;
        }

        /**
         * @ngdoc method
         * @methodOf stock-constants.REASON_TYPES
         * @name getTypes
         *
         * @description
         * Returns all available types as a list.
         *
         * @return  {Array} the list of available types
         */
        function getTypes() {
            return [
                REASON_TYPES.CREDIT,
                REASON_TYPES.DEBIT,
                REASON_TYPES.BALANCE_ADJUSTMENT
            ];
        }
    }

})();
