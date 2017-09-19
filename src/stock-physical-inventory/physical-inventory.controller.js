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
   * @name stock-physical-inventory.controller:PhysicalInventoryController
   *
   * @description
   * Controller for managing physical inventory.
   */
  angular
    .module('stock-physical-inventory')
    .controller('PhysicalInventoryController', controller);

  controller.$inject = ['facility', 'programs', 'drafts', 'messageService' , '$state', 'physicalInventoryService'];

  function controller(facility, programs, drafts, messageService, $state, physicalInventoryService) {
    var vm = this;

    /**
     * @ngdoc property
     * @propertyOf stock-physical-inventory.controller:PhysicalInventoryController
     * @name facility
     * @type {Object}
     *
     * @description
     * Holds user's home facility.
     */
    vm.facility = facility;

    /**
     * @ngdoc property
     * @propertyOf stock-physical-inventory.controller:PhysicalInventoryController
     * @name programs
     * @type {Array}
     *
     * @description
     * Holds available programs for home facility.
     */
    vm.programs = programs;

    vm.drafts = drafts;
    /**
     * @ngdoc method
     * @propertyOf stock-physical-inventory.controller:PhysicalInventoryController
     * @name getProgramName
     *
     * @description
     * Responsible for getting program name based on id.
     *
     * @param {String} id Program UUID
     */
    vm.getProgramName = function (id) {
      return _.find(vm.programs, function (program) {
        return program.id === id;
      }).name;
    };

    /**
     * @ngdoc method
     * @propertyOf stock-physical-inventory.controller:PhysicalInventoryController
     * @name getDraftStatus
     *
     * @description
     * Responsible for getting physical inventory status.
     *
     * @param {Boolean} isStarter Indicates starter or saved draft.
     */
    vm.getDraftStatus = function (isStarter) {
      if (isStarter) {
        return messageService.get('stockPhysicalInventory.notStarted');
      } else {
        return messageService.get('stockPhysicalInventory.draft');
      }
    };

    /**
     * @ngdoc method
     * @propertyOf stock-physical-inventory.controller:PhysicalInventoryController
     * @name editDraft
     *
     * @description
     * Navigating to draft physical inventory.
     *
     * @param {Object} draft Physical inventory draft
     */
    vm.editDraft = function (draft) {
      var program = _.find(vm.programs, function (program) {
        return program.id === draft.programId;
      });
      if (!draft.id) {
        physicalInventoryService.createDraft(program.id, facility.id).then(function (data) {
            draft.id = data.id;
            $state.go('openlmis.stockmanagement.physicalInventory.view', {
                id: draft.id,
                program: program,
                facility: facility,
                draft: draft
            });
        });
      }
      $state.go('openlmis.stockmanagement.physicalInventory.view', {
        id: draft.id,
        program: program,
        facility: facility,
        draft: draft
      });
    };
  }
})();
