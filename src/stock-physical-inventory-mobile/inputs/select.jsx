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

import React from "react";

const Select = ({options = [], value, onChange, objectValue, ...props}) => {

    const handleChange = (event) => {
        const { value } = event.target;

        if (onChange) {
            if (value && objectValue) {
                onChange(JSON.parse(value));
            } else {
                onChange(value);
            }
        }
    };

    let selectValue = value;

    if (objectValue) {
        selectValue = JSON.stringify(value);
    }

    return (
        <select value={selectValue} onChange={handleChange} {...props}>
            <option/>
            {
                options.map(
                    ({value, name}) => {
                        let optionValue = value;

                        if (objectValue) {
                            optionValue = JSON.stringify(value);
                        }

                        return (<option key={optionValue} value={optionValue}>{name}</option>)
                    }
                )
            }
        </select>
    );
};

export default Select;
