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

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { setFacilityStockOnHand } from '../reducers/facilities';
import { setProgramStockOnHand } from '../reducers/programs';

const StockOnHand = ({ facilityService, programService }) => {
    const { facilityId, programId } = useParams();
    const dispatch = useDispatch();
    
    const facility = useSelector(state => state['facilitiesStockOnHand']['facilityStockOnHand']);
    const program = useSelector(state => state['programsStockOnHand']['programStockOnHand']);

    const downloadFacilityData = () => {
        return facilityService.get(facilityId).then((facility) => {
            dispatch(setFacilityStockOnHand(facility));
        });
    };

    const downloadProgramData = () => {
        return programService.get(programId).then((program) => {
            dispatch(setProgramStockOnHand(program));
        });
    };

    useEffect(() => {
        Promise.all([downloadFacilityData(), downloadProgramData()]);
    },[facilityId, programId]);

    return (
        <div className='page-header-responsive'>
            <h2 id='program-select-header'>
                { facility && program && `Stock on Hand - ${facility.name} - ${program.name}`}
            </h2>
        </div>
    );
};

export default StockOnHand;
