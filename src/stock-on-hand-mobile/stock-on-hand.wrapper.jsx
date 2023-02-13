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

import React from 'react';
import ReactDOM from 'react-dom';
import StockOnHandApp from './stock-on-hand-app';
import { Provider } from 'react-redux';
import store from './store';
import MetaTags from 'react-meta-tags';

(function () {
    'use strict';

    angular
        .module('stock-on-hand-mobile')
        .directive('stockOnHandMobile', stockOnHandMobile);

        stockOnHandMobile.$inject = ['$q', 'facilityFactory', 'offlineService', 'facilityService', 'programService', 
        'authorizationService', 'currentUserService', 'permissionService', 'StockCardSummaryRepositoryImpl'];

    function stockOnHandMobile($q, facilityFactory, offlineService, facilityService, programService, 
        authorizationService, currentUserService, permissionService, StockCardSummaryRepositoryImpl) {

        return {
            template: '<div id="mobileApp" class="stock-on-hand-mobile"></div>',
            replace: true,
            link: function () {
                const app = document.getElementById('mobileApp');

                ReactDOM.render(
                    <Provider store={store}>
                        <MetaTags>
                            <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
                        </MetaTags>
                        <StockOnHandApp
                            asynchronousService={$q}
                            facilityFactory={facilityFactory}
                            offlineService={offlineService}
                            facilityService={facilityService}
                            programService={programService}
                            authorizationService={authorizationService}
                            currentUserService={currentUserService}
                            permissionService={permissionService}
                            StockCardSummaryRepository={StockCardSummaryRepositoryImpl}
                        />
                    </Provider>,
                    app
                );
            }
        };
    }
})();
