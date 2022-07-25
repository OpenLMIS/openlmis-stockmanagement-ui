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
import { appendToAdjustment, resetAdjustment, setAdjustment } from './reducers/adjustment';
import { setProductOptions } from './reducers/product-options';
import { setReasons } from './reducers/reasons';
import { setProgram } from './reducers/program';
import { setSourceDestinations } from './reducers/source-destination';
import { setToastList } from './reducers/toasts';
import AddProductsPage from './add-products-page/add-product-page';
import EditProductPage from './edit-product-page/edit-product-page';
import AdjustmentForm from './adjustment-form.component';
import ProgramSelect from './program-select';
import { ADJUSTMENT } from './consts';

const AdjustmentApp = ({
    adjustmentType,
    facilityFactory,
    stockAdjustmentCreationService,
    orderableGroupService,
    existingStockOrderableGroupsFactory,
    stockReasonsFactory,
    sourceDestinationService,
    offlineService,
}) => {

    const dispatch = useDispatch();
    const userHomeFacility = useSelector(state => state[`facilitiesAdjustment`][`userHomeFacilityAdjustment`]);

    useEffect(() => facilityFactory.getUserHomeFacility().then(facility => dispatch(setUserHomeFacility(facility))), [facilityFactory]);

    const menu = document.getElementsByClassName("header ng-scope")[0];

    useEffect(() => menu.style.display = "", [menu]);

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
                                adjustmentType={ADJUSTMENT}
                                sourceDestinationService={sourceDestinationService}
                                setProductOptions={setProductOptions}
                                setReasons={setReasons}
                                setProgram={setProgram}
                                resetAdjustment={resetAdjustment}
                                setSourceDestinations={setSourceDestinations}
                                setToastList={setToastList}
                                orderableGroupService={orderableGroupService}
                            />
                        }
                    </Route>
                    <Route path="/makeAdjustmentAddProducts/submitAdjustment">
                        {   
                            userHomeFacility
                            && <AdjustmentForm
                                stockAdjustmentCreationService={stockAdjustmentCreationService}
                                offlineService={offlineService}
                                adjustmentType={ADJUSTMENT}
                                setToastList={setToastList}
                                resetAdjustment={resetAdjustment}
                            />
                        }
                    </Route>
                    <Route path="/makeAdjustmentAddProducts/editProductAdjustment">
                        {   
                            userHomeFacility
                            && <EditProductPage
                                adjustmentType={ADJUSTMENT}
                                offlineService={offlineService}
                                setToastList={setToastList}
                                setAdjustment={setAdjustment}
                            />
                        }
                    </Route>
                    <Route path="/makeAdjustmentAddProducts">
                        {   
                            userHomeFacility
                            && <AddProductsPage
                                adjustmentType={ADJUSTMENT}
                                appendToAdjustment={appendToAdjustment}
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
                                adjustmentType={ADJUSTMENT}
                                sourceDestinationService={sourceDestinationService}
                                setProductOptions={setProductOptions}
                                setReasons={setReasons}
                                setProgram={setProgram}
                                resetAdjustment={resetAdjustment}
                                setSourceDestinations={setSourceDestinations}
                                setToastList={setToastList}
                                orderableGroupService={orderableGroupService}
                            />
                        }
                    </Route>
                </Switch>
            </Router>
        </div>
    );
};

export default AdjustmentApp;
