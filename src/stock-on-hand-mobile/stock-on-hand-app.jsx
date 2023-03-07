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

import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { setSupervisedProgramsStockOnHand } from './reducers/programs';
import { setUserHomeFacilityStockOnHand, setSupervisedFacilitiesStockOnHand } from './reducers/facilities';
import ProgramSelect from './pages/program-select';
import StockOnHand from './pages/stock-on-hand';
import ProductDetails from './pages/product-details';

const StockOnHandApp = ({
    asynchronousService,
    facilityFactory,
    offlineService,
    facilityService,
    programService,
    authorizationService,
    currentUserService,
    permissionService,
    StockCardSummaryRepository,
    stockCardService,
    messageService
}) => {

    const dispatch = useDispatch();
    const userHomeFacilityStore = useSelector(state => state[`facilitiesStockOnHand`][`userHomeFacilityStockOnHand`]);

    const getUserPrograms = (isSupervised, userHomeFacility, permissions, programs) => {

        const programIds = [];
        if (isSupervised) {
            permissions.forEach((permission) => {
                if (!userHomeFacility || (userHomeFacility && userHomeFacility.id !== permission.facilityId)) {
                    programIds.push(permission.programId);
                }
            });
        } else {
            if (!userHomeFacility) {
                return [];
            }

            permissions.forEach((permission) => {
                if (userHomeFacility.id === permission.facilityId) {
                    programIds.push(permission.programId);
                }
            });
        }

        const result = [];
        programs.forEach((program) => {
            if (programIds.indexOf(program.id) !== -1) {
                result.push(program);
            }
        });

        return result;
    };

    const getFacilityById = (facilities, id) => {
        return facilities.filter(function(facility) {
            return facility.id === id;
        })[0];
    };

    const getSupervisedFacilities = (programId, permissions, facilities) => {
        const facilityIds = [];
        permissions.forEach(function(permission) {
            if (programId === permission.programId) {
                facilityIds.push(permission.facilityId);
            }
        });

        const result = [];
        facilities.forEach(function(facility) {
            if (facilityIds.indexOf(facility.id) !== -1) {
                result.push(facility);
            }
        });
        return result;
    }

    const getSupervisedFacilitiesForAllPrograms = (programs, permissions, facilities) => {
        const result = {};
        programs.forEach((program) => {
            result[program.id] = getSupervisedFacilities(program.id, permissions, facilities);
        });

        return result;
    };

    const dispatchData = (actions) => {
        actions.forEach((action) => {
            dispatch(action);
        });
    };

    useEffect(() => {
        facilityFactory.getUserHomeFacility().then((facility) =>  {
            const userId = authorizationService.getUser().user_id;
            asynchronousService.all([
                facilityService.getAllMinimal(),
                programService.getUserPrograms(userId),
                permissionService.load(userId),
                currentUserService.getUserInfo()
            ])
                .then(function(responses) {
                    const [facilities, programs, permissions, currentUserDetails] = responses;

                    const homeFacility = getFacilityById(facilities, currentUserDetails.homeFacilityId);
                    const supervisedPrograms = getUserPrograms(true, homeFacility, permissions, programs);
                    const supervisedFacilities = getSupervisedFacilitiesForAllPrograms(programs, permissions, facilities);

                    dispatchData([
                        setUserHomeFacilityStockOnHand(facility),
                        setSupervisedProgramsStockOnHand(supervisedPrograms),
                        setSupervisedFacilitiesStockOnHand(supervisedFacilities)
                    ]);

                });
        });
    } ,[facilityFactory]);

    const menu = document.getElementsByClassName("header ng-scope")[0];

    useEffect(() => menu.style.display = "", [menu]);

    return (
        <div className='page-responsive-without-box'>
            <Router
                basename='/stockmanagement/stockOnHandMobile'
                hashType='hashbang'
            >
                <Switch>
                    <Route exact path='/stockOnHand/:facilityId/:programId/:productId'>
                        <ProductDetails 
                            stockCardService={stockCardService}
                            messageService={messageService}
                        />
                    </Route>
                    <Route exact path='/stockOnHand/:facilityId/:programId'>
                        {
                            userHomeFacilityStore &&
                            <StockOnHand
                                facilityService={facilityService}
                                programService={programService}
                                StockCardSummaryRepository={StockCardSummaryRepository}
                            />
                        }
                    </Route>
                    <Route path='/'>
                        {
                            userHomeFacilityStore &&
                            <ProgramSelect
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
