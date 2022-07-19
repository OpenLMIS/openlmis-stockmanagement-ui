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
import { appendToAdjustment } from './reducers/adjustment';
import { setProductOptions } from './reducers/product-options';
import { setReasons } from './reducers/reasons';
import { setProgram } from './reducers/program';
import { resetAdjustment } from './reducers/adjustment';
import { setSourceDestinations } from './reducers/source-destination';
import { setToastList } from './reducers/toasts';
import ProgramSelect from '../stock-adjustment-mobile/program-select';
import AddProductsPage from '../stock-adjustment-mobile/add-products-page/add-product-page';

const IssueApp = ({
        facilityFactory,
        existingStockOrderableGroupsFactory,
        stockReasonsFactory,
        sourceDestinationService,
        offlineService,
    }) => {

    const dispatch = useDispatch();
    const userHomeFacility = useSelector(state => state[`facilitiesIssue`][`userHomeFacilityIssue`]);

    useEffect(
        () => {
            facilityFactory.getUserHomeFacility()
                .then(facility => dispatch(setUserHomeFacility(facility)))
        },
        [facilityFactory]
    );

    const menu = document.getElementsByClassName("header ng-scope")[0];

    useEffect(() => {
        menu.style.display = "";
    }, [menu]);

    return (
        <div className="page-responsive-without-box">
            <Router
                basename="/stockmanagement/issueMobile"
                hashType="hashbang"
            >
                <Switch>
                    <Route path="/makeIssueAddProducts">
                        {   
                            userHomeFacility
                            && <AddProductsPage
                                adjustmentType="Issue"
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
                                adjustmentType="Issue"
                                sourceDestinationService={sourceDestinationService}
                                setProductOptions={setProductOptions}
                                setReasons={setReasons}
                                setProgram={setProgram}
                                resetAdjustment={resetAdjustment}
                                setSourceDestinations={setSourceDestinations}
                                setToastList={setToastList}
                            />
                        }
                    </Route>
                </Switch>
            </Router>
        </div>
    );
};

export default IssueApp;
