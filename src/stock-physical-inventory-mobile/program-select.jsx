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
import {Field, Form} from "react-final-form";
import {useHistory, useRouteMatch} from "react-router-dom";

const ProgramSelect = props => {
    const {programs} = props;
    const history = useHistory();
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
        history.push(`${url}/${values.programId}`);
    };

    return (
        <div>
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
                            <Field name="programId"
                                   component="select"
                                   value={values.programId}
                                   required>
                                <option/>
                                {
                                    programs.map(
                                        ({id, name}) => (
                                            <option key={id} value={id}>{name}</option>
                                        )
                                    )
                                }
                            </Field>

                            <input type="submit" value="Make Physical Inventory"/>
                        </form>
                    )
                }}
            />
        </div>
    );
}

export default ProgramSelect;
