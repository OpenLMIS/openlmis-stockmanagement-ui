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

import React, {useEffect, useState} from 'react';
import PhysicalInventoryForm from "./physical-inventory-form.component";
import ProgramSelect from "./program-select";
import {Route, Switch, useRouteMatch} from "react-router-dom";

const PhysicalInventoryApp = props => {
    const {facilityFactory, physicalInventoryFactory} = props;
    let {path} = useRouteMatch();

    const [facilityId, setFacilityId] = useState(null);
    const [programs, setPrograms] = useState([]);

    useEffect(
        () => {
            facilityFactory.getUserHomeFacility()
                .then(facility => {
                        setPrograms(
                            facility.supportedPrograms.map(p => {
                                return {
                                    id: p.id,
                                    name: p.name
                                }
                            })
                        );

                        setFacilityId(facility.id);
                    },
                )
        },
        [facilityFactory]
    );

    return (
        <div className={"physical-inventory-app"}>
            <h2>Physical inventory (Mobile)</h2>

            <Switch>
                <Route path={`${path}/:programId`}>
                    <PhysicalInventoryForm
                        physicalInventoryFactory={physicalInventoryFactory}
                        facilityId={facilityId}/>
                </Route>

                <Route exact path={path}>
                    <ProgramSelect programs={programs}/>
                </Route>
            </Switch>
        </div>
    )
}

export default PhysicalInventoryApp;
