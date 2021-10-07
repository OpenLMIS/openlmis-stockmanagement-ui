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
import PhysicalInventoryApp from './physical-inventory-app';
import { Provider } from "react-redux";
import store from "./store";

(function () {
    'use strict';

    angular
        .module('stock-physical-inventory-mobile')
        .directive('stockPhysicalInventoryMobile', stockPhysicalInventoryMobile);

    stockPhysicalInventoryMobile.$inject = ['facilityFactory', 'physicalInventoryService', 'physicalInventoryFactory',
        'physicalInventoryDraftCacheService', 'stockReasonsCalculations', 'orderableGroupService', 'offlineService'];

    function stockPhysicalInventoryMobile(facilityFactory, physicalInventoryService, physicalInventoryFactory,
                                          physicalInventoryDraftCacheService, stockReasonsCalculations,
                                          orderableGroupService, offlineService) {
        return {
            template: '<div id="mobileApp" class="physical-inventory-mobile"></div>',
            replace: true,
            link: function ($scope) {
                const app = document.getElementById('mobileApp');
                const {lots, validReasons} = $scope.$resolve;

                ReactDOM.render(
                    <Provider store={store}>
                        <PhysicalInventoryApp
                            lots={lots}
                            validReasons={validReasons}
                            physicalInventoryService={physicalInventoryService}
                            physicalInventoryFactory={physicalInventoryFactory}
                            physicalInventoryDraftCacheService={physicalInventoryDraftCacheService}
                            facilityFactory={facilityFactory}
                            stockReasonsCalculations={stockReasonsCalculations}
                            orderableGroupService={orderableGroupService}
                            offlineService={offlineService}
                        />
                    </Provider>,
                    app
                );
            }
        };
    }
})();
