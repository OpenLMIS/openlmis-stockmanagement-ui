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

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import createDecorator from 'final-form-calculate';

import InputField from '../form-fields/input-field';
import SelectField from '../form-fields/select-field';
import { TrashButton } from './button';
import InlineField from '../form-fields/inline-field';
import { formatLot } from '../format-utils';
import { setDraft } from '../reducers/physical-inventories';

const decorator = createDecorator({
    field: /items\[\d+\]\.product/,
    updates: (value, name) => {
        const fieldName = name.replace('.product', '.lot');

        return { [fieldName]: undefined };
    }
});

const AddProductPage = ({ orderableGroupService }) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const draft = useSelector(state => state.physicalInventories.draft);

    const [productOptions, setProductOptions] = useState([]);

    useEffect(() => {
        const items = _.map(draft.lineItems, (item, index) => ({ ...item, originalIndex: index }));
        const filteredItems = _.filter(items, (item) => {
            const emptyQuantity = _.isNull(item.quantity) || _.isUndefined(item.quantity) || item.quantity === -1;
            const emptySoh = _.isNull(item.stockOnHand) || _.isUndefined(item.stockOnHand);
            return !item.isAdded && emptySoh && emptyQuantity;
        });

        const groups = orderableGroupService.groupByOrderableId(filteredItems);
        const options = _.map(groups, group => ({ name: group[0].orderable.fullProductName, value: group }));
        setProductOptions(options);

    }, [draft.lineItems]);

    const validate = values => {
        const errors = {};
        errors.items = [];

        _.forEach(values.items, (item, key) => {
            if (!item.product) {
                errors.items[key] = { product: 'Required' };
            }

            if (!item.lot) {
                errors.items[key] = { lot: 'Required' };
            }

            if (!item.quantity && item.quantity !== 0) {
                errors.items[key] = { quantity: 'Required' };
            }
        });

        return errors;
    };

    const onSubmit = (values) => {
        const selectedItems = _.map(values.items, item => ({ originalIndex: item.product[0].originalIndex, quantity: item.quantity }));
        const groupedItems = _.groupBy(selectedItems, 'originalIndex');

        const updatedDraft = {
            ...draft,
            lineItems: _.map(draft.lineItems, (item, index) => {
                if (groupedItems[index] && groupedItems[index][0]) {
                    return { ...item, quantity: groupedItems[index][0].quantity }
                }

                return item;
            })
        };

        dispatch(setDraft(updatedDraft));
        returnToDraftPage();
    };

    const returnToDraftPage = () => {
        history.goBack();
    };

    const getLotsOptions = (orderableGroup) => {
        const lots = _.chain(orderableGroup).pluck('lot')
            .compact()
            .map(lot => ({ ...lot, expirationDate: new Date(lot.expirationDate) }))
            .value();

        return _.map(lots, lot => ({ name: formatLot(lot), value: lot }));
    };

    return (
        <div className="page-container">
            <Form
                initialValues={{ items: [{}] }}
                onSubmit={onSubmit}
                validate={validate}
                mutators={{ ...arrayMutators }}
                decorators={[decorator]}
                render={({ handleSubmit, values, invalid }) => (
                    <form className="form-container" onSubmit={handleSubmit}>
                        <FieldArray name="items">
                            {({ fields }) => (
                                <div className="form-container">
                                    <div className="page-header-mobile">
                                        <h2>Add Products to Physical Inventory</h2>
                                        <button
                                            onClick={() => fields.push({})}
                                            className="add-products-button"
                                        >Add</button>
                                    </div>
                                    <div className="form-container">
                                        {fields.map((name, index) => (
                                            <div key={name} className="form-body">
                                                <InlineField>
                                                    <SelectField
                                                        className="product-select"
                                                        name={`${name}.product`}
                                                        label="Product"
                                                        options={productOptions}
                                                        objectKey={[0, 'orderable', 'id']}
                                                    />
                                                    {index > 0 ?
                                                        <TrashButton
                                                            onClick={() => fields.remove(index)}
                                                        /> : null
                                                    }
                                                </InlineField>
                                                <InlineField>
                                                    <SelectField
                                                        name={`${name}.lot`}
                                                        label="LOT / Expiry Date"
                                                        options={getLotsOptions(values.items[index].product)}
                                                        objectKey="id"
                                                    />
                                                    <InputField
                                                        name={`${name}.quantity`}
                                                        label="Stock on hand"
                                                        required
                                                    />
                                                </InlineField>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="form-footer">
                                        <button type="button" onClick={() => returnToDraftPage()}>
                                            <span>Cancel</span>
                                        </button>
                                        <button
                                            type="submit"
                                            className="add-items-button primary"
                                            disabled={invalid}
                                        >{values.items.length} Items</button>
                                    </div>
                                </div>
                            )}
                        </FieldArray>
                    </form>
                )}
            />
        </div>
    )
};

export default AddProductPage;
