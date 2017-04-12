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
   * @name requisition-initiate.controller:RequisitionInitiateController
   *
   * @description
   * Controller responsible for actions connected with displaying available periods and
   * initiating or navigating to an existing requisition.
   */
  angular
    .module('stock-card-summaries')
    .controller('StockCardSummariesController', controller);

  controller.$inject = [
    'messageService', 'facility', 'user', 'supervisedPrograms', 'homePrograms',
    'loadingModalService', 'notificationService', 'authorizationService', '$q', 'facilityService'
  ];

  function controller(messageService, facility, user, supervisedPrograms,
                                homePrograms, loadingModalService, notificationService,
                                authorizationService, $q, facilityService) {
    var vm = this;


    /**
     * @ngdoc property
     * @propertyOf requisition-initiate.controller:RequisitionInitiateController
     * @name facilities
     * @type {Array}
     *
     * @description
     * Holds available facilities based on the selected type and/or programs
     */
    vm.facilities = [];

    /**
     * @ngdoc property
     * @propertyOf requisition-initiate.controller:RequisitionInitiateController
     * @name supervisedPrograms
     * @type {Array}
     *
     * @description
     * Holds available programs where user has supervisory permissions.
     */
    vm.supervisedPrograms = supervisedPrograms;

    /**
     * @ngdoc property
     * @propertyOf requisition-initiate.controller:RequisitionInitiateController
     * @name homePrograms
     * @type {Array}
     *
     * @description
     * Holds available programs for home facility.
     */
    vm.homePrograms = homePrograms;

    /**
     * @ngdoc property
     * @propertyOf requisition-initiate.controller:RequisitionInitiateController
     * @name isSupervised
     * @type {Boolean}
     *
     * @description
     * Holds currently selected facility selection type:
     *  false - my facility
     *  true - supervised facility
     */
    vm.isSupervised = false;

    vm.programOptionMessage = programOptionMessage;

    vm.updateFacilityType = updateFacilityType;

    vm.loadFacilitiesForProgram = loadFacilitiesForProgram;

    vm.updateFacilityType(vm.isSupervised);

    /**
     * @ngdoc method
     * @methodOf requisition-initiate.controller:RequisitionInitiateController
     * @name loadFacilityData
     *
     * @description
     * Responsible for displaying and updating select elements that allow to choose
     * program and facility to initiate or proceed with the requisition for.
     * If isSupervised is true then it will display all programs where the current
     * user has supervisory permissions. If the param is false, then list of programs
     * from user's home facility will be displayed.
     *
     * @param {Boolean} isSupervised indicates type of facility to initiate or proceed with the
     *   requisition for
     */
    function updateFacilityType(isSupervised) {

      vm.supervisedFacilitiesDisabled = vm.supervisedPrograms.length <= 0;

      if (isSupervised) {
        vm.error = '';
        vm.programs = vm.supervisedPrograms;
        vm.facilities = [];
        vm.selectedFacilityId = undefined;
        vm.selectedProgramId = undefined;

        if (vm.programs.length === 1) {
          vm.selectedProgramId = vm.programs[0].id;
          loadFacilitiesForProgram(vm.programs[0].id);
        }
      } else {
        vm.error = '';
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
     * @methodOf requisition-initiate.controller:RequisitionInitiateController
     * @name programOptionMessage
     *
     * @description
     * Determines a proper message for the programs dropdown, based on the presence of programs.
     *
     * @return {String} localized message
     */
    function programOptionMessage() {
      return vm.programs === undefined || _.isEmpty(vm.programs) ? messageService.get(
        'label.none.assigned') : messageService.get('label.select.program');
    }

    /**
     * @ngdoc method
     * @methodOf requisition-initiate.controller:RequisitionInitiateController
     * @name loadFacilitiesForProgram
     *
     * @description
     * Responsible for providing a list of facilities where selected program is active and
     * where the current user has supervisory permissions.
     *
     * @param {Object} selectedProgramId id of selected program where user has supervisory
     *   permissions
     */
    function loadFacilitiesForProgram(selectedProgramId) {
      if (selectedProgramId) {
        loadingModalService.open();
        var createRight = true, //authorizationService.getRightByName(REQUISITION_RIGHTS.REQUISITION_CREATE),
          authorizeRight = true, //authorizationService.getRightByName(REQUISITION_RIGHTS.REQUISITION_AUTHORIZE),
          promises = [];

        if (createRight) {
          promises.push(facilityService.getUserSupervisedFacilities(user.user_id, selectedProgramId,
                                                                    createRight.id))
        }
        if (authorizeRight) {
          promises.push(facilityService.getUserSupervisedFacilities(user.user_id, selectedProgramId,
                                                                    authorizeRight.id))
        }

        if (promises.length > 0) {
          $q.all(promises).then(function (facilities) {

            if (promises.length > 1) {
              vm.facilities = facilities[0].concat(facilities[1]);
            } else {
              vm.facilities = facilities[0];
            }

            if (vm.facilities.length <= 0) {
              vm.error = messageService.get('msg.no.facility.available');
            } else {
              vm.error = '';
            }
          })
            .catch(function (error) {
              notificationService.error('msg.error.occurred');
              loadingModalService.close();
            })
            .finally(loadingModalService.close());
        } else {
          notificationService.error('error.noActionRight');
        }
      } else {
        vm.facilities = [];
      }
    }

  }
})();
