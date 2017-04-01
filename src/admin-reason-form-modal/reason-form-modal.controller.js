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
   * @ngdoc controller
   * @name admin-reason-form-modal.controller:ReasonFormModalController
   *
   * @description
   * Exposes method for creating/updating reason to the modal view.
   */
  angular
    .module('admin-reason-form-modal')
    .controller('ReasonFormModalController', controller);

  controller.$inject = ['reasonTypes', 'reasonCategories', 'reasonService', 'modalDeferred'];

  function controller(reasonTypes, reasonCategories, reasonService, modalDeferred) {
    var vm = this;

    vm.$onInit = onInit;
    vm.createReason = createReason;

    /**
     * @ngdoc method
     * @methodOf admin-reason-form-modal.controller:ReasonFormModalController
     * @name $onInit
     *
     * @description
     * Initialization method of the ReasonFormModalController.
     */
    function onInit() {
      vm.reason = {};
      vm.reasonTypes = reasonTypes;
      vm.reasonCategories = reasonCategories;
    }

    /**
     * @ngdoc method
     * @methodOf admin-reason-form-modal.controller:ReasonFormModalController
     * @name createReason
     *
     * @description
     * Creates the reason.
     *
     * @return {Promise} the promise resolving to the created reason
     */
    function createReason() {
      return reasonService.createReason(vm.reason).then(function (reason) {
        modalDeferred.resolve(reason);
      });
    }

  }

})();
