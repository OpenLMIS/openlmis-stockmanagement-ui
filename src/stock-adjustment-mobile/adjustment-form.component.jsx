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
import { useHistory } from 'react-router-dom';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import update from 'immutability-helper';

import InputField from '../react-components/form-fields/input-field';
import { formatLot, formatProductName, formatDate } from './format-utils';
import ReadOnlyField from '../react-components/form-fields/read-only-field';
import InlineField from '../react-components/form-fields/inline-field';
import AddButton from '../react-components/buttons/add-button';
import confirmAlertCustom from '../react-components/modals/confirm';
import { resetAdjustment } from './reducers/adjustment';


const AdjustmentForm = ({ stockAdjustmentCreationService,
                        offlineService }) => {
    const history = useHistory();

    const dispatch = useDispatch();
    const adjustment = useSelector(state => state.adjustment.adjustment);
    const userHomeFacility = useSelector(state => state.facilities.userHomeFacility);
    const program = useSelector(state => state.program.program);

    const onSubmit = () => {
        confirmAlertCustom ({
            title: `Are you sure you want to submit ${adjustment.length} product${adjustment.length === 1 ? '' : 's'} for Adjustments?`,
            confirmLabel: 'Confirm',
            confirmButtonClass: 'primary',
            onConfirm: () => submitAdjustment()
        });
    };

    const submitAdjustment = () => {
        stockAdjustmentCreationService.submitAdjustments(program.programId, userHomeFacility.id, adjustment, {
            state: 'adjustment'
        }).then(() => {
            // TODO - add toast to inform user that there is success
            dispatch(resetAdjustment(adjustment));
            history.push("/makeAdjustmentAddProducts/submitAdjustment/programChoice");
        })
        .catch(() => {
            // TODO - add toast to inform user that there is error
            history.push("/makeAdjustmentAddProducts/submitAdjustment/programChoice");
        });
    }

    const onDelete = () => {
        // TODO - delete products from adjustment
        history.push("/makeAdjustmentAddProducts/submitAdjustment/programChoice");
    };

    const addProduct = () => {
        history.push("/makeAdjustmentAddProducts");
    };

    return (
        <div style={{marginBottom: "40px"}}>
            <div className="page-header-responsive">
                <div id="header-wrap" style={{marginBottom: "16px"}}>
                    <h2 id="product-add-header">Adjustments for {program.programName}</h2>
                        <div className="button-inline-container">
                            <AddButton
                                className="primary"
                                onClick={() => addProduct()}
                            >Add Product</AddButton>
                        </div>
                </div>
            </div>
            <InlineField>
                <div className="navbar">
                    <div id='navbar-wrap'>
                        <button type="button" onClick={() => confirmAlertCustom({
                                title: "Are you sure you want to delete all products from Adjustments?",
                                confirmLabel: 'Delete',
                                confirmButtonClass: 'danger',
                                onConfirm: () => onDelete()
                            })} 
                            className="danger"
                            style={{marginLeft: "5%"}}
                        >
                            <span>Delete</span>
                        </button>
                        <button type="button" className="primary" style={{marginRight: "5%"}} onClick={() => onSubmit()}>Submit</button>
                    </div>
                </div>
            </InlineField>
        </div>
    );
};

export default AdjustmentForm
