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

import React, { useEffect } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { setUserHomeFacility } from './reducers/facilities';
import AddProductsPage from './add-products-page/add-product-page';
import AdjustmentForm from './adjustment-form.component';
import ProgramSelect from './program-select';

const AdjustmentApp = props => {
    const {
        adjustmentType,
        facilityFactory,
        stockAdjustmentCreationService,
        orderableGroupService,
        existingStockOrderableGroupsFactory,
        stockReasonsFactory,
        offlineService,
    } = props;

    const dispatch = useDispatch();
    const userHomeFacility = useSelector(state => state.facilities.userHomeFacility);

    useEffect(
        () => {
            facilityFactory.getUserHomeFacility()
                .then(facility => {
                        dispatch(setUserHomeFacility(facility));
                    },
                )
        },
        [facilityFactory]
    );

    return (
        <div className="page-responsive-without-box">
            <Router
                basename="/stockmanagement/adjustmentMobile"
                hashType="hashbang"
            >
                <Switch>
                    <Route path="/makeAdjustmentAddProducts/submitAdjustment/programChoice">
                        {   
                            userHomeFacility
                            && <ProgramSelect
                                offlineService={offlineService}
                                stockReasonsFactory={stockReasonsFactory}
                                existingStockOrderableGroupsFactory={existingStockOrderableGroupsFactory}
                            />
                        }
                    </Route>
                    <Route path="/makeAdjustmentAddProducts/submitAdjustment">
                        {   
                            userHomeFacility
                            && <AdjustmentForm
                                stockAdjustmentCreationService={stockAdjustmentCreationService}
                                offlineService={offlineService}
                            />
                        }
                    </Route>
                    <Route path="/makeAdjustmentAddProducts">
                        {   
                            userHomeFacility
                            && <AddProductsPage
                                adjustmentType={adjustmentType}
                                offlineService={offlineService}
                            />
                        }
                    </Route>
                    <Route path="/">
                        {
                            userHomeFacility
                            && <ProgramSelect
                                offlineService={offlineService}
                                stockReasonsFactory={stockReasonsFactory}
                                existingStockOrderableGroupsFactory={existingStockOrderableGroupsFactory}
                            />
                        }
                    </Route>
                </Switch>
            </Router>
        </div>
    );
};

export default AdjustmentApp;
