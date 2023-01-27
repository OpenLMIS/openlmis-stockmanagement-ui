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
        .module('stock-on-hand-mobile')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.stockmanagement.stockOnHandMobile', {
            url: '/stockOnHandMobile',
            label: 'stockOnHand.onHand.mobile',
            isOffline: true,
            priority: 0,
            showInNavigation: false,
            showInNavigationOnLowResolutions: true,
            views: {
                '@': {
                    templateUrl: 'stock-on-hand-mobile/stock-on-hand-mobile.html'
                }
            },
            resolve: {
                facilityProgramData: function(facilityProgramCacheService, offlineService, $q) {
                    if (offlineService.isOffline()) {
                        return facilityProgramCacheService
                            .loadData('openlmis.stockmanagement.stockCardSummaries');
                    }
                    return $q.resolve();
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW]
        })
            .state('openlmis.stockmanagement.stockOnHandMobile.stockOnHand', {
                url: '/stockOnHand',
                isOffline: true,
                // showInNavigation: false,
                // showInNavigationOnLowResolutions: false,
                accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW]
            })
            .state('openlmis.stockmanagement.stockOnHandMobile.stockOnHand.facility', {
                url: '/facility',
                isOffline: true,
                accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW]
            })
            .state('openlmis.stockmanagement.stockOnHandMobile.stockOnHand.facility.program', {
                url: '/program',
                isOffline: true,
                accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW]
            });
    }
})();
