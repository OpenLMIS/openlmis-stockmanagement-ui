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
import {Form} from "react-final-form";
import {Redirect, useRouteMatch} from "react-router-dom";
import Select from "./select";

const ProgramSelect = props => {
    const {programs, physicalInventoryService, facilityId} = props;
    const [physicalInventoryId, setPhysicalInventoryId] = useState(null);
    const {url} = useRouteMatch();

    const validate = values => {
        if (values.programId === '' || values.programId === undefined) {
            return {
                programId: 'Required'
            }
        }

        return {};
    };

    const onSubmit = (values) => {
        physicalInventoryService.getDraft(values.programId, facilityId)
            .then(
                drafts => {
                    if (drafts.length === 0) {
                        physicalInventoryService.createDraft(values.programId, facilityId)
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
        return <Redirect push to={url + physicalInventoryId}/>
    }

    return (
        <div className={'program-select'}>
            <Form
                initialValues={{
                    programId: ''
                }}
                validate={validate}
                onSubmit={onSubmit}
                render={({values, handleSubmit}) => {
                    return (
                        <form onSubmit={handleSubmit}>
                            <label>Select program</label>

                            <Select name="programId"
                                    value={values.programId}
                                    options={programs}
                            />

                            <input className={"submit-btn"} type="submit" value="Make Physical Inventory"/>
                        </form>
                    )
                }}
            />
        </div>
    );
}

export default ProgramSelect;
