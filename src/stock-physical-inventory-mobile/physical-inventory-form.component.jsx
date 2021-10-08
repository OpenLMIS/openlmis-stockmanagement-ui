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

import React, { useState, useEffect, useMemo } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import createDecorator from 'final-form-calculate';
import update from 'immutability-helper';

import WizardStep from './wizard-step';
import InputField from './form-fields/input-field';
import { formatLot, formatProductName } from './format-utils';
import ReadOnlyField from './form-fields/read-only-field';
import InlineField from './form-fields/inline-field';
import { setDraft } from './reducers/physical-inventories';
import TrashButton from './buttons/trash-button';
import SelectField from './form-fields/select-field';
import AddButton from './buttons/add-button';

const PhysicalInventoryForm = ({ validReasons, physicalInventoryService, physicalInventoryFactory,
                                   physicalInventoryDraftCacheService, stockReasonsCalculations, offlineService }) => {
    const history = useHistory();
    const { physicalInventoryId } = useParams();
    const [step, setStep] = useState(0);
    const [lineItems, setLineItems] = useState([]);

    const dispatch = useDispatch();
    const draft = useSelector(state => state.physicalInventories.draft);
    const userHomeFacility = useSelector(state => state.facilities.userHomeFacility);

    const decorator = useMemo(() => createDecorator({
        field: /quantity|stockAdjustments\[\d+\]/,
        updates: {
            unaccountedQuantity: (quantityVal, lineItemVal) => {
                if (!lineItemVal) {
                    return 0;
                }

                const stockAdjustments = lineItemVal.stockAdjustments || [];
                const validAdjustments = _.filter(stockAdjustments, item => (item.reason && item.reason.reasonType));
                return stockReasonsCalculations.calculateUnaccounted(lineItemVal, validAdjustments);
            }
        }
    }), []);

    useEffect(() => {
        const items = _.map(draft.lineItems, (item, index) => ({ ...item, originalIndex: index }));
        const filteredItems = _.filter(items, (item) => {
            const hasQuantity = !(_.isNull(item.quantity) || _.isUndefined(item.quantity));
            const hasSoh = !_.isNull(item.stockOnHand);
            return item.isAdded || hasQuantity || hasSoh;
        });

        const mappedItems = _.map(filteredItems, (item) => ({
            ...item,
            isAdded: true,
            quantity: item.quantity === -1 ? null : item.quantity
        }));

        const sortedItems = _.sortBy(mappedItems, item => (item.originalIndex - (item.quantity || item.quantity === 0 ? 999999 : 0)));
        const filledItems = _.filter(sortedItems, (item) => (item.quantity || item.quantity === 0));

        setLineItems(sortedItems);

        if (step === 0) {
            if (filledItems.length === 0) {
                setStep(1);
            } else {
                setStep(filledItems.length);
            }
        }

    }, [draft.lineItems]);

    const cacheDraft = () => {
        physicalInventoryDraftCacheService.cacheDraft(draft);
    };

    useEffect(() => {
        if (draft) {
            cacheDraft();
        }
    }, [draft]);

    const validate = (values) => {
        const errors = {};

        if (!values.quantity) {
            errors.quantity = 'Required';
        }

        return errors;
    };

    const updateDraft = (lineItem) => {
        const updatedDraft = update(draft, {
            lineItems: {
                [lineItem.originalIndex]: {
                    quantity: { $set: lineItem.quantity },
                    stockAdjustments: { $set: lineItem.stockAdjustments }
                }
            }
        });

        return updatedDraft;
    };

    const saveDraft = (updatedDraft, callback) => {
        //TODO: Add spinner
        physicalInventoryFactory.saveDraft(updatedDraft)
            .then(() => {
                //TODO: Add success message

                if (callback) {
                    callback();
                }
                dispatch(setDraft({ ...updatedDraft, $modified: undefined }));
            })
            .catch(() => {
                //TODO: Add error message
            });
    };

    const submitDraft = (updatedDraft) => {
        //TODO: Add new page to set occurredDate and signature
        const occurredDate = moment().format('YYYY-MM-DD');

        //TODO: Add spinner
        physicalInventoryService.submitPhysicalInventory({ ...updatedDraft, occurredDate })
            .then(() => {
                //TODO: Add success message
                history.push('/');
            })
            .catch(() => {
                //TODO: Add error message
                physicalInventoryDraftCacheService.removeById(updatedDraft.id);
            });
    };

    const onSubmit = (lineItem) => {
        const updatedDraft = updateDraft(lineItem);

        if (offlineService.isOffline()) {
            dispatch(setDraft(updatedDraft));
            if (step < lineItems.length) {
                setStep(step + 1);
            }
        } else if (step >= lineItems.length) {
            submitDraft(updatedDraft);
        } else {
            saveDraft(updatedDraft, () => setStep(step + 1));
        }
    };

    const addProduct = () => {
        history.push(`${physicalInventoryId}/addProduct`);
    };

    const previousPage = (lineItem) => {
        const updatedDraft = updateDraft(lineItem);

        if (offlineService.isOffline()) {
            dispatch(setDraft(updatedDraft));
            setStep(step - 1);
        } else {
            saveDraft(updatedDraft, () => setStep(step - 1));
        }
    };

    return (
        <div className="page-container">
            <div className="page-header-mobile">
                <h2>{userHomeFacility.code} - {userHomeFacility.name}</h2>
            </div>
            <Form
                initialValues={lineItems[step - 1]}
                onSubmit={onSubmit}
                validate={validate}
                mutators={{ ...arrayMutators }}
                decorators={[decorator]}
                render={({ handleSubmit, invalid, values }) => (
                    <form className="form-container" onSubmit={handleSubmit}>
                        <WizardStep
                            currentStep={step}
                            stepsCount={lineItems.length}
                            previous={() => previousPage(values)}
                            formInvalid={invalid}
                            physicalInventoryId={physicalInventoryId}
                            physicalInventoryService={physicalInventoryService}
                        >
                            <InlineField>
                                <ReadOnlyField
                                    name="orderable"
                                    label="Product"
                                    formatValue={formatProductName}
                                />
                                <div className="button-inline-container">
                                    <AddButton
                                        className="primary"
                                        onClick={() => addProduct()}
                                    >Add Product</AddButton>
                                </div>
                            </InlineField>
                            <ReadOnlyField
                                name="lot"
                                label="LOT / Expiry Date"
                                formatValue={formatLot}
                            />
                            <ReadOnlyField
                                numeric
                                name="stockOnHand"
                                label="Stock on Hand"
                            />
                            <InputField numeric required name="quantity" label="Current Stock" />
                            <FieldArray name="stockAdjustments">
                                {({ fields }) => (
                                    <div className="form-container">
                                        <InlineField>
                                            <ReadOnlyField
                                                numeric
                                                name="unaccountedQuantity"
                                                label="Unaccounted Quantity"
                                            />
                                            <AddButton
                                                onClick={() => fields.push({ reason: '', quantity: '' })}
                                            >Add Reason</AddButton>
                                        </InlineField>
                                        {fields.map((name, index) => (
                                            <InlineField key={name}>
                                                <SelectField
                                                    required
                                                    name={`${name}.reason`}
                                                    label="Reason"
                                                    options={_.map(validReasons, reason => ({ name: reason.name, value: reason }))}
                                                    objectKey="id"
                                                />
                                                <InputField numeric required name={`${name}.quantity`} label="Quantity"/>
                                                <div className="button-inline-container">
                                                    <TrashButton onClick={() => fields.remove(index)} />
                                                </div>
                                            </InlineField>
                                        ))}
                                    </div>
                                )}
                            </FieldArray>
                        </WizardStep>
                    </form>
                )}
            />
        </div>
    );
};

export default PhysicalInventoryForm
