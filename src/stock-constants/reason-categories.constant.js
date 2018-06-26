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
     * @name stock-constants.REASON_CATEGORIES
     *
     * @description
     * This is constant for stock reason categories.
     */
    angular
        .module('stock-constants')
        .constant('REASON_CATEGORIES', type());

    function type() {
        var REASON_CATEGORIES = {
                TRANSFER: 'TRANSFER',
                ADJUSTMENT: 'ADJUSTMENT',
                PHYSICAL_INVENTORY: 'PHYSICAL_INVENTORY',
                getLabel: getLabel,
                getCategories: getCategories
            },
            labels = {
                TRANSFER: 'stockConstants.transfer',
                ADJUSTMENT: 'stockConstants.adjustment',
                PHYSICAL_INVENTORY: 'stockConstants.physicalInventory'
            };

        return REASON_CATEGORIES;

        /**
         * @ngdoc method
         * @methodOf stock-constants.REASON_CATEGORIES
         * @name getLabel
         *
         * @description
         * Returns a label for the given category. Throws an exception if the category is not recognized.
         *
         * @param  {String} category the reason category
         * @return {String}          the label
         */
        function getLabel(category) {
            var label = labels[category];

            if (!label) {
                throw '"' + category + '" is not a valid category';
            }

            return label;
        }

        /**
         * @ngdoc method
         * @methodOf stock-constants.REASON_CATEGORIES
         * @name getCategories
         *
         * @description
         * Returns all available categories as a list.
         *
         * @return  {Array} the list of available categories
         */
        function getCategories() {
            return [
                REASON_CATEGORIES.TRANSFER,
                REASON_CATEGORIES.ADJUSTMENT,
                REASON_CATEGORIES.PHYSICAL_INVENTORY
            ];
        }
    }

})();
