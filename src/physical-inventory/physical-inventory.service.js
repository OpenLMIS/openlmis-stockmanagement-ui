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
   * @name physical-inventory.physicalInventoryService
   *
   * @description
   * Responsible for retrieving all physical inventory information from server.
   */
  angular
    .module('physical-inventory')
    .service('physicalInventoryService', service);

  service.$inject = ['$q', '$resource', 'stockmanagementUrlFactory'];

  function service($q, $resource, stockmanagementUrlFactory) {

    var resource = $resource(stockmanagementUrlFactory('/api/physicalInventories/draft'), {}, {
      get: {method: 'GET'}
    });

    this.getDrafts = getDrafts;

    /**
     * @ngdoc method
     * @methodOf physical-inventory.physicalInventoryService
     * @name getDrafts
     *
     * @description
     * Retrieves physical inventory draft by facility and program.
     *
     * @param {Array}  programIds An array of program UUID
     * @param {String} facility   Facility UUID
     * @return {Promise}          physical inventory promise
     */
    function getDrafts(programIds, facility) {
      var promises = _.map(programIds, function (program) {
        return getDraft(program, facility);
      });

      return $q.all(promises)
    }

    function getDraft(program, facility) {
      var deferred = $q.defer();

      resource.get({program: program, facility: facility}, function (data) {
        deferred.resolve(data);
      }, function () {
        deferred.reject();
      });

      return deferred.promise;
    }
  }
})();
