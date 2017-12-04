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

    angular
        .module('stock-physical-inventory')
        .factory('PhysicalInventoryDataBuilder', PhysicalInventoryDataBuilder);

    PhysicalInventoryDataBuilder.$inject = ['PhysicalInventory'];

    function PhysicalInventoryDataBuilder(PhysicalInventory) {

        PhysicalInventoryDataBuilder.prototype.build = build;
        PhysicalInventoryDataBuilder.prototype.withLineItems = withLineItems;

        return PhysicalInventoryDataBuilder;

        function PhysicalInventoryDataBuilder() {
            PhysicalInventoryDataBuilder.instanceNumber = (PhysicalInventoryDataBuilder.instanceNumber || 0) + 1;

            this.id = 'physical-inventory-' + PhysicalInventoryDataBuilder.instanceNumber;
            this.programId = 'program-' + PhysicalInventoryDataBuilder.instanceNumber;
            this.facilityId = 'facility-' + PhysicalInventoryDataBuilder.instanceNumber;
            this.lineItems = [];
        }

        function build() {
            return new PhysicalInventory(
                this.id,
                this.programId,
                this.facilityId,
                this.lineItems
            );
        }

        function withLineItems(lineItems) {
          this.lineItems = lineItems;
          return this;
        }
    }
})();
