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
import { useHistory, useLocation } from 'react-router-dom';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import update from 'immutability-helper';

import BaseField from '../react-components/form-fields/base-field';
import DateInput from '../stock-adjustment-mobile/components/date-input.component';
import Input from '../react-components/inputs/input';
import AddButton from '../react-components/buttons/add-button';


const AddLotCodePage = ({ orderableGroupService, lotResource }) => {
    const history = useHistory();
    const location = useLocation();

    const menu = document.getElementsByClassName("header ng-scope")[0];
    menu.style.display = "none";

    useEffect(() => {
        location.state = location?.state ?? JSON.parse(localStorage.getItem('stateLocationLotCode'));
    }, [location]);

    const validate = values => {
        const errors = {};

        if (!values.lotCode) {
            errors['lotCode'] = { lotCode: 'Required' };
        }

        if (!values.expirationDate) {
            errors['expirationDate'] = { expirationDate: 'Required' };
        }

        return errors;
    };

    const cancel = () => {
        const currentFormValues = location.state.currentFormValues.hasOwnProperty('lot') ? update(location.state.currentFormValues, {lot: {['isFromAddLotCodePage']: {$set: true}}}) : location.state.currentFormValues;
        const stateLocation = {
            currentFormValues: currentFormValues
        };
        localStorage.setItem('stateLocationAddProduct', JSON.stringify(stateLocation));
        history.push({
            pathname: `/makeReceiveAddProducts`,
            state: stateLocation
        });
    };

    const onSubmit = (valuesOfNewLot) => {
        const orderable = location.state.currentFormValues.product;
        const selectedItem = orderableGroupService.findByLotInOrderableGroup(orderable, valuesOfNewLot, true);
        const selectedItemWithId = update(selectedItem, { lot: { ['isNewItem']: {$set: true}, ['tradeItemId']: {$set: orderable[0].orderable.identifiers.tradeItem}}})
        addLotCode(selectedItemWithId);
    };

    const addLotCode = (lineItem) => {
        lotResource.create(lineItem.lot).then(createResponse => {
            const updatedLineItem = update(lineItem, {lot: {['id']: {$set: createResponse.id}, ['isFromAddLotCodePage']: {$set: true}}});
            checkResponse(updatedLineItem, createResponse);
        }).catch(function(response) {
            checkResponse(lineItem, response);
        });
    };

    const checkResponse = (lineItem, response) => {
        const isBadResponse = response?.data?.message ?? false; 
        if (isBadResponse !== false) {
            const lineItemToReturn = update(location.state.currentFormValues, { $unset: ['lot'] });
            goToAddProductPage(lineItemToReturn);
        } else {
            const lineItemToReturn = update(location.state.currentFormValues, { product: { $push : [lineItem] }, ['lot']: { $set: lineItem.lot}});
            goToAddProductPage(lineItemToReturn);
        }
    };

    const goToAddProductPage = (lineItem) => {
        const stateLocation = {
            currentFormValues: lineItem
        };
        localStorage.setItem('stateLocationAddProduct', JSON.stringify(stateLocation));
        history.push({
            pathname: `/makeReceiveAddProducts`,
            state: stateLocation
        });
    }

    return (
        <div style={{marginBottom: "40px"}}>
            <Form
                initialValues={{}}
                onSubmit={onSubmit}
                validate={validate}
                mutators={{ ...arrayMutators }}
                render={({ handleSubmit, values, invalid }) => (
                    <form className="form-container" onSubmit={handleSubmit}>
                        <FieldArray name="items">
                            {({ fields }) => (                       
                                <div className="form-container">
                                    <div className="page-header-responsive">
                                        <div id="header-wrap" style={{marginBottom: "24px"}}>
                                            <h2 id="product-add-header">Add Lot Code</h2>
                                            <div className="button-inline-container">
                                                <i 
                                                    className="fa fa-times fa-3x" 
                                                    aria-hidden="true"
                                                    onClick={cancel}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-body">
                                        <BaseField
                                            renderInput={inputProps => (<Input {...inputProps}/>)}    
                                            name="lotCode"
                                            label="Lot code"
                                            containerClass='field-full-width required'
                                        />
                                        <BaseField
                                            renderInput={inputProps => (<DateInput {...inputProps}/>)}    
                                            name="expirationDate"
                                            label="Expiry Date"
                                            containerClass='field-full-width required'
                                        />
                                    </div>
                                    <AddButton
                                        type="submit"
                                        className="secondary"
                                        disabled={invalid}
                                        alwaysShowText
                                        style={{height: "40px", display: "inline-block", width: "90%", marginLeft: "5%", marginRight: "5%", marginTop: "16px"}}
                                    >Add Lot</AddButton>
                                    </div>
                            )}
                        </FieldArray>
                    </form>
                )}
            />
        </div>
    );
};

export default AddLotCodePage;
