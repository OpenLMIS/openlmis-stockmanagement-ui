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

import React, { useMemo, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import createDecorator from 'final-form-calculate';
import update from 'immutability-helper';

import InlineField from '../../react-components/form-fields/inline-field';
import InputField from '../../react-components/form-fields/input-field';
import SelectField from '../../react-components/form-fields/select-field';
import ReadOnlyField from '../../react-components/form-fields/read-only-field';
import BaseField from '../../react-components/form-fields/base-field';
import DateInput from '../components/date-input.component';
import Input from '../../react-components/inputs/input';
import { formatLot, formatDateISO, isQuantityNotFilled, maxDateToday, removeProperty } from '../format-utils';
import AddButton from '../../react-components/buttons/add-button';
import { CREDIT, ISSUE, RECEIVE } from '../consts';


const AddProductsPage = ({ adjustmentType, appendToAdjustment }) => {
    const history = useHistory();
    const location = useLocation();
    const dispatch = useDispatch();
    
    const userHomeFacility = useSelector(state => state[`facilities${adjustmentType}`][`userHomeFacility${adjustmentType}`]);
    const productOptions = useSelector(state => state[`productOptions${adjustmentType}`][`productOptions${adjustmentType}`]);
    const reasons = useSelector(state => state[`reasons${adjustmentType}`][`reasons${adjustmentType}`]);
    const adjustment = useSelector(state => state[`adjustment${adjustmentType}`][`adjustment${adjustmentType}`]);
    const program = useSelector(state => state[`program${adjustmentType}`][`program${adjustmentType}`]);
    const sourceDestinations = useSelector(state => state[`sourceDestinations${adjustmentType}`][`sourceDestinations${adjustmentType}`]);

    const menu = document.getElementsByClassName("header ng-scope")[0];
    menu.style.display = "none";

    useEffect(() => {
        location.state = location?.state ?? null;
    }, [location]);

    const decorator = useMemo(() => createDecorator({
        field: /product/,
        updates: {
            stockOnHand: (productVal, itemsVal) => {
                const orderable = itemsVal.items[0]?.product ?? [];
                const lotCode = null; 
                return getStockOnHand(orderable, lotCode);
            },
            items: (productVal, itemsVal) => {
                let newItemsVal = itemsVal;
                if (newItemsVal.items[0].hasOwnProperty('lot')) {
                    if ((newItemsVal.items[0].lot?.isFromAddLotCodePage ?? false) === false) {
                        return update(newItemsVal.items, {0: { $unset: ['lot'] } });
                    }    
                }
                return newItemsVal.items;
            }
        }
    },
    {
        field: /lot/,
        updates: {
            stockOnHand: (productVal, itemsVal) => {
                const orderable = itemsVal.items[0]?.product ?? [];
                const lotCode = itemsVal.items[0]?.lot?.lotCode ?? null;
                return getStockOnHand(orderable, lotCode);
            }
        }
    }
    ), []);

    const validate = values => {
        const errors = { items: [] };

        values.items.forEach(item => {
            let orderable = item.product;
            if (!item.product) {
                errors.items['product'] = { product: 'Required' };
                orderable = [];
            }

            if (isQuantityNotFilled(item.quantity)) {
                errors.items['quantity'] = { quantity: 'Required' };
            }

            if (!item.occurredDate) {
                errors.items['occurredDate'] = { occurredDate: 'Required' };
            }

            if (!item.reason) {
                errors.items['reason'] = { reason: 'Required' };
            } else {
                const stockOnHandQuantity = getStockOnHand(orderable, item?.lot?.lotCode ?? null);
                if (!errors.items.hasOwnProperty('quantity')) {
                    if (item.reason.reasonType !== CREDIT && item.quantity > stockOnHandQuantity) {
                        errors.items['quantity'] = { quantity: 'Quantity cannot be greater than stock on hand value.' };
                    }
                }
            }
               
            if (adjustmentType === ISSUE || adjustmentType === RECEIVE) {
                if (!item.assignment) {
                    errors.items['assignment'] = { issueTo: 'Required' };
                }
            }
        });

        return errors;
    };

    const getStockOnHand = (orderable, lotCode) => {
        let returnedStock = null;
        orderable.forEach(product => {
            const productLotCode = product?.lot?.lotCode ?? null;
            if (lotCode === productLotCode) {
                returnedStock = product.stockOnHand;
            }
        });
        return returnedStock;
    };

    const cancel = () => {
        if (!adjustment.length) { 
            history.push(`/make${adjustmentType}AddProducts/submit${adjustmentType}/programChoice`);
        }
        else {
            history.push(`/make${adjustmentType}AddProducts/submit${adjustmentType}`);
        }
    };

    const updateAdjustmentList = (values) => {
        values.reasonFreeText = null;
        values.occurredDate = values.items[0]?.occurredDate ?? formatDateISO(new Date());
        if (adjustmentType === ISSUE || adjustmentType === RECEIVE) {
            values.assignment = values.items[0].assignment;
            values.assigmentName = values.items[0].assignment.name;
            if (values.assignment.isFreeTextAllowed ) {
                values.srcDstFreeText = values.items[0]?.srcDstFreeText ?? "";
            }
        }
        values.reason = values.items[0].reason;
        values.reasonName = values.reason.name;
        values.lot = values.items[0]?.lot ?? null;
        values.displayLotMessage = values?.lot?.lotCode ?? "No lot defined";
        values.quantity = values.items[0].quantity;

        const productInformation = values.items[0].product;
        const lotCode = values?.lot?.lotCode ?? null;
        productInformation.forEach(prod => {
            const productLotCode = prod?.lot?.lotCode ?? null;
            if (lotCode === productLotCode) {
                values.orderable = prod.orderable;
                values.stockCard = prod.stockCard;
                values.productName = prod.orderable.fullProductName;
                values.productNameWithReason = prod.orderable.fullProductName + " (" + values.reasonName + ")";
            }
        });

        dispatch(appendToAdjustment(values));
    }

    const onSubmit = (values) => {
        updateAdjustmentList(values);
        location.state = null;
        history.push(`/make${adjustmentType}AddProducts/submit${adjustmentType}`);
    };

    const onSubmitAddProduct = (values) => {
        updateAdjustmentList(values);
        location.state = null;
        history.push(`/make${adjustmentType}AddProducts`);
    };

    const getLotsOptions = (orderableGroup) => {
        const lots = _.chain(orderableGroup).pluck('lot')
            .compact()
            .map(lot => ({ ...lot, expirationDate: new Date(lot.expirationDate) }))
            .value();

        return _.map(lots, lot => ({ name: formatLot(lot), value: lot }));
    };

    const goToAddLotCodePage = (lotCodeOptions, values) => {
        const stateLocation = {
            lotCodeOptions: lotCodeOptions,
            currentFormValues: values
        };
        localStorage.setItem('stateLocationLotCode', JSON.stringify(stateLocation));
        history.push({
            pathname: `/makeReceiveAddProducts/addLotCode`,
            state: stateLocation
        });
    };

    const renderLotSelect = (fieldName, product, v) => {
        const options = getLotsOptions(product);
        const noOptions = !options?.length;
        const noProduct = !product ? true : false;
        if (adjustmentType === RECEIVE) {
            return (
                <InlineField>
                    <SelectField
                        name={`${fieldName}.lot`}
                        label="Lot Code / Expiry Date"
                        options={options}
                        objectKey="id"
                        defaultOption={noOptions ? 'Product has no lots' : 'No lot defined'}
                        disabled={noOptions}
                        containerClass='form-field-with-button required'
                    />
                    <AddButton
                        type="submit"
                        onClick={() => {goToAddLotCodePage(options, v)}}
                        className="secondary"
                        disabled={noProduct}
                        style={{height: "50px"}}
                    ></AddButton>
                </InlineField>
            );
        }
        else { 
            return (
                <SelectField
                    name={`${fieldName}.lot`}
                    label="Lot Code / Expiry Date"
                    options={options}
                    objectKey="id"
                    defaultOption={noOptions ? 'Product has no lots' : 'No lot defined'}
                    disabled={noOptions}
                    containerClass='field-full-width required'
                /> 
            );
        }
    };

    const renderIssueSelectField = (fieldName, product, v) => {
        if (adjustmentType === ISSUE) {
            return (
                <SelectField
                    name={`${fieldName}.assignment`}
                    label="Issue To"
                    options={sourceDestinations}
                    objectKey="id"
                    containerClass='field-full-width required'
                />
            );
        }
    };

    const renderReceiveFromSelectField = (fieldName, product, v) => {
        if (adjustmentType === RECEIVE) {
            return (
                <SelectField
                    name={`${fieldName}.assignment`}
                    label="Receive From"
                    options={sourceDestinations}
                    objectKey="id"
                    containerClass='field-full-width required'
                />
            );
        }
    };

    const renderIssueDestinationCommentField = (fieldName, product, v) => {
        if (adjustmentType === ISSUE) {
            const inputProps = {};
            return (
                <BaseField
                    renderInput={inputProps => (<Input {...inputProps}/>)}    
                    name={`${fieldName}.srcDstFreeText`}
                    label="Destination Comments"
                    containerClass='field-full-width'
                />
            );
        }
    };

    return (
        <div style={{marginBottom: "40px"}}>
            <Form
                initialValues={{ items: [location?.state?.currentFormValues ?? {occurredDate: maxDateToday}] }}
                onSubmit={onSubmit}
                validate={validate}
                mutators={{ ...arrayMutators }}
                decorators={[decorator]}
                render={({ handleSubmit, values, invalid }) => (
                    <form className="form-container" onSubmit={handleSubmit}>
                        <FieldArray name="items">
                            {({ fields }) => (                       
                                <div className="form-container">
                                    <div className="page-header-responsive">
                                        <div id="header-wrap" style={{marginBottom: "24px"}}>
                                            <h2 id="product-add-header">{userHomeFacility.code} - {userHomeFacility.name} - {program.programName}</h2>
                                            <div className="button-inline-container">
                                            <AddButton
                                                className="primary"
                                                disabled={invalid}
                                                onClick={() => onSubmitAddProduct(values)}
                                            >Add Product</AddButton>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-body">
                                        {fields.map((name, index) => (
                                            <div key={name}>
                                                <SelectField
                                                    required
                                                    name={`${name}.product`}
                                                    label="Product"
                                                    options={productOptions}
                                                    objectKey={[0, 'orderable', 'id']}
                                                    containerClass='field-full-width required'
                                                />
                                                {renderLotSelect(name, values.items[index].product, values.items[index])}
                                                <ReadOnlyField
                                                    numeric
                                                    name="stockOnHand"
                                                    label="Stock on Hand"
                                                    containerClass='field-full-width'
                                                />
                                                {renderReceiveFromSelectField(name, values.items[index].product)}
                                                {renderIssueSelectField(name, values.items[index].product)}
                                                {renderIssueDestinationCommentField(name, values.items[index].product)}
                                                <SelectField
                                                    required
                                                    name={`${name}.reason`}
                                                    label="Reason"
                                                    options={reasons}
                                                    objectKey="id"
                                                    containerClass='field-full-width required'
                                                />
                                                <InputField
                                                    required
                                                    numeric
                                                    name={`${name}.quantity`}
                                                    label="Quantity"
                                                    containerClass='field-full-width required'
                                                />
                                                <BaseField
                                                    renderInput={inputProps => (<DateInput {...inputProps}/>)}    
                                                    maxDate={maxDateToday}
                                                    name={`${name}.occurredDate`}
                                                    label="Date"
                                                    containerClass='field-full-width required'
                                                    value={values.items[index]?.occurredDate ?? new Date()}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="navbar">
                                        <div id='navbar-wrap'>
                                            <button type="button" className="light" onClick={cancel} style={{marginLeft: "5%"}}>
                                                <span>Cancel</span>
                                            </button>
                                            <AddButton
                                                type="submit"
                                                className="primary"
                                                disabled={invalid}
                                                alwaysShowText
                                                style={{marginRight: "5%"}}
                                            >Add</AddButton>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </FieldArray>
                    </form>
                )}
            />
        </div>
    );
};

export default AddProductsPage;
