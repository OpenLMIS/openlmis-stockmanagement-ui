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

(function () {

    'use strict';

    /**
     * @ngdoc service
     * @name stock-products.StockProductsRepository
     *
     * @description
     * Repository of Stock Products
     */
    angular
        .module('stock-products')
        .factory('StockProductsRepository', StockProductsRepository);

    function StockProductsRepository() {

        StockProductsRepository.prototype.findAvailableStockProducts = findAvailableStockProducts;

        return StockProductsRepository;

        function StockProductsRepository(impl) {
            this.impl = impl;
        }

        /**
         * @ngdoc method
         * @methodOf stock-products.StockProductsRepository
         * @name findAvailableStockProducts
         *
         * @description
         * Finds stock card summaries by facility and program and transform to Stock Products.
         *
         * @param {String}          programId        a program id of stock card.
         * @param {String}          facilityId       a facility id of stock card.
         * @param {String}          searchOption     a search option.
         * @returns {Promise} a promise of available stock products.
         */
        function findAvailableStockProducts(programId, facilityId, searchOption) {
            return this.impl.findAvailableStockProducts(programId, facilityId, searchOption);
        }
    }

})();
