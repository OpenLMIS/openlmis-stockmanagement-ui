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
     * @name stock-reasons.stockReasonsFactory
     *
     * @description
     * Prepares the list of reasons based on the retrieved reason assignments.
     */
    angular
        .module('stock-reasons')
        .factory('stockReasonsFactory', stockReasonsFactory);

    stockReasonsFactory.$inject = ['$q', '$filter', 'validReasonsService'];

    function stockReasonsFactory($q, $filter, validReasonsService) {
        return {
            getReasons: getReasons
        };

        /**
         * @ngdoc method
         * @methodOf stock-reasons.stockReasonsFactory
         * @name getReasons
         *
         * @description
         * Retrieves a list of reason assignments and extract the list of reason from it.
         *
         * @param   {String}    program         the UUID of the program
         * @param   {String}    facilityType    the UUID of the facility type
         * @return  {Promise}                   the promise resolving to the list of reasons
         */
        function getReasons(program, facilityType) {
            var deferred = $q.defer();

            validReasonsService.get(
                program,
                facilityType
            ).then(function(reasonAssignments) {
                if (!reasonAssignments) {
                    deferred.reject('reason assignments must be defined');
                }

                reasonAssignments =  $filter('filter')(reasonAssignments, {
                    hidden: false
                });

                var reasons = [];

                angular.forEach(reasonAssignments, function(reasonAssignment) {
                    if (!$filter('filter')(reasons, {
                        id: reasonAssignment.reason.id
                    }).length) {
                        reasons.push(reasonAssignment.reason);
                    }
                });

                deferred.resolve(reasons);
            }, deferred.reject);

            return deferred.promise;
        }
    }

})();
