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
import {useDispatch, useSelector} from "react-redux";
import { useParams, useHistory } from 'react-router-dom';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import createDecorator from 'final-form-calculate';
import update from 'immutability-helper';
import moment from 'moment';

import WizardStep from './wizard-step';
import InputField from './form-fields/input-field';
import { formatLot, formatProductName } from './format-utils';
import ReadOnlyField from './form-fields/read-only-field';
import InlineField from './form-fields/inline-field';
import { setLots } from "./reducers/lots";
import { setValidReasons } from "./reducers/valid-reasons";
import { setDraft } from './reducers/physical-inventories';
import { TrashButton } from './stock-add-products-mobile/button';

const PhysicalInventoryForm = ({ lots, validReasons, physicalInventoryService, physicalInventoryFactory,
                                   physicalInventoryDraftCacheService, stockReasonsCalculations, offlineService }) => {
    const history = useHistory();
    const { physicalInventoryId } = useParams();
    const [step, setStep] = useState(1);
    const [lineItems, setLineItems] = useState([]);

    const dispatch = useDispatch();
    const draft = useSelector(state => state.physicalInventories.draft);
    const userHomeFacility = useSelector(state => state.facilities.userHomeFacility);

    useEffect(
        () => {
            dispatch(setLots(lots));
            dispatch(setValidReasons(validReasons));
        },
        [lots, validReasons]
    );

    const decorator = useMemo(() => createDecorator({
        field: /quantity|stockAdjustments\[\d+\]/,
        updates: {
            unaccountedQuantity: (quantityVal, lineItemVal) => {
                const stockAdjustments = lineItemVal.stockAdjustments || [];
                const validAdjustments = _.filter(stockAdjustments, item => (item.reason && item.reason.reasonType));
                return stockReasonsCalculations.calculateUnaccounted(lineItemVal, validAdjustments)
            }
        }
    }), []);

    useEffect(() => {
        physicalInventoryFactory.getPhysicalInventory({ ...draft, id: physicalInventoryId })
            .then(inventoryDraft => {
                dispatch(setDraft(inventoryDraft));
            });

    }, [physicalInventoryId]);

    useEffect(() => {
        const items = _.map(draft.lineItems, (item, index) => ({ ...item, originalIndex: index }));
        const filteredItems = _.filter(items, (item) => {
            const hasSoh = !_.isNull(item.stockOnHand);
            return item.isAdded || hasSoh;
        });

        const sortedItems = _.sortBy(filteredItems, item => (item.originalIndex - (item.quantity || item.quantity === 0 ? 999999 : 0)));
        const filledItems = _.filter(sortedItems, (item) => (item.quantity || item.quantity === 0));

        setLineItems(sortedItems);
        setStep(filledItems.length + 1)

    }, [draft.lineItems]);

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

    const cacheDraft = () => {
        physicalInventoryDraftCacheService.cacheDraft(draft);
    };

    const updateDraft = (lineItem) => {
        const updatedDraft = update(draft, {
            lineItems: {
                [lineItem.originalIndex]: {
                    quantity: { $set: lineItem.quantity },
                    isAdded: { $set: true }
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
            .catch((errorResponse) => {
                //TODO: Add error message
            });
    };

    const submitDraft = (updatedDraft) => {
        //TODO: Add new page to set those values
        const occurredDate = moment().format('YYYY-MM-DD');
        //draft.signature = resolvedData.signature;

        //TODO: Add spinner
        physicalInventoryService.submitPhysicalInventory({ ...updatedDraft, occurredDate })
            .then(() => {
                //TODO: Add success message

                // window.location = `/stockmanagement/stockCardSummaries?facility=${updatedDraft.facilityId}&program=${updatedDraft.programId}`;
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
        } else if (step >= lineItems.length) {
            submitDraft(updatedDraft);
        } else {
            saveDraft(updatedDraft, () => setStep(step + 1))
        }
    };

    const addProduct = () => {
        history.push(`${physicalInventoryId}/addProduct`);
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
                render={({ handleSubmit, invalid }) => (
                    <form className="form-container" onSubmit={handleSubmit}>
                        <WizardStep
                            currentStep={step}
                            stepsCount={lineItems.length}
                            previous={() => setStep(step - 1)}
                            formInvalid={invalid}
                            physicalInventoryId={physicalInventoryId}
                            physicalInventoryService={physicalInventoryService}
                        >
                            <InlineField>
                                <ReadOnlyField
                                    name="orderable"
                                    label="Product"
                                    containerClass="no-padding"
                                    formatValue={formatProductName}
                                />
                                <div>
                                    <button
                                        type="button"
                                        className="primary"
                                        onClick={() => addProduct()}
                                    >Add Product</button>
                                </div>
                            </InlineField>
                            <ReadOnlyField
                                name="lot"
                                label="LOT / Expiry Date"
                                formatValue={formatLot}
                            />
                            <ReadOnlyField
                                name="stockOnHand"
                                label="Stock on Hand"
                                type="number"
                            />
                            <InputField name="quantity" label="Current Stock" type="number" />
                            <FieldArray name="stockAdjustments">
                                {({ fields }) => (
                                    <div className="form-container">
                                        <InlineField>
                                            <ReadOnlyField
                                                name="unaccountedQuantity"
                                                label="Unaccounted Quantity"
                                                type="number"
                                                containerClass="no-padding"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fields.push({ reason: '', quantity: '' })}
                                            >Add Reason</button>
                                        </InlineField>
                                        {fields.map((name, index) => (
                                            <InlineField key={name}>
                                                <InputField
                                                    name={`${name}.reason`}
                                                    label="Reason"
                                                    containerClass="no-padding"
                                                />
                                                <InputField
                                                    name={`${name}.quantity`}
                                                    label="Quantity"
                                                    type="number"
                                                    containerClass="no-padding"
                                                />
                                                <div>
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
