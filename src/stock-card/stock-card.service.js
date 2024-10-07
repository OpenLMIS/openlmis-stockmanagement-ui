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
     * @name stock-card.stockCardService
     *
     * @description
     * Responsible for fetching single stock card with line items.
     */
    angular
        .module('stock-card')
        .service('stockCardService', service);

    service.$inject = ['$resource', '$window', 'stockmanagementUrlFactory', 'accessTokenFactory', 'dateUtils',
        'StockCardResource', '$q', 'offlineService'];

    function service($resource, $window, stockmanagementUrlFactory, accessTokenFactory, dateUtils,
                     StockCardResource, $q, offlineService) {
        var stockCardResource = new StockCardResource();
        var resource = $resource(stockmanagementUrlFactory('/api/stockCards/:stockCardId'), {}, {
            get: {
                method: 'GET',
                transformResponse: transformResponse
            },
            update: {
                method: 'POST',
                url: stockmanagementUrlFactory('/api/stockCards/:stockCardId/deactivate')
            }
        });

        this.getStockCard = getStockCard;
        this.print = print;
        this.deactivateStockCard = deactivateStockCard;

        /**
         * @ngdoc method
         * @methodOf stock-card.stockCardService
         * @name getStockCard
         *
         * @description
         * Get stock card by id.
         *
         * @param {String} stockCardId stock card UUID
         * @return {Promise} stock card promise.
         */
        function getStockCard(stockCardId) {
            return stockCardResource.get(stockCardId)
                .then(function(stockCard) {
                    if (!stockCard && offlineService.isOffline()) {
                        throw new Error('stockCard.notCached.error');
                    }
                    return $q.resolve(stockCard);
                });
        }

        /**
         * @ngdoc method
         * @methodOf stock-card.stockCardService
         * @name deactivateStockCard
         *
         * @description
         * Change stock card active property by id to false.
         *
         * @param {String} stockCardId stock card UUID
         * @return {Promise} stock card promise.
         */
        function deactivateStockCard(stockCardId) {
            return resource.update({
                stockCardId: stockCardId
            }, null).$promise;
        }

        function print(stockCardId) {
            var url = stockmanagementUrlFactory('/api/stockCards/' + stockCardId + '/print');
            $window.open(accessTokenFactory.addAccessToken(url), '_blank');
        }

        function transformResponse(data, headers, status) {
            if (status === 200) {
                var stockCard = angular.fromJson(data);
                if (stockCard.lot && stockCard.lot.expirationDate) {
                    stockCard.lot.expirationDate = dateUtils.toDate(stockCard.lot.expirationDate);
                }
                return stockCard;
            }
            return data;
        }
    }
})();
