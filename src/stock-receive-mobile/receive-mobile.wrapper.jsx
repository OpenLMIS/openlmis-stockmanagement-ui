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
import ReceiveApp from './receive-app';
import { Provider } from "react-redux";
import store from '../stock-adjustment-mobile/store';
import MetaTags from 'react-meta-tags';

(function () {
    'use strict';

    angular
        .module('stock-receive-mobile')
        .directive('stockReceiveMobile', stockReceiveMobile);

        stockReceiveMobile.$inject = ['facilityFactory', 'stockAdjustmentCreationService', 
            'orderableGroupService', 'offlineService', 'existingStockOrderableGroupsFactory', 
            'stockReasonsFactory', 'sourceDestinationService', 'LotResource'];

    function stockReceiveMobile(facilityFactory, stockAdjustmentCreationService,
            orderableGroupService, offlineService, existingStockOrderableGroupsFactory, 
            stockReasonsFactory, sourceDestinationService, LotResource) {
        return {
            template: '<div id="mobileApp" class="receive-mobile"></div>',
            replace: true,
            link: function ($scope) {
                const app = document.getElementById('mobileApp');
                const lotResource = new LotResource();
                ReactDOM.render(
                    <Provider store={store}>
                        <MetaTags>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        </MetaTags>
                        <ReceiveApp
                            facilityFactory={facilityFactory}
                            existingStockOrderableGroupsFactory={existingStockOrderableGroupsFactory}
                            stockReasonsFactory={stockReasonsFactory}
                            sourceDestinationService={sourceDestinationService}
                            offlineService={offlineService}
                            stockAdjustmentCreationService={stockAdjustmentCreationService}
                            orderableGroupService={orderableGroupService}
                            lotResource={lotResource}
                        />
                    </Provider>,
                    app
                );
            }
        };
    }
})();
