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
import {Field, Form} from "react-final-form";
import {useHistory, useRouteMatch} from "react-router-dom";
import Select from '../stock-physical-inventory-mobile/select';
import BinButton from './bin-button'

const AddProductForm = props => {
    const {orderableGroupService, productNames, count, index, productArray, setProductArray, setCount} = props;
    const [option, setOption] = useState([{name: "Product has no lots", value: null}]);

    const validate = values => {
        if (values.product === '' || values.product === undefined) {
            return {
                product: 'Required'
            }
        }
        if (values.lotCode === '' || values.lotCode === undefined) {
            return {
                lotCode: 'Required'
            }
        }
        return {};
    };

    const onSubmit = (values) => {
        //what should be done on submit?
    };

    function removeProductForm(index, productArray) { 
        productArray.splice(index, 1);
        setProductArray(productArray);
        setCount(count-1);
    };


    function handleChange(event){
        let selectedItem = productNames.find(x => x.value === event.target.value);
        setOption(orderableGroupService.lotsOf(selectedItem).length > 0 
        ? orderableGroupService.lotsOf(selectedItem).map((lot)=>{ 
            let expirationDate = lot.expirationDate ? lot.expirationDate.toJSON().slice(0,10).replace(/-/g,'/') : "";
             return {name: (lot.lotCode + "   ")+ expirationDate, value: lot.id ? lot.id : "Lot code no defined" }})
        : [{name: "Product has no lots", value: null}])
    }
    const lotChange = () => {}
    
    return (
        <div className={'program-select'}>
            <Form
                validate={validate}
                onSubmit={onSubmit}
                render={({values, handleSubmit}) => {
                    return (
                        <form className="add-product-form" onSubmit={handleSubmit}>
                            <label>Product</label>
                            <Select className="product-select"
                                onChange={handleChange} 
                                name="product"
                                value={values.product}
                                options={productNames}
                                
                            />
                            <BinButton 
                                count={count}
                                index={index}
                                productArray={productArray}
                                removeProductForm={removeProductForm}
                            />
                            <div className="lot-select">
                                <label>LOT / Expiry Date</label>
                                <Select onChange={lotChange} 
                                        name="lotCode"
                                        value={values.lotCode}
                                        options={option}
                                />
                            </div>
                            <div className="soh-input">
                                <label>Stock on hand</label>
                                <Field name="programId"
                                component="input"
                                required>
                                </Field>
                            </div>
                        </form>
                        )
                }}
            />
        </div>
    );
}

export default AddProductForm;
