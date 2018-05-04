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
     * @name stock-reasons.StockReasonTagResource
     *
     * @description
     * Communicates with the stockCardLineItemsReasonTags endpoint of the OpenLMIS server.
     */
    angular
        .module('stock-reasons')
        .factory('StockReasonTagResource', StockReasonTagResource);

    StockReasonTagResource.$inject = ['$resource', 'openlmisUrlFactory'];

    function StockReasonTagResource($resource, openlmisUrlFactory) {

        StockReasonTagResource.prototype.query = query;

        return StockReasonTagResource;

        function StockReasonTagResource() {
            this.resource = $resource(openlmisUrlFactory('/api/stockCardLineItemReasonTags'));
        }

        function query() {
            return this.resource.query().$promise;
        }
    }
})();
