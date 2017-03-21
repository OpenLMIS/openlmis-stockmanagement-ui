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
   * @name physical-inventory.controller:PhysicalInventoryController
   *
   * @description
   * Controller for managing physical inventory.
   */
  angular
    .module('physical-inventory')
    .controller('PhysicalInventoryController', controller);

  controller.$inject = ['facility', 'user', 'supervisedPrograms', 'homePrograms', 'messageService',
    'loadingModalService', 'facilityService'];

  function controller(facility, user, supervisedPrograms, homePrograms, messageService,
                      loadingModalService, facilityService) {
    var vm = this;

    /**
     * @ngdoc property
     * @propertyOf physical-inventory.controller:PhysicalInventoryController
     * @name isSupervised
     * @type {Boolean}
     *
     * @description
     * Holds currently selected facility selection type:
     *  false - my facility
     *  true - supervised facility
     */
    vm.isSupervised = false;

    /**
     * @ngdoc property
     * @propertyOf physical-inventory.controller:PhysicalInventoryController
     * @name facilities
     * @type {Array}
     *
     * @description
     * Holds available facilities based on the selected type and/or programs
     */
    vm.facilities = [];

    /**
     * @ngdoc property
     * @propertyOf physical-inventory.controller:PhysicalInventoryController
     * @name supervisedPrograms
     * @type {Array}
     *
     * @description
     * Holds available programs where user has supervisory permissions.
     */
    vm.supervisedPrograms = supervisedPrograms;
    vm.supervisedFacilitiesDisabled = supervisedPrograms.length <= 0;

    /**
     * @ngdoc property
     * @propertyOf physical-inventory.controller:PhysicalInventoryController
     * @name homePrograms
     * @type {Array}
     *
     * @description
     * Holds available programs for home facility.
     */
    vm.homePrograms = homePrograms;

    vm.loadFacilitiesForProgram = loadFacilitiesForProgram;

    vm.updateFacilityType = updateFacilityType;
    vm.updateFacilityType();

    /**
     * @ngdoc method
     * @methodOf physical-inventory.controller:PhysicalInventoryController
     * @name loadFacilityData
     *
     * @description
     * TODO
     *
     */
    function updateFacilityType() {
      vm.error = '';

      if (vm.isSupervised) {
        vm.programs = vm.supervisedPrograms;
        vm.facilities = [];
        vm.selectedFacilityId = undefined;
        vm.selectedProgramId = undefined;

        if (vm.programs.length === 1) {
          vm.selectedProgramId = vm.programs[0].id;
          loadFacilitiesForProgram(vm.programs[0].id);
        }
      } else {
        vm.programs = vm.homePrograms;
        vm.facilities = [facility];
        vm.selectedFacilityId = facility.id;
        vm.selectedProgramId = undefined;

        if (vm.programs.length <= 0) {
          vm.error = messageService.get('msg.no.program.available');
        } else if (vm.programs.length === 1) {
          vm.selectedProgramId = vm.programs[0].id;
        }
      }
    }

    /**
     * @ngdoc method
     * @methodOf physical-inventory.controller:PhysicalInventoryController
     * @name loadFacilitiesForProgram
     *
     * @description
     * Responsible for providing a list of facilities where selected program is active and
     * where the current user has supervisory permissions.
     *
     * @param {Object} selectedProgramId id of selected program where user has supervisory permissions
     */
    function loadFacilitiesForProgram(selectedProgramId) {
      if (selectedProgramId) {
        loadingModalService.open();

        var promises = [];

        //FIXME: We should check the permission based on user.
        var createRight = {id: "9ade922b-3523-4582-bef4-a47701f7df14"};
        var authorizeRight = {id: "feb4c0b8-f6d2-4289-b29d-811c1d0b2863"};
        promises.push(facilityService.getUserSupervisedFacilities(user.user_id, selectedProgramId, createRight.id));
        promises.push(facilityService.getUserSupervisedFacilities(user.user_id, selectedProgramId, authorizeRight.id));

        if (promises.length > 0) {
          $q.all(promises).then(function (facilities) {
            vm.facilities = _.flatten(facilities);

            if (vm.facilities.length <= 0) {
              vm.error = messageService.get('msg.no.facility.available');
            } else {
              vm.error = '';
            }
          }).catch(function (error) {
            // notificationService.error('msg.error.occurred');
          }).finally(loadingModalService.close());
        } else {
          // notificationService.error('error.noActionRight');
        }
      } else {
        vm.facilities = [];
      }
    }
  }
})();
