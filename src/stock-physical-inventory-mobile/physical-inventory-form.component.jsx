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
import { useParams } from 'react-router-dom';
import olmisConfirmAlert from './confirm'
import WizardStep from './wizard-step';
import {useDispatch, useSelector} from "react-redux";
import {toggle} from "./reducers/example";
import { setLots } from "./reducers/lots";
import { setValidReasons } from "./reducers/valid-reasons";

const PhysicalInventoryForm = ({lots, physicalInventoryService, validReasons}) => {
    const {physicalInventoryId} = useParams();
    const [step, setStep] = useState(1);

    const exampleValue = useSelector(state => state.example.value);
    const dispatch = useDispatch();

    useEffect(
        () => {
            dispatch(setLots(lots));
            dispatch(setValidReasons(validReasons));
        },
        [lots, validReasons]
    );

    return (
        <div className="page-container">
            <div className="page-header-mobile">
                <h2>Physical Inventory {physicalInventoryId}</h2>
            </div>
            <WizardStep
                currentStep={step}
                stepsCount={5}
                next={() => setStep(step + 1)}
                previous={() => setStep(step - 1)}
                onSubmit={() => olmisConfirmAlert({
                    title: 'Do you want to submit this draft?',
                    confirmLabel: 'Yes, submit',
                    onConfirm: () => setStep(1)
                })}
                physicalInventoryId={physicalInventoryId}
                physicalInventoryService={physicalInventoryService}
            >
                <div>Physical Inventory Form</div>

                <p onClick={() => dispatch(toggle())}>
                    Example reducer: {exampleValue.toString()}
                </p>
            </WizardStep>
        </div>
    );
};

export default PhysicalInventoryForm
