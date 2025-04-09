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
   * @name stockmanagement-calculate.stockmanagementCalculateService
   *
   * @description
   * Responsible for calculations on stock related quantities
   */
    angular
        .module('stockmanagement')
        .service('stockmanagementCalculateService', service);

    service.$inject = [];

    function service() {

        this.recalculateSOHQuantity = recalculateSOHQuantity;

        function recalculateSOHQuantity(stockOnHand, netContent, inDoses) {
            if (inDoses) {
                return stockOnHand;
            }
            var packs = Math.floor(stockOnHand / netContent);
            var remainderDoses = stockOnHand % netContent;

            if (remainderDoses === 0) {
                return packs;
            }
            return packs + '  ( +' + remainderDoses + ' doses)';
        }

    }
})();
