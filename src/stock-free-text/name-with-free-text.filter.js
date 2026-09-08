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
     * @ngdoc filter
     * @name stock-free-text.filter:nameWithFreeText
     *
     * @description
     * Returns the name of the given reason, source or destination, followed by its free text when
     * one is given. Free text is optional for every reason and assignment that allows it, so a
     * line item without one simply reads as the name.
     *
     * @param  {Object} named    the reason, source or destination to display
     * @param  {String} freeText the matching free text of the line item, if any
     * @return {String}          the name with its free text, if any
     *
     * @example
     * We want to display the reason of a stock card line item along with its free text
     * ```
     * <td>{{lineItem.reason | nameWithFreeText:lineItem.reasonFreeText}}</td>
     * ```
     */
    angular
        .module('stock-free-text')
        .filter('nameWithFreeText', nameWithFreeTextFilter);

    nameWithFreeTextFilter.$inject = ['messageService'];

    function nameWithFreeTextFilter(messageService) {
        return function(named, freeText) {
            if (!named) {
                return '';
            }
            if (freeText) {
                return messageService.get('stockFreeText.nameWithFreeText', {
                    name: named.name,
                    freeText: freeText
                });
            }
            return named.name;
        };
    }

})();
