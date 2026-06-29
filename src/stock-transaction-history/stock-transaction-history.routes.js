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
        .module('stock-transaction-history')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.stockmanagement.transactionHistory', {
            url: '/transactionHistory?facility&program&supervised' +
                '&type&startDate&endDate&documentNumber&page&size',
            label: 'stockTransactionHistory.title',
            priority: 5,
            showInNavigation: true,
            views: {
                '@openlmis': {
                    controller: 'TransactionHistoryListController',
                    controllerAs: 'vm',
                    templateUrl: 'stock-transaction-history/stock-transaction-history-list.html'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW],
            resolve: {
                params: function($stateParams) {
                    const params = angular.copy($stateParams);
                    params.facilityId = $stateParams.facility;
                    params.programId = $stateParams.program;
                    delete params.facility;
                    delete params.program;
                    delete params.supervised;
                    return params;
                },
                stockEvents: function(paginationService, TransactionHistoryResource, $stateParams,
                    params) {
                    return paginationService.registerUrl($stateParams, function(stateParams) {
                        if (stateParams.program && stateParams.facility) {
                            return new TransactionHistoryResource().query(params);
                        }
                        return undefined;
                    }, {
                        customPageParamName: 'page',
                        customSizeParamName: 'size',
                        paginationId: 'transactionHistoryList'
                    });
                }
            }
        })
            .state('openlmis.stockmanagement.transactionHistory.detail', {
                url: '/:stockEventId?detailPage&detailSize',
                showInNavigation: false,
                views: {
                    '@openlmis': {
                        controller: 'TransactionHistoryDetailController',
                        controllerAs: 'vm',
                        templateUrl:
                            'stock-transaction-history/stock-transaction-history-detail.html'
                    }
                },
                accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW],
                resolve: {
                    stockEvent: function($stateParams, TransactionHistoryResource) {
                        return new TransactionHistoryResource().get($stateParams.stockEventId);
                    },
                    lineItems: function($stateParams, paginationService,
                        TransactionHistoryResource) {
                        const resource = new TransactionHistoryResource();
                        return paginationService.registerUrl($stateParams, function(stateParams) {
                            return resource.getLineItems(stateParams.stockEventId, stateParams);
                        }, {
                            customPageParamName: 'detailPage',
                            customSizeParamName: 'detailSize',
                            paginationId: 'transactionDetail'
                        });
                    }
                }
            });
    }
})();
