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
import { useSelector, useDispatch } from 'react-redux';

import Input from '../react-components/inputs/input';
import { addData } from './reducers/testState.reducer';

const ReducerTest = () => {
    // First part of the selector is the name of the file with the reducer (the part before .reducer.jsx)
    // because name of the file is used in the combineReducers method in ui-layout module when reducers are loaded
    const testData = useSelector((state) => (state.testState.data));
    const dispatch = useDispatch();

    const [value, setValue] = useState('');

    return (
        <div>
            <div>Reducer test: </div>
            <div>{_.map(testData, data => (
                <div key={_.uniqueId('id-')}>
                    {data}
                </div>
            ))}
            </div>
            <div>
                <Input value={value} onChange={(val) => setValue(val)}/>
                <button onClick={() => dispatch(addData(value))} >Add</button>
            </div>
        </div>
    );
};

export default ReducerTest;
