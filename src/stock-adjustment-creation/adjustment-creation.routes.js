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
    .module('stock-adjustment-creation')
    .config(routes);

  routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'SEARCH_OPTIONS'];

  function routes($stateProvider, STOCKMANAGEMENT_RIGHTS, SEARCH_OPTIONS) {
    $stateProvider.state('openlmis.stockmanagement.createAdjustment', {
      url: '/adjustment/:programId/create?page&size&keyword',
      templateUrl: 'stock-adjustment-creation/adjustment-creation.html',
      controller: 'StockAdjustmentCreationController',
      controllerAs: 'vm',
      accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
      params: {
        program: undefined,
        facility: undefined,
        stockCardSummaries: undefined,
        reasons: undefined,
        displayItems: undefined,
        addedLineItems: undefined,
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
        stockCardSummaries: function ($stateParams, program, facility, stockCardSummariesService, paginationService) {
          paginationService.registerList(null, $stateParams, function () {
            return $stateParams.displayItems || [];
          });
          if (_.isUndefined($stateParams.stockCardSummaries)) {
            return stockCardSummariesService.getStockCardSummaries(program.id, facility.id,
              SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES);
          }
          return $stateParams.stockCardSummaries
        },
        reasons: function ($stateParams, reasonService) {
          if (_.isUndefined($stateParams.reasons)) {
            return reasonService.getAll().then(function (reasons) {
              return reasons.filter(function (reason) {
                return reason.reasonCategory === 'ADJUSTMENT';
              });
            });
          }
          return $stateParams.reasons;
        },
      }
    });
  }
})();

