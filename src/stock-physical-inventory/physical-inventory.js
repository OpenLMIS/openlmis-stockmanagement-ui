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
     * @name stock-physical-inventory.PhysicalInventory
     *
     * @description
     * Represents a single Physical Inventory.
     */
    angular
        .module('stock-physical-inventory')
        .factory('PhysicalInventory', PhysicalInventory);

    function PhysicalInventory() {

        return PhysicalInventory;

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.PhysicalInventory
         * @name PhysicalInventory
         *
         * @description
         * Creates a new instance of the Physical Inventory class.
         *
         * @param  {String}    id                the id of this physical inventory
         * @param  {String}    programId         the program id
         * @param  {String}    facilityId        the facility id
         * @param  {Array}     lineItems         the list of line items
         * @return {PhysicalInventory}           the Physical Inventory object
         */
        function PhysicalInventory(id, programId, facilityId, lineItems) {
            this.id = id;
            this.programId = programId;
            this.facilityId = facilityId
            this.lineItems = lineItems;
        }
    }
})();
