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
     * @name stock-event.StockEventResource
     *
     * @description
     * Communicates with the stockEvents endpoint of the OpenLMIS server.
     */
    angular
        .module('stock-event')
        .factory('StockEventResource', StockEventResource);

    StockEventResource.$inject = ['OpenlmisResource', 'classExtender', '$http'];

    function StockEventResource(OpenlmisResource, classExtender, $http) {

        classExtender.extend(StockEventResource, OpenlmisResource);

        StockEventResource.prototype.create = create;

        return StockEventResource;

        function StockEventResource() {
            this.super('/api/stockEvents', {
                paginated: false
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-event.StockEventResource
         * @name create
         *
         * @description
         * Creates a stock event on the OpenLMIS server. The endpoint responds with the bare UUID of
         * the created event, so we use $http directly - going through ngResource would coerce the
         * primitive string response into a character-indexed object and lose the id.
         *
         * @param  {Object}  event the JSON representation of the stock event
         * @return {Promise}       the promise resolving to the id of the created stock event
         */
        function create(event) {
            return $http.post(this.resourceUrl, event)
                .then(function(response) {
                    return response.data;
                });
        }
    }
})();
