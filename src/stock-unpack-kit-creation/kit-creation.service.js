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
     * @name stock-unpack-kit-creation.sourceDestinationService
     *
     * @description
     * Responsible for fetching valid sources and destinations.
     */
    angular
        .module('stock-unpack-kit-creation')
        .service('kitCreationService', service);

    service.$inject = ['$resource', 'stockmanagementUrlFactory'];

    function service($resource, stockmanagementUrlFactory) {
        this.getKitProducts = getKitProducts;
        this.getSourceAndDestination = getSourceAndDestination;
        this.submitUnpack = submitUnpack;

        function getKitProducts(orderableId) {
            var resource = $resource(stockmanagementUrlFactory('/api/siglus/orderables/orderableChild'));
            return resource.query({
                kitProductId: orderableId
            }).$promise;
        }

        function getSourceAndDestination(facilityType, programId, kitName) {
            var resource = $resource(stockmanagementUrlFactory('/api/siglus/kitSourceAndDestination'));
            return resource.get({
                facilityType: facilityType,
                program: programId,
                kitName: kitName
            }).$promise;
        }

        function submitUnpack(facilityId, programId, signature, lineItems) {
            var resource = $resource(stockmanagementUrlFactory('/api/stockEvents'));
            var event = {
                facilityId: facilityId,
                programId: programId,
                signature: signature
            };
            event.lineItems = lineItems;
            return resource.save(event).$promise;
        }
    }
})();
