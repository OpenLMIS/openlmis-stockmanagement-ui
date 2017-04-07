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

  angular
    .module('physical-inventory')
    .config(routes);

  routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

  function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
    $stateProvider.state('stockmanagement.physicalInventory', {
      url: '/physicalInventory',
      label: 'label.stockmanagement.physicalInventory',
      showInNavigation: true,
      controller: 'PhysicalInventoryController',
      controllerAs: 'vm',
      templateUrl: 'physical-inventory/physical-inventory.html',
      accessRights: [STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT],
      resolve: {
        facility: function (facilityFactory) {
          return facilityFactory.getUserHomeFacility();
        },
        user: function (authorizationService) {
          return authorizationService.getUser();
        },
        programs: function (programService, user) {
          return programService.getUserPrograms(user.user_id, true);
        },
        drafts: function (physicalInventoryService, programs, facility) {
          var programIds = _.map(programs, function (program) {
            return program.id;
          });

          return physicalInventoryService.getDrafts(programIds, facility.id);
        }
      }
    });
  }
})();

