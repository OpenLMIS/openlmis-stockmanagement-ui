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
     * @name stock-reasons.validReasonsService
     *
     * @description
     * Responsible for communication with the OpenLMIS server.
     */
    angular
        .module('stock-reasons')
        .service('validReasonsService', validReasonsService);

    validReasonsService.$inject = ['$resource', 'stockmanagementUrlFactory'];

    function validReasonsService($resource, stockmanagementUrlFactory) {
        var resource = $resource(stockmanagementUrlFactory('/api/validReasons'), {}, {});

        this.get = get;

        /**
         * @ngdoc method
         * @methodOf stock-reasons.validReasonsService
         * @name get
         *
         * @description
         * Retrieves the list of valid reason assignments.
         *
         * @param   {String}    program         the UUID of the program
         * @param   {String}    facilityTypeId  the UUID of the facility type
         * @return  {Promise}                   the promise resolving to the list of valid reason
         *                                      assignments
         */
        function get(program, facilityType) {
            return resource.query({
                facilityType: facilityType,
                program: program
            }).$promise;
        }
    }

})();
