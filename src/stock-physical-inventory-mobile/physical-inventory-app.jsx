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
import {useDispatch, useSelector} from "react-redux";
import { setUserHomeFacility } from "./reducers/facilities";
import AddProductPage from './stock-add-products-mobile/add-product-page';
import PhysicalInventoryForm from './physical-inventory-form.component';
import ProgramSelect from './program-select';

const PhysicalInventoryApp = props => {
    const {
        validReasons,
        facilityFactory,
        orderableGroupService,
        physicalInventoryService,
        physicalInventoryFactory,
        physicalInventoryDraftCacheService,
        stockReasonsCalculations,
        offlineService
    } = props;

    const dispatch = useDispatch();
    const userHomeFacility = useSelector(state => state.facilities.userHomeFacility);
    const draft = useSelector(state => state.physicalInventories.draft);

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
        <div className="page-mobile">
            <Router
                basename="/stockmanagement/physicalInventoryMobile"
                hashType="hashbang"
            >
                <Switch>
                    <Route path="/:physicalInventoryId/addProduct">
                        {
                            userHomeFacility
                            && draft
                            && <AddProductPage
                                facilityFactory={facilityFactory}
                                orderableGroupService={orderableGroupService}
                            />
                        }

                    </Route>
                    <Route path="/:physicalInventoryId">
                        {
                            userHomeFacility
                            && draft
                            && <PhysicalInventoryForm
                                validReasons={validReasons}
                                physicalInventoryService={physicalInventoryService}
                                physicalInventoryFactory={physicalInventoryFactory}
                                physicalInventoryDraftCacheService={physicalInventoryDraftCacheService}
                                stockReasonsCalculations={stockReasonsCalculations}
                                offlineService={offlineService}
                            />
                        }
                    </Route>
                    <Route path="/">
                        {
                            userHomeFacility
                            && <ProgramSelect
                                physicalInventoryService={physicalInventoryService}
                                physicalInventoryFactory={physicalInventoryFactory}
                                offlineService={offlineService}
                                physicalInventoryDraftCacheService={physicalInventoryDraftCacheService}
                            />
                        }
                    </Route>
                </Switch>
            </Router>
        </div>
    );
};

export default PhysicalInventoryApp;
