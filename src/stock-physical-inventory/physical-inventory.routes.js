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
    .module('stock-physical-inventory')
    .config(routes);

  routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

  function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
    $stateProvider.state('openlmis.stockmanagement.physicalInventory', {
      url: '/physicalInventory',
      label: 'stockPhysicalInventory.physicalInventory',
      showInNavigation: true,
      views: {
        '@openlmis': {
          templateUrl: 'stock-physical-inventory/physical-inventory.html',
          controller: 'PhysicalInventoryController',
          controllerAs: 'vm',
        }
      },
      accessRights: [STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT],
      resolve: {
        facility: function (facilityFactory) {
          return facilityFactory.getUserHomeFacility();
        },
        user: function (authorizationService) {
          return authorizationService.getUser();
        },
        programs: function (user, stockProgramUtilService) {
          return stockProgramUtilService.getPrograms(user.user_id, STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT);
        },
        drafts: function (physicalInventoryService, programs, facility) {
          if (_.isUndefined(facility)) {
            return [];
          }
          var programIds = _.map(programs, function (program) {
            return program.id;
          });

          return physicalInventoryService.getDrafts(programIds, facility.id);
        }
      }
    });
  }
})();

