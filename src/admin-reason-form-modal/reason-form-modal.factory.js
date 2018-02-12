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
   * @name admin-reason-form-modal.ReasonFormModal
   *
   * @description
   * Represents a single reason form modal. It gives the ability to create the given reason.
   */
  angular
    .module('admin-reason-form-modal')
    .factory('ReasonFormModal', reasonFormModalFactory);

  reasonFormModalFactory.$inject = ['openlmisModalService'];

  function reasonFormModalFactory(openlmisModalService) {

    return ReasonFormModal;

    /**
     * @ngdoc method
     * @methodOf admin-reason-form-modal.ReasonFormModal
     * @name ReasonFormModal
     *
     * @description
     * Opens a modal allowing creating stock line item reason.
     *
     * @return {Promise} the promise resolving to the new reason
     */
    function ReasonFormModal(reasons) {
      return openlmisModalService.createDialog({
        controller: 'ReasonFormModalController',
        controllerAs: 'vm',
        templateUrl: 'admin-reason-form-modal/reason-form-modal.html',
        show: true,
        resolve: {
          reasonTypes: function (reasonService) {
            return reasonService.getReasonTypes();
          },
          reasonCategories: function (reasonService) {
            return reasonService.getReasonCategories();
          },
          programs: function (programService) {
            return programService.getAll();
          },
          facilityTypes: function (facilityTypeService) {
            return facilityTypeService.query();
          },
          reasons: function () {
            return reasons;
          }
        }
      }).promise;
    }
  }

})();
