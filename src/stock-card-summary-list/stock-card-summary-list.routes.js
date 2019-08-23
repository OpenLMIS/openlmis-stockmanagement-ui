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
        .module('stock-card-summary-list')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.stockmanagement.stockCardSummaries', {
            url: '/stockCardSummaries?facility&program&supervised&page&size',
            label: 'stockCardSummaryList.stockOnHand',
            priority: 1,
            showInNavigation: true,
            views: {
                '@openlmis': {
                    controller: 'StockCardSummaryListController',
                    controllerAs: 'vm',
                    templateUrl: 'stock-card-summary-list/stock-card-summary-list.html'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW],
            resolve: {
                stockCardSummaries: function(paginationService, StockCardSummaryRepository,
                    StockCardSummaryRepositoryImpl, $stateParams, SiglusStockCardSummaryResource, user) {
                    return paginationService.registerUrl($stateParams, function(stateParams) {
                        if (stateParams.program) {
                            var paramsCopy = angular.copy(stateParams);

                            paramsCopy.facilityId = stateParams.facility;
                            paramsCopy.programId = stateParams.program;
                            paramsCopy.nonEmptyOnly = true;
                            paramsCopy.userId = user.user_id;
                            paramsCopy.rightName = 'STOCK_CARDS_VIEW';

                            delete paramsCopy.facility;
                            delete paramsCopy.program;
                            delete paramsCopy.supervised;

                            return new StockCardSummaryRepository(
                                new StockCardSummaryRepositoryImpl(
                                    new SiglusStockCardSummaryResource()
                                )
                            ).query(paramsCopy);

                        }
                        return [];
                    });
                },
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                facility: function(facilityFactory) {
                    return facilityFactory.getUserHomeFacility();
                }
            }
        });
    }
})();
