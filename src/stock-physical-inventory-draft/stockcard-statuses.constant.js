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
     * @name stock-constants.STOCKCARD_STATUS
     *
     * @description
     * This is constant for VVM statuses.
     */
    angular
        .module('stock-constants')
        .constant('STOCKCARD_STATUS', status());

    function status() {
        var STOCKCARD_STATUS = {
            ACTIVE: 'ACTIVE',
            INACTIVE: 'INACTIVE',
            $getDisplayName: getDisplayName
        };
        return STOCKCARD_STATUS;

        /**
         * @ngdoc method
         * @methodOf stock-constants.STOCKCARD_STATUS
         * @name getDisplayName
         *
         * @description
         * Returns display name key for given StockCard status.
         *
         * @param  {String} status StockCard status
         * @return {String}        StockCard status display name message key
         */
        function getDisplayName(status) {
            var displayName;
            if (status === STOCKCARD_STATUS.ACTIVE) {
                displayName = 'stockPhysicalInventoryDraft.statusActive';
            } else if (status === STOCKCARD_STATUS.INACTIVE) {
                displayName = 'stockPhysicalInventoryDraft.statusInactive';
            }
            return displayName;
        }
    }
})();
