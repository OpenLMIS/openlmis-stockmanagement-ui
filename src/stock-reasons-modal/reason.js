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
     * @ngdoc service
     * @name stock-reasons-modal.Reason
     *
     * @description
     * Represents a single stock reason.
     */
    angular
        .module('stock-reasons-modal')
        .factory('Reason', Reason);

    Reason.$inject = ['REASON_CATEGORIES'];

    function Reason(REASON_CATEGORIES) {

        Reason.prototype.isPhysicalReason = isPhysicalReason;

        return Reason;

        /**
         * @ngdoc method
         * @methodOf stock-reasons-modal.Reason
         * @name Reason
         *
         * @description
         * Creates a new instance of the Reason class.
         *
         * @param  {Object} json the JSON representation of the Reason
         * @return {Reason}      the Reason object
         */
        function Reason(json) {
            angular.copy(json, this);
        }

        /**
         * @ngdoc method
         * @methodOf stock-reasons-modal.Reason
         * @name isPhysicalReason
         *
         * @description
         * Checks if reason category is Physical Inventory.
         *
         * @return {boolean} true if is physical reason
         */
        function isPhysicalReason() {
            return this.reasonCategory === REASON_CATEGORIES.PHYSICAL_INVENTORY;
        }

    }

})();
