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
    .module('stock-physical-inventory-draft')
    .config(routes);

  routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

  function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
    $stateProvider.state('openlmis.stockmanagement.physicalInventory.draft', {
      url: '/:programId/draft?keyword&page&size',
      views: {
        '@openlmis': {
          controller: 'PhysicalInventoryDraftController',
          templateUrl: 'stock-physical-inventory-draft/physical-inventory-draft.html',
          controllerAs: 'vm',
        }
      },
      accessRights: [STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT],
      params: {
        program: undefined,
        facility: undefined,
        draft: undefined,
        searchResult: undefined,
        isAddProduct: undefined
      },
      resolve: {
        program: function ($stateParams, programService) {
          if (_.isUndefined($stateParams.program)) {
            return programService.get(
              $stateParams.programId);
          }
          return $stateParams.program;
        },
        facility: function ($stateParams, facilityFactory) {
          if (_.isUndefined($stateParams.facility)) {
            return facilityFactory.getUserHomeFacility();
          }
          return $stateParams.facility;
        },
        draft: function ($stateParams, facility,
                         physicalInventoryService) {
          if (_.isUndefined($stateParams.draft)) {
            return physicalInventoryService.getDraft(
              $stateParams.programId, facility.id);
          }
          return $stateParams.draft;
        },
        displayLineItems: function (paginationService, physicalInventoryDraftService, $stateParams,
                                    $filter, draft) {
          var noValidation = function () {
            return true;
          };
          $stateParams.size = "@@STOCKMANAGEMENT_PAGE_SIZE";
          return paginationService.registerList(noValidation, $stateParams, function () {
            var searchResult = physicalInventoryDraftService.search($stateParams.keyword,
                                                                    draft.lineItems);
            var lineItems = $filter('orderBy')(searchResult, 'orderable.productCode');

            return _.chain(lineItems).filter(function (item) {
              var hasQuantity = !(_.isNull(item.quantity) || _.isUndefined(item.quantity));
              var hasSoh = !_.isNull(item.stockOnHand);
              return item.isAdded || hasQuantity || hasSoh;
            }).each(function (lineItem) {
              if (lineItem.quantity === -1) {
                lineItem.quantity = null;
              }
              lineItem.isAdded = true;
            }).value()
          });
        }
      }
    });
  }
})();

