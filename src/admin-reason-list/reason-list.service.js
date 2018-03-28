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
   * @name admin-reason-list.reasonService
   *
   * @description
   * Responsible for retrieving all stock line item reasons from server.
   */
  angular
    .module('admin-reason-list')
    .service('reasonService', service);

  service.$inject = ['$resource', 'stockmanagementUrlFactory'];

  function service($resource, stockmanagementUrlFactory) {

    var resource = $resource(stockmanagementUrlFactory('/api/stockCardLineItemReasons'), {}, {
      getAll: {method: 'GET', isArray: true},
      getReasonCategories: {
        method: 'GET',
        url: stockmanagementUrlFactory('/api/reasonCategories'),
        isArray: true
      },
      getReasonTypes: {
        method: 'GET',
        url: stockmanagementUrlFactory('/api/reasonTypes'),
        isArray: true
      }
    });

    this.getAll = getAll;

    this.getReasonCategories = getReasonCategories;

    this.getReasonTypes = getReasonTypes;

    this.createReason = createReason;

    /**
     * @ngdoc method
     * @methodOf admin-reason-list.reasonService
     * @name getAll
     *
     * @description
     * Retrieves all stock line item reasons.
     *
     * @return {Promise} stock line item reasons
     */
    function getAll() {
      return resource.getAll().$promise;
    }

    /**
     * @ngdoc method
     * @methodOf admin-reason-list.reasonService
     * @name getReasonCategories
     *
     * @description
     * Retrieves all stock line item reason categories.
     *
     * @return {Promise} stock line item reason categories
     */
    function getReasonCategories() {
      return resource.getReasonCategories().$promise;
    }

    /**
     * @ngdoc method
     * @methodOf admin-reason-list.reasonService
     * @name getReasonTypes
     *
     * @description
     * Retrieves all stock line item reason types.
     *
     * @return {Promise} stock line item reason types
     */
    function getReasonTypes() {
      return resource.getReasonTypes().$promise;
    }

    /**
     * @ngdoc method
     * @methodOf admin-reason-list.reasonService
     * @name createReason
     *
     * @description
     * Create a reason.
     *
     * @param {Object}   reason  reason to be created
     * @return {Promise} created reason
     */
    function createReason(reason) {
      return resource.save(reason).$promise;
    }
  }
})();
