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
     * @name stock-reasons.Reason
     *
     * @description
     * Represents a single stock reason.
     */
    angular
        .module('stock-reasons')
        .factory('Reason', Reason);

    function Reason() {

        return Reason;

        /**
         * @ngdoc method
         * @methodOf stock-reasons.Reason
         * @name Reason
         *
         * @description
         * Creates a new instance of the Reason class.
         *
         * @param  {String}  id              the id of the Reason
         * @param  {String}  name            the name of the Reason
         * @param  {String}  reasonType      the type of the Reason
         * @param  {String}  reasonCategory  the category of the Reason
         * @return {Reason}   the Reason object
         */
        function Reason(id, name, reasonType, reasonCategory) {
            this.id = id;
            this.name = name;
            this.reasonType = reasonType;
            this.reasonCategory = reasonCategory;
        }

    }

})();
