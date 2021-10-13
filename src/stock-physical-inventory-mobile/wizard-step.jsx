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
import TrashButton from './buttons/trash-button';
import confirmAlertCustom from "./confirm";
import ProgressBar from "./progress-bar";
import { useHistory } from 'react-router-dom';

const WizardStep = ({ children, currentStep, stepsCount, previous, formInvalid, disableButtons,
                        physicalInventoryId, physicalInventoryService, physicalInventoryDraftCacheService}) => {
    const history = useHistory();
       

    const deleteDraft = () => {
        if (physicalInventoryId.startsWith('offline')) {
            physicalInventoryDraftCacheService.removeById(physicalInventoryId);
            history.replace('/');
        } else {
            physicalInventoryService.deleteDraft(physicalInventoryId)
            .then(() => history.replace('/'));
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <ProgressBar value={currentStep} max={stepsCount}/>
                <TrashButton
                    onClick={() => confirmAlertCustom({
                        title: 'Do you want to delete this draft?',
                        confirmLabel: 'Delete',
                        confirmButtonClass: 'danger',
                        onConfirm: () => deleteDraft()
                    })}
                />
            </div>
            <div className="form-body">{children}</div>
            <div className="form-footer">
                <button type="button" disabled={disableButtons || !currentStep || currentStep <= 1} onClick={() => previous()}>
                    <span><i className="fa fa-chevron-left pr-2" style={{marginRight: '0.5em'}}/>Previous</span>
                </button>
                {currentStep === stepsCount ?
                    <button type="submit" className="primary" disabled={formInvalid || disableButtons}>Submit</button>
                    :
                    <button type="submit" className="primary" disabled={formInvalid || disableButtons}>
                        <span>Next<i className="fa fa-chevron-right pl-2" style={{marginLeft: '0.5em'}}/></span>
                    </button>
                }
            </div>
        </div>
    );
};

export default WizardStep;
