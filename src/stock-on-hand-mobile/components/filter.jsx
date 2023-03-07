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
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

import React, { useState } from 'react';
import InputWithClearIcon from '../../react-components/inputs/input-with-clear-icon';
import Checkbox from '../../react-components/inputs/checkbox';

const Filter = ( { filters, onSubmit, onClick, queryParams, ...props } ) => {
    const [displayPopover, setDisplayPopover] = useState(false);
    const [numberOfFiltersApplied, setNumberOfFiltersApplied] = useState(0);

    const on = 'on';
    const checkbox = 'checkbox';
    const text = 'text';

    const filtersToDisplay = filters.map((filter) => {
        if (filter.type === text) {
        return (
            <>
                <label htmlFor={filter.name}>{filter.displayText}</label>
                <InputWithClearIcon id={filter.name} name={filter.name} key={filter.name}/>
            </>
        ); } else if (filter.type === checkbox) {
        return <Checkbox name={filter.name} displayText={filter.displayText} key={filter.name} className='filter-checkbox'/>
        }
    });

    const clearFilters = () => {
        document.getElementById('filter-form').reset();
    };

    const handleSearch = (event) => {
        event.preventDefault();
        const filterBy = [...event.target.elements].filter((element) => 
        ((element.type != checkbox && element.value !== '') || element.checked) 
        && filters.some((filter) => element.name.includes(filter.name)));
        
        const filterQueryParams = filterBy.reduce((prev, curr) => {
            return { 
                ...prev,
                [curr.name]: curr.value === on ? true : curr.value
            };
        }, {});

        const newQueryParams = { ...queryParams, ...filterQueryParams};

        onSubmit(newQueryParams).then(() => {
            setDisplayPopover(false);
            onClick();
            setNumberOfFiltersApplied(filterBy.length);
        });
    };

    return (
        <div className='filter-component' {...props}>
            <button 
                className={`filters ${numberOfFiltersApplied > 0 && 'is-active'}`}
                onClick={() => {
                    onClick();
                    setDisplayPopover(!displayPopover);
                }}
            >
                Filter {numberOfFiltersApplied > 0 && ` (${numberOfFiltersApplied})`}
            </button>
            <div 
                className={`openlmis-table-filters fade bottom in popover ${!displayPopover && 'hidden'}`}
            >
                <div className='arrow'/>
                <div className='popover-content'>
                    <i 
                    onClick={() => {
                        onClick();
                        clearFilters();
                        setDisplayPopover(false);
                    }}
                    className='fa fa-times clear-icon'
                    />
                    <form 
                        id='filter-form'
                        onSubmit={handleSearch}
                    >
                        <fieldset className='form-group'>
                            {filtersToDisplay}
                        </fieldset>
                        <div className='button-group'>
                            <input 
                                type='button'
                                className='clear-filters' 
                                value='Clear all filters'
                                onClick={clearFilters}/>
                            <input 
                                type='submit'
                                className='primary'
                                value='Search'
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Filter;