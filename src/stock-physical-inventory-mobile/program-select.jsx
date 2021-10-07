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
import {useDispatch, useSelector} from "react-redux";

import Select from './inputs/select';
import { setSelectedProgram } from "./reducers/programs";
import { setDraft } from './reducers/physical-inventories';

const ProgramSelect = props => {
    const {physicalInventoryService, physicalInventoryFactory} = props;

    const dispatch = useDispatch();
    const facility = useSelector(state => state.facilities.userHomeFacility);

    const facilityId = facility.id;
    const programs = facility.supportedPrograms
        .map(p => {
            return {
                value: p.id,
                name: p.name
            }
        });

    const [physicalInventoryId, setPhysicalInventoryId] = useState(null);
    const [programId, setProgramId] = useState(null);

    const setPhysicalInventoryIdFromDraft = () => {
        physicalInventoryService.getDraft(programId, facilityId)
            .then(
                drafts => {
                    if (drafts.length === 0) {
                        physicalInventoryService.createDraft(programId, facilityId)
                            .then(draft => {
                                physicalInventoryFactory.getPhysicalInventory(draft)
                                    .then(inventoryDraft => {
                                        dispatch(setDraft(inventoryDraft));
                                        setPhysicalInventoryId(inventoryDraft.id);
                                    });
                                // dispatch(setDraft(draft));
                                // FIXME: Find proper program objectin home facility supported programs by programId
                                // dispatch(setSelectedProgram(program))

                            });
                    } else {
                        const draft = drafts[0];
                        physicalInventoryFactory.getPhysicalInventory(draft)
                            .then(inventoryDraft => {
                                dispatch(setDraft(inventoryDraft));
                                setPhysicalInventoryId(inventoryDraft.id);
                            });
                        // dispatch(setDraft(drafts[0]));
                        // dispatch(setSelectedProgram(program))
                        // setPhysicalInventoryId(drafts[0].id);
                    }
                }
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
                    onChange={value => setProgramId(value)}
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

// const mapStateToProps = (state) => {
//     return {
//         facility: state.facilities.userHomeFacility
//     }
// }
//
// const mapDispatchToProps = (dispatch) => {
//     return {
//         setDraft: (draft) => dispatch(setDraft(draft)),
//         selectProgram: (program) => dispatch(setSelectedProgram(program)),
//     }
// }


export default ProgramSelect;
