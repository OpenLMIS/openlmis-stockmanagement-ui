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

import React, { useMemo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import RadioButton from '../../react-components/buttons/radio-button';
import Select from '../../react-components/inputs/select';
import InputWithSuggestions from '../../react-components/inputs/input-with-suggestions';

const ProgramSelect = ({ offlineService }) => {

    const convertIntoSelectOptions = (values) => {
      return values.map(({ id, name }) => ({ value: id, name }));
    };

    const facility = useSelector(state => state[`facilitiesStockOnHand`][`userHomeFacilityStockOnHand`]);
    const supervisedPrograms = useSelector(state => convertIntoSelectOptions(state[`programsStockOnHand`][`supervisedProgramsStockOnHand`]));
    const supervisedFacilities = useSelector(state => state[`facilitiesStockOnHand`][`supervisedFacilitiesStockOnHand`]);
    const programs = convertIntoSelectOptions(facility.supportedPrograms);
    
    const [facilityId, setFacilityId] = useState(null);
    const [programId, setProgramId] = useState(null);
    const [facilityType, setFacilityType] = useState('MyFacility');
    const [supervisedFacilitiesOptions, setSupervisedFacilitiesOptions] = useState([]);

    const radioChangeHandler = (e) => {
      if (facilityType !== e.target.value) {
        setFacilityType(e.target.value);
        setFacilityId(null);
        setProgramId(null);
      }
    };

    const supervisedProgramsHandler = (value) => {
      setProgramId(value);
      setSupervisedFacilitiesOptions(supervisedFacilities[value]);
    };
    
    const menu = document.getElementsByClassName('header ng-scope')[0];
    
    useEffect(() => menu.style.display = '', [menu, programId]);

    return (
        <>
            <div className='page-header-responsive'>
                <h2 id='program-select-header'>
                  Stock on Hand
                </h2>
            </div>
            <div className='page-content'>
                <label 
                  id='facility-type-header' 
                  style={{marginBottom: '4px', fontFamily: 'Arial', fontSize: '16px'}}
                >
                  Facility Type
                </label>
                <div>
                  <RadioButton
                      changed={radioChangeHandler}
                      id='1'
                      isSelected={facilityType === 'MyFacility'}
                      label={`My Facility `}
                      additionalInfo={`(${facility.name})`}
                      value='MyFacility'
                  />
                  <RadioButton
                      changed={radioChangeHandler}
                      id='2'
                      isSelected={facilityType === 'SupervisedFacility'}
                      label='Supervised Facility'
                      value='SupervisedFacility'
                      disabled={!supervisedPrograms}
                  />
                </div>
                <div style={{marginTop: '8px', marginBottom: '8px'}}>
                    <div className='required' style={{marginBottom: '4px', fontFamily: 'Arial', fontSize: '16px'}}>
                      <label id='facility-type-header'>
                        Program
                      </label>
                    </div>
                    {facilityType !== 'SupervisedFacility' ? 
                    <div className='field-full-width' style={{marginBottom: '8px'}}>
                        <Select
                          options={programs}
                          onChange={value => setProgramId(value)}
                        />
                    </div>
                    :
                      <>
                      <div className='field-full-width' style={{marginBottom: '8px'}}>
                        <Select
                          options={supervisedPrograms}
                          onChange={supervisedProgramsHandler}
                        />
                      </div>
                        <div className='required' style={{marginBottom: '4px', fontFamily: 'Arial', fontSize: '16px'}}> 
                          <label 
                            id='facility-type-header'
                          >
                            Facility
                          </label>
                        </div>
                        <div className='field-full-width' style={{marginBottom: '8px'}}>
                          <InputWithSuggestions 
                          data={supervisedFacilitiesOptions}
                          displayValue='name'
                          onClick={value => setFacilityId(value.id)}
                          sortFunction={(a, b) => a.name.localeCompare(b.name)}/>
                        </div>
                      </> 
                    }
                </div>
                <button 
                  className='primary'
                  type='button'
                  style={{ marginTop: '0.5em' }}
                  disabled={!programId && !facilityId}
                >
                  Search
                </button>
            </div>
        </>
    );
};

export default ProgramSelect;
