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
        .module('stock-receive-mobile')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'ADJUSTMENT_TYPE'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS, ADJUSTMENT_TYPE) {
        $stateProvider.state('openlmis.stockmanagement.receiveMobile', {
            url: '/receiveMobile',
            label: 'stockReceive.receive.mobile',
            isOffline: true,
            priority: 0,
            showInNavigation: false,
            showInNavigationOnLowResolutions: true,
            views: {
                '@': {
                    templateUrl: 'stock-receive-mobile/receive-mobile.html'
                }
            },
            resolve: {
                adjustmentType: function() {
                    return ADJUSTMENT_TYPE.ADJUSTMENT;
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST]
        })
            .state('openlmis.stockmanagement.receiveMobile.form', {
                url: '/makeReceiveAddProducts',
                isOffline: true,
                accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
                showInNavigation: false,
                showInNavigationOnLowResolutions: false
            })
            .state('openlmis.stockmanagement.receiveMobile.form.submitReceive', {
                url: '/submitReceive',
                isOffline: true,
                accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST]
            })
            .state('openlmis.stockmanagement.receiveMobile.form.submitReceive.programChoice', {
                url: '/programChoice',
                isOffline: true,
                accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST]
            })
            .state('openlmis.stockmanagement.receiveMobile.form.editProductReceive', {
                url: '/editProductReceive',
                isOffline: true,
                accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST]
            })
            .state('openlmis.stockmanagement.receiveMobile.form.addLotCode', {
                url: '/addLotCode',
                isOffline: true,
                accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
                showInNavigation: false,
                showInNavigationOnLowResolutions: false
            });
    }
})();
