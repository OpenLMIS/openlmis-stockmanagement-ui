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
     * @name stock-card-summary.StockCardSummaryRepository
     *
     * @description
     * Repository of Stock Card Summaries. It's an abstraction layer over internals communicating with the OpenLMIS server.
     */
    angular
        .module('stock-card-summary')
        .factory('StockCardSummaryRepository', StockCardSummaryRepository);

    StockCardSummaryRepository.$inject = ['StockCardSummary'];

    function StockCardSummaryRepository(StockCardSummary) {

        StockCardSummaryRepository.prototype.query = query;

        return StockCardSummaryRepository;

        function StockCardSummaryRepository(impl) {
            this.impl = impl;
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary.StockCardSummaryRepository
         * @name get
         *
         * @description
         * Searches for Stock Card Summaries.
         *
         * @param  {Object}  params search and pagination parameters
         * @return {Promise}        the promise resolving to instance of the StockCardSummary class
         */
        function query(params) {
            return this.impl.query(params)
            .then(function(page) {
                page.content = page.content.map(function(stockCardSummaryJson) {
                    return new StockCardSummary(stockCardSummaryJson);
                });
                return page;
            });
        }
    }
})();
