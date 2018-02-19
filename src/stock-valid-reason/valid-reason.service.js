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
   * @name stock-valid-reason.validReasonService
   *
   * @description
   * Responsible for retrieving all valid reasons from server.
   */
  angular
    .module('stock-valid-reason')
    .service('validReasonService', service);

  service.$inject = ['$resource', 'stockmanagementUrlFactory'];

  function service($resource, stockmanagementUrlFactory) {

    var resource = $resource(stockmanagementUrlFactory('/api/validReasons'), {}, {
      remove: {
        method: 'DELETE',
        url: stockmanagementUrlFactory('/api/validReasons/:id')
      },
      search: {
        method: 'GET',
        isArray: true
      }
    });

    this.createValidReason = createValidReason;
    this.removeValidReason = removeValidReason;
    this.search = search;

    /**
     * @ngdoc method
     * @methodOf stock-valid-reason.validReasonService
     * @name createReason
     *
     * @description
     * Create a valid reason.
     *
     * @param  {Object} reason  valid reason
     * @return {Promise}        created valid reason
     */
    function createValidReason(reason) {
      return resource.save(reason).$promise;
    }

    /**
     * @ngdoc method
     * @methodOf stock-valid-reason.validReasonService
     * @name removeValidReason
     *
     * @description
     * Remove a valid reason.
     *
     * @param  {Object}   id  reason id to be removed
     * @return {Promise}      promise with empty response
     */
    function removeValidReason(id) {
      return resource.remove({id:id}).$promise;
    }

    /**
     * @ngdoc method
     * @methodOf stock-valid-reason.validReasonService
     * @name search
     *
     * @description
     * Retrieves a list of valid reasons matching the given program and facility type.
     *
     * @param   {String} program        uuid of program
     * @param   {String} facilityType   uuid of facility type
     * @param   {String} reasonTypes    the type of the reason
     * @return  {List}                  the list of all matching valid reasons
     */
    function search(program, facilityType, reasonTypes) {
        return resource.search({
            program: program,
            facilityType: facilityType,
            reasonType: reasonTypes
        }).$promise;
    }

  }
})();
