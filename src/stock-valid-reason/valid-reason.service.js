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
     * @name stock-valid-reason.validReasonService
     *
     * @description
     * Responsible for managing valid reasons resouce.
     */
    angular
        .module('stock-valid-reason')
        .service('validReasonService', validReasonService);

        validReasonService.$inject = ['$resource', 'stockmanagementUrlFactory'];

    function validReasonService($resource, stockmanagementUrlFactory) {
        var resource = $resource(stockmanagementUrlFactory('/api/validReasons/:id'));

        this.query = query;
        this.create = create;
        this.remove = remove;

        /**
         * @ngdoc method
         * @methodOf stock-valid-reason.validReasonService
         * @name query
         *
         * @description
         * Retrieves the list of valid reason assignments based on given params
         * 
         * @param  {String}  program        the UUID of the program
         * @param  {String}  facilityTypeId the UUID of the facility type
         * @param  {Object}  reasonType     the reason types, can be an array
         * @return {Promise}                the promise resolving to the list of valid reason assignments
         */
        function query(program, facilityType, reasonType) {
            return resource.query({
                facilityType: facilityType,
                program: program,
                reasonType: reasonType
            }).$promise;
        }
      
        /**
         * @ngdoc method
         * @methodOf stock-valid-reason.validReasonService
         * @name create
         *
         * @description
         * Create a valid reason.
         *
         * @param  {Object} reason valid reason
         * @return {Promise}       created valid reason
         */
        function create(reason) {
            return resource.save(reason).$promise;
        }
      
        /**
         * @ngdoc method
         * @methodOf stock-valid-reason.validReasonService
         * @name remove
         *
         * @description
         * Remove a valid reason.
         *
         * @param  {Object}   id  reason id to be removed
         * @return {Promise}      promise with empty response
         */
        function remove(id) {
            return resource.remove({
                id: id
            }).$promise;
        }
    }
})();
