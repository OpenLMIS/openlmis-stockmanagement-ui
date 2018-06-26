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
   * @name stockmanagement.stockmanagementUrlFactory
   *
   * @description
   * Supplies application with stockmanagement URL.
   */
    angular
        .module('stockmanagement')
        .factory('stockmanagementUrlFactory', factory);

    factory.$inject = ['openlmisUrlFactory', 'pathFactory'];

    function factory(openlmisUrlFactory, pathFactory) {

        var stockmanagementUrl = '@@STOCKMANAGEMENT_SERVICE_URL';

        if (stockmanagementUrl.substr(0, 2) === '@@') {
            stockmanagementUrl = '';
        }

        /**
     * @ngdoc method
     * @methodOf stockmanagement.stockmanagementUrlFactory
     * @name stockmanagementUrlFactory
     *
     * @description
     * It parses the given URL and appends stockmanagement service URL to it.
     *
     * @param  {String} url stockmanagement URL from grunt file
     * @return {String}     stockmanagement URL
     */
        return function(url) {
            url = pathFactory(stockmanagementUrl, url);
            return openlmisUrlFactory(url);
        };
    }
})();
