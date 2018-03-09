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

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'SEARCH_OPTIONS',
        'ADJUSTMENT_TYPE', 'stockAdjustmentResolvesFactoryProvider'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS, SEARCH_OPTIONS, ADJUSTMENT_TYPE,
        stockAdjustmentResolvesFactoryProvider) {
        $stateProvider.state('openlmis.stockmanagement.adjustment.creation', {
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
                facility: undefined,
                stockCardSummaries: undefined,
                reasons: undefined,
                displayItems: undefined,
                addedLineItems: undefined
            },
            resolve: {
                program: function ($stateParams, programService) {
                    if (_.isUndefined($stateParams.program)) {
                        return programService.get($stateParams.programId);
                    }
                    return $stateParams.program;
                },
                facility: function ($stateParams, facilityFactory) {
                    if (_.isUndefined($stateParams.facility)) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                user: function (authorizationService) {
                    return authorizationService.getUser();
                },
                orderableGroups: stockAdjustmentResolvesFactoryProvider.$get().getApprovedOrderableGroups,
                displayItems: stockAdjustmentResolvesFactoryProvider.$get().registerDisplayItems,
                reasons: function ($stateParams, stockReasonsFactory, facility) {
                    if (_.isUndefined($stateParams.reasons)) {
                        return stockReasonsFactory.getAdjustmentReasons($stateParams.programId, facility.type.id);
                    }
                    return $stateParams.reasons;
                },
                adjustmentType: function () {
                    return ADJUSTMENT_TYPE.ADJUSTMENT;
                },
                srcDstAssignments: function () {
                    return undefined;
                }
            }
        });
    }
})();
