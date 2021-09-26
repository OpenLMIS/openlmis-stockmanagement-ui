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

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import WizardStep from './wizard-step';

const PhysicalInventoryForm = () => {
    const { physicalInventoryId } = useParams();
    const [step, setStep] = useState(1);

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
                onSubmit={() => setStep(1)}
            >
                <div>Physical Inventory Form</div>
            </WizardStep>
        </div>
    );
};

export default PhysicalInventoryForm
