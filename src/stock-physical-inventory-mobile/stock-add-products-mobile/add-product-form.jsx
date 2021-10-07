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

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Field, Form } from "react-final-form";
import { useDispatch } from "react-redux";
import { Redirect } from 'react-router-dom';
import SelectField from '../form-fields/select-field';
import { setProducts } from "../reducers/products";
import { TrashButton } from './button'

const AddProductForm = forwardRef((props, ref) => {
    const {orderableGroupService, productNames, index, item, removeProductFromArray, physicalInventoryId} = props;
    const [option, setOption] = useState([{name: "Product has no lots", value: null}]);
    const dispatch = useDispatch();

    const validate = values => {
        const errors = {};
        if (!values.product) {
            errors.product = 'Required'; 
        }
        if (!values.lotCode) {
            errors.lotCode = 'Required'; 
        }
        if (!values.quantity || typeof values.quantity !== 'number') {
            errors.quantity = 'Required'; 
        }
        return errors;
    };

    useImperativeHandle(ref, () => ({
        onSubmit: onSubmit
    }));

    const handleChange = (event) => {
        let selectedItem = productNames.find(x => x.value === event);
        setOption(orderableGroupService.lotsOf(selectedItem).length > 0
        ? orderableGroupService.lotsOf(selectedItem).map((lot)=>{
            let expirationDate = lot.expirationDate ? lot.expirationDate.toJSON().slice(0,10).replace(/-/g,'/') : "";
             return {name: (lot.lotCode + " / ")+ expirationDate, value: lot.id ? lot.id : "Lot code no defined" }})
        : [{name: "Product has no lots", value: null}])
    };
    
    const doNothing = () =>{}

    const onSubmit = (values) => {
        dispatch(setProducts(values));
        return <Redirect push to={`/${physicalInventoryId}`}/>
    };

    const updateDraft = (lineItem) => {
        return update(draft, {
            lineItems: {
                [lineItem.originalIndex]: {
                    quantity: {$set: lineItem.quantity},
                    isAdded: {$set: true}
                }
            }
        });
    };

    return (
        [<div className="form-element">
            <Form
                validate={validate}
                onSubmit={(values) =>onSubmit(values)}
                render={({values, handleSubmit}) => {
                    const isGreaterThanZero = index > 0;
                    return (
                        <form className="add-product-form" onSubmit={handleSubmit}>
                            <label>Product</label>
                            <SelectField
                                className="product-select"
                                onChange={(event) => handleChange(event)}
                                name="product"
                                value={values.product}
                                options={productNames}
                            />
                            {isGreaterThanZero ?
                            <TrashButton
                                onClick={() => removeProductFromArray(item)}
                            /> : <div></div>
                            }
                            <div className="lot-select">
                                <label>LOT / Expiry Date</label>
                                <SelectField
                                    onChange={doNothing}
                                    name="lotCode"
                                    value={values.lotCode}
                                    options={option}
                                />
                            </div>
                            <div className="soh-input">
                                <label>Stock on hand</label>
                                <Field name="quantity"
                                component="input"
                                value={values.quantity}
                                required>
                                </Field>
                            </div>
                        </form>
                        )
                }}
            />
        </div>]
    );
});

export default AddProductForm;
