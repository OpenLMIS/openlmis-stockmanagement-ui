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
     * @name stock-adjustment-creation.stockAdjustmentCreationService
     *
     * @description
     * Responsible for search and submit stock adjustments.
     */
    angular
        .module('stock-card-summary-list')
        .service('stockCardSummaryListService', service);

    service.$inject = ['stockmanagementUrlFactory', '$http', '$q'];

    function service(stockmanagementUrlFactory, $http, $q) {
        var me = this;

        me.getAll = function() {
            return $http.get(stockmanagementUrlFactory('/api/siglus/programs?code=ALL')).then(function(res) {
                return res.data;
            });
        };

        me.getVirtual = function(userId) {
            var url = stockmanagementUrlFactory('/api/users/' + userId + '/STOCK_CARDS_VIEW/programs');
            return $http.get(url).then(function(res) {
                return res.data;
            });
        };

        me.getPrograms = function(userId) {
            return $q.all([me.getAll(), me.getVirtual(userId)]).then(function(res) {
                return res[0].concat(res[1]);
            })
        }
    }
})();
