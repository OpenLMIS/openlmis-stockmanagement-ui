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

import BaseField from './base-field';
import Input from '../inputs/input';

const InputField = ({ numeric, containerClass, ...props }) => {
    const inputClass = numeric ? 'number-field' : '';

    const fieldProps = numeric ? { ...props, inputMode: 'numeric', pattern: '[0-9]*' } : props;

    return (
        <BaseField
            renderInput={inputProps => (<Input {...inputProps}/>)}
            containerClass={containerClass ? `${containerClass} ${inputClass}` : inputClass}
            {...fieldProps}
        />
    );
};

export default InputField;
