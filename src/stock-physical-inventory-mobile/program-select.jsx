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

import Select from '../react-components/inputs/select';
import { setDraft } from './reducers/physical-inventories';

const ProgramSelect = props => {
    const { physicalInventoryService, physicalInventoryFactory, offlineService, physicalInventoryDraftCacheService } = props;

    const dispatch = useDispatch();
    const facility = useSelector(state => state.facilities.userHomeFacility);

    const facilityId = facility.id;
    const programs = facility.supportedPrograms
        .map(p => {
            return {
                value: p.id,
                name: p.name
            };
        });

    const [physicalInventoryId, setPhysicalInventoryId] = useState(null);
    const [programId, setProgramId] = useState(null);

    const createDraft = () => {
        if (offlineService.isOffline()) {
            const id = `offline-${shortid.gen()}`;
            const draft = { id, facilityId, programId, lineItems: [] };

            physicalInventoryDraftCacheService.cacheDraft(draft);

            return new Promise( (resolve) => {
                resolve(draft);
            });
        }

        return physicalInventoryService.createDraft(programId, facilityId);
    };

    function getDraft() {
        return physicalInventoryDraftCacheService.searchDraft(programId, facilityId)
            .then(function(offlineDrafts) {
                if (offlineDrafts && offlineDrafts.length > 0 && offlineDrafts[0].id.startsWith('offline')) {
                    return offlineDrafts;
                }

                return physicalInventoryService.getDraft(programId, facilityId);
            });
    }

    const setPhysicalInventoryIdFromDraft = () => {
        getDraft()
            .then(
                drafts => {
                    if (drafts.length === 0) {
                        createDraft()
                            .then(draft => {
                                physicalInventoryFactory.getPhysicalInventory(draft)
                                    .then(inventoryDraft => {
                                        dispatch(setDraft(inventoryDraft));
                                        setPhysicalInventoryId(inventoryDraft.id);
                                    });
                            });
                    } else {
                        const draft = drafts[0];
                        physicalInventoryFactory.getPhysicalInventory(draft)
                            .then(inventoryDraft => {
                                dispatch(setDraft(inventoryDraft));
                                setPhysicalInventoryId(inventoryDraft.id);
                            });
                    }
                }
            );
    };

    if (physicalInventoryId !== null) {
        return <Redirect push to={`/${physicalInventoryId}`}/>;
    }

    return (
        <div className="page-container">
            <div className="page-header-responsive">
                <h2>Physical inventory</h2>
            </div>
            <div className="page-content">
                <Select
                    options={programs}
                    onChange={value => setProgramId(value)}
                />

                <button className="primary"
                        type="button"
                        style={{ marginTop: '0.5em' }}
                        disabled={!programId}
                        onClick={setPhysicalInventoryIdFromDraft}>
                    Start
                </button>
            </div>
        </div>
    );
};

export default ProgramSelect;
