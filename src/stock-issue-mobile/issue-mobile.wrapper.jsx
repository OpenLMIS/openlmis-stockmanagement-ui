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
import IssueApp from './issue-app';
import { Provider } from "react-redux";
import store from "./store";
import MetaTags from 'react-meta-tags';

(function () {
    'use strict';

    angular
        .module('stock-issue-mobile')
        .directive('stockIssueMobile', stockIssueMobile);

        stockIssueMobile.$inject = ['facilityFactory', 'stockAdjustmentCreationService', 
            'orderableGroupService', 'offlineService', 'existingStockOrderableGroupsFactory', 'stockReasonsFactory'];

    function stockIssueMobile(facilityFactory, stockAdjustmentCreationService,
            orderableGroupService, offlineService, existingStockOrderableGroupsFactory, stockReasonsFactory) {
        return {
            template: '<div id="mobileApp" class="issue-mobile"></div>',
            replace: true,
            link: function ($scope) {
                const app = document.getElementById('mobileApp');
                const { adjustmentType } = $scope.$resolve;

                ReactDOM.render(
                    <Provider store={store}>
                        <MetaTags>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        </MetaTags>
                        <IssueApp
                            facilityFactory={facilityFactory}
                            existingStockOrderableGroupsFactory={existingStockOrderableGroupsFactory}
                            stockReasonsFactory={stockReasonsFactory}
                            offlineService={offlineService}
                        />
                    </Provider>,
                    app
                );
            }
        };
    }
})();
