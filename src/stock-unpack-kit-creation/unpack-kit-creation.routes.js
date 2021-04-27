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

(function() {
    'use strict';

    angular
        .module('stock-unpack-kit-creation')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SEARCH_OPTIONS',  'STOCKMANAGEMENT_RIGHTS', 'ADJUSTMENT_TYPE'];

    function routes($stateProvider, SEARCH_OPTIONS, STOCKMANAGEMENT_RIGHTS, ADJUSTMENT_TYPE) {
        $stateProvider.state('openlmis.stockmanagement.kitunpack.creation', {
            url: '/:programId/create?page&size&keyword',
            views: {
                '@openlmis': {
                    controller: 'StockAdjustmentCreationController',
                    templateUrl: 'stock-adjustment-creation/adjustment-creation.html',
                    controllerAs: 'vm'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
            params: {
                program: undefined,
                addedLineItems: undefined,
                facility: undefined,
                stockCardSummaries: undefined,
                displayItems: undefined,
                reasons: undefined
            },
            resolve: {
                facility: function(facilityFactory, $stateParams) {
                    if (!$stateParams.facility) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                program: function(programService, $stateParams) {
                    if (!$stateParams.program) {
                        return programService.get($stateParams.programId);
                    }
                    return $stateParams.program;
                },
                orderableGroups: function($stateParams, existingStockOrderableGroupsFactory, program, facility,
                    orderableGroupService) {
                    return existingStockOrderableGroupsFactory
                        .getGroupsWithNotZeroSoh($stateParams, program, facility)
                        .then(function(orderableGroups) {
                            return orderableGroupService.getKitOnlyOrderablegroup(orderableGroups);
                        });
                },
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                reasons: function($stateParams, facility, stockReasonsFactory) {
                    if (!$stateParams.reasons) {
                        return stockReasonsFactory.getUnpackReasons($stateParams.programId, facility.type.id);
                    }
                    return $stateParams.reasons;
                },
                displayItems: function(registerDisplayItemsService, $stateParams) {
                    return registerDisplayItemsService($stateParams);
                },
                srcDstAssignments: function() {
                    return null;
                },
                adjustmentType: function() {
                    return ADJUSTMENT_TYPE.KIT_UNPACK;
                }
            }
        });
    }
})();
