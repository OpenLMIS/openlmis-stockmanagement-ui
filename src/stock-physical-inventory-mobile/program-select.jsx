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

import React, {useState} from 'react';
import {Redirect} from 'react-router-dom';
import Select from "./select";

const ProgramSelect = props => {
    const {programs, physicalInventoryService, facilityId} = props;
    const [physicalInventoryId, setPhysicalInventoryId] = useState(null);
    const [programId, setProgramId] = useState(null);

    const setPhysicalInventoryIdFromDraft = () => {
        physicalInventoryService.getDraft(programId, facilityId)
            .then(
                drafts => {
                    if (drafts.length === 0) {
                        physicalInventoryService.createDraft(programId, facilityId)
                            .then(draft => {
                                setPhysicalInventoryId(draft.id);
                            });
                    } else {
                        setPhysicalInventoryId(drafts[0].id);
                    }
                },
            );
    };

    if (physicalInventoryId !== null) {
        return <Redirect push to={`/${physicalInventoryId}`}/>
    }

    return (
        <div className="page-container">
            <div className="page-header-mobile">
                <h2>Physical inventory</h2>
            </div>
            <div className="page-content">
                <Select
                    options={programs}
                    onChange={ev => setProgramId(ev.target.value)}
                />

                <button className="primary"
                        type="button"
                        disabled={!programId}
                        onClick={setPhysicalInventoryIdFromDraft}>
                    Make Physical Inventory
                </button>
            </div>
        </div>
    );
};

export default ProgramSelect;
