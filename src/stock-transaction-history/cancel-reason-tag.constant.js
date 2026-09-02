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
     * @name stock-transaction-history.CANCEL_SCOPE_REASON_TAGS
     *
     * @description
     * Tags marking the adjustment reasons usable for cancellation, and saying what each may
     * cancel - so a row is offered the reasons written for the kind of line it undoes. A line
     * whose own reason carries one is itself a cancellation.
     */
    angular
        .module('stock-transaction-history')
        .constant('CANCEL_SCOPE_REASON_TAGS', cancelScopeReasonTags());

    function cancelScopeReasonTags() {
        var CANCEL_SCOPE_REASON_TAGS = {
            MOVEMENT: 'cancelMovement',
            ADJUSTMENT: 'cancelAdjustment',
            getTags: getTags
        };

        return CANCEL_SCOPE_REASON_TAGS;

        /**
         * @ngdoc method
         * @methodOf stock-transaction-history.CANCEL_SCOPE_REASON_TAGS
         * @name getTags
         *
         * @description
         * Returns all cancel scope tags as a list.
         *
         * @return {Array} the list of cancel scope tags
         */
        function getTags() {
            return [
                CANCEL_SCOPE_REASON_TAGS.MOVEMENT,
                CANCEL_SCOPE_REASON_TAGS.ADJUSTMENT
            ];
        }
    }

})();
