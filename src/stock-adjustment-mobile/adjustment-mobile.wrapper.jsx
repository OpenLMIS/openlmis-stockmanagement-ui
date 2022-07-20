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
import AdjustmentApp from './adjustment-app';
import { Provider } from "react-redux";
import store from "./store";
import MetaTags from 'react-meta-tags';

(function () {
    'use strict';

    angular
        .module('stock-adjustment-mobile')
        .directive('stockAdjustmentMobile', stockAdjustmentMobile);

        stockAdjustmentMobile.$inject = ['facilityFactory', 'stockAdjustmentCreationService', 
            'orderableGroupService', 'offlineService', 'existingStockOrderableGroupsFactory', 'stockReasonsFactory', 'sourceDestinationService'];

    function stockAdjustmentMobile(facilityFactory, stockAdjustmentCreationService,
            orderableGroupService, offlineService, existingStockOrderableGroupsFactory, stockReasonsFactory, sourceDestinationService) {
        return {
            template: '<div id="mobileApp" class="adjustment-mobile"></div>',
            replace: true,
            link: function ($scope) {
                const app = document.getElementById('mobileApp');
                const { adjustmentType } = $scope.$resolve;

                ReactDOM.render(
                    <Provider store={store}>
                        <MetaTags>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        </MetaTags>
                        <AdjustmentApp
                            adjustmentType={adjustmentType}
                            facilityFactory={facilityFactory}
                            stockAdjustmentCreationService={stockAdjustmentCreationService}
                            orderableGroupService={orderableGroupService}
                            existingStockOrderableGroupsFactory={existingStockOrderableGroupsFactory}
                            stockReasonsFactory={stockReasonsFactory}
                            sourceDestinationService={sourceDestinationService}
                            offlineService={offlineService}
                        />
                    </Provider>,
                    app
                );
            }
        };
    }
})();
