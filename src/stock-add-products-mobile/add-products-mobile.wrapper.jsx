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

import { Route, Switch, HashRouter as Router } from 'react-router-dom';
import AddProductPage from './add-product-page';

(function () {
    'use strict';

    angular
        .module('stock-add-products-mobile')
        .directive('stockAddProductsMobile', stockAddProductsMobile);

    function stockAddProductsMobile(facilityFactory, orderableGroupService) {
        return {
            template: '<div id="mobileApp" class="physical-inventory-mobile"></div>',
            link: function () {
                const app = document.getElementById('mobileApp');

                ReactDOM.render(
                    <Router
                        basename="/stockmanagement/addProductMobile"
                        hashType="hashbang"
                    >
                        <Switch>
                            <Route path="">
                                <AddProductPage
                                    facilityFactory={facilityFactory}
                                    orderableGroupService={orderableGroupService}
                                    // programId={programId}
                                    // physicalInventoryId={physicalInventoryId}
                                    />
                            </Route>
                        </Switch>
                    </Router>,
                    app
                );
            }
        };
    }
})();
