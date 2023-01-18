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

import { setUserHomeFacilityStockOnHand } from './reducers/facilities';
import ProgramSelect from './pages/program-select';

const StockOnHandApp = ({
    facilityFactory,
    offlineService
}) => {

    const dispatch = useDispatch();
    const userHomeFacility = useSelector(state => state[`facilitiesStockOnHand`][`userHomeFacilityStockOnHand`]);

    useEffect(() => facilityFactory.getUserHomeFacility().then(facility => dispatch(setUserHomeFacilityStockOnHand(facility))), [facilityFactory]);

    const menu = document.getElementsByClassName('header ng-scope')[0];

    useEffect(() => menu.style.display = '', [menu]);

    return (
        <div className='page-responsive-without-box'>
            <Router
                basename='/stockmanagement/stockOnHandMobile'
                hashType='hashbang'
            >
                <Switch>
                    <Route path='/'>
                        {
                            userHomeFacility
                            && <ProgramSelect
                                offlineService={offlineService}
                            />
                        }
                    </Route>
                </Switch>
            </Router>
        </div>
    );
};

export default StockOnHandApp;
