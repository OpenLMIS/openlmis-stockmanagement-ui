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
     * @name stock-event.StockEventRepository
     *
     * @description
     * Repository of Stock Event. It's an abstraction layer over internals communicating with the OpenLMIS
     * server.
     */
    angular
        .module('stock-event')
        .factory('StockEventRepository', StockEventRepository);

    StockEventRepository.$inject = ['StockEventRepositoryImpl'];

    function StockEventRepository(StockEventRepositoryImpl) {

        StockEventRepository.prototype.create = create;

        return StockEventRepository;

        function StockEventRepository(impl) {
            this.impl = impl || new StockEventRepositoryImpl();
        }

        /**
         * @ngdoc method
         * @methodOf stock-event.StockEventRepository
         * @name create
         *
         * @description
         * Creates stock event on the OpenLMIS server.
         *
         * @param  {Object}  event the JSON representation of the stock event
         * @return {Promise} the promise resolving to JSON representation of the created event
         */
        function create(event) {
            return this.impl.create(event);
        }
    }
})();
