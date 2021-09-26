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

import ProgressBar from "./progress-bar";

const WizardStep = ({ children, currentStep, stepsCount, previous, next, onSubmit }) => (
    <div className="wizard-container">
        <div className="wizard-header">
            <ProgressBar value={currentStep} max={stepsCount} />
        </div>
        <div className="wizard-body">{children}</div>
        <div className="wizard-footer">
            <button type="button" disabled={!currentStep || currentStep <= 1} onClick={() => previous()}>
                <span><i className="fa fa-chevron-left pr-2" style={{ marginRight: '0.5em' }}/>Previous</span>
            </button>
            { currentStep === stepsCount ?
                <button type="button" className="primary" onClick={() => onSubmit()}>Submit</button>
                :
                <button type="button" className="primary" onClick={() => next()}>
                    <span>Next<i className="fa fa-chevron-right pl-2" style={{ marginLeft: '0.5em' }}/></span>
                </button>
            }
        </div>
    </div>
);

export default WizardStep;
