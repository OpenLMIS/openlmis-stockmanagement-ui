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
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { toastProperties } from './format-utils';
import InlineField from '../react-components/form-fields/inline-field';
import AddButton from '../react-components/buttons/add-button';
import confirmAlertCustom from '../react-components/modals/confirm';
import BlockList from './components/block-list.component';
import Toast from './components/toast.component';


const AdjustmentForm = ({ stockAdjustmentCreationService,
                        offlineService, adjustmentType, setToastList, resetAdjustment }) => {
    const history = useHistory();

    const dispatch = useDispatch();
    const adjustment = useSelector(state => state[`adjustment${adjustmentType}`][`adjustment${adjustmentType}`]);
    const userHomeFacility = useSelector(state => state[`facilities${adjustmentType}`][`userHomeFacility${adjustmentType}`]);
    const program = useSelector(state => state[`program${adjustmentType}`][`program${adjustmentType}`]);
    const toastList = useSelector(state => state[`toasts${adjustmentType}`][`toasts${adjustmentType}`]);

    const menu = document.getElementsByClassName("header ng-scope")[0];

    useEffect(() => {
        menu.style.display = "";
    }, [menu]);

    const onSubmit = () => {
        confirmAlertCustom ({
            title: `Are you sure you want to submit ${adjustment.length} product${adjustment.length === 1 ? '' : 's'} for ${adjustmentType}s?`,
            confirmLabel: 'Confirm',
            confirmButtonClass: 'primary',
            onConfirm: submitAdjustment
        });
    };

    const showToast = (type) => {
        const toastPropertiesList = toastProperties.find((toast) => toast.title.toLowerCase() === type);
        dispatch(setToastList([...toastList, toastPropertiesList]));
    };

    const submitAdjustment = () => {
        stockAdjustmentCreationService.submitAdjustments(program.programId, userHomeFacility.id, adjustment, {
            state: adjustmentType.toLowerCase() 
        }).then(() => {
            dispatch(resetAdjustment(adjustment));
            if (offlineService.isOffline()) {
                showToast('offline');
            } else {
                showToast('success');
            }
            history.push(`/make${adjustmentType}AddProducts/submit${adjustmentType}/programChoice`);
        })
        .catch(() => {
            showToast('error');
            history.push(`/make${adjustmentType}AddProducts/submit${adjustmentType}/programChoice`);
        });
    }

    const onDelete = () => {
        dispatch(resetAdjustment(adjustment));
        if (offlineService.isOffline()) {
            showToast('offline');
        } else {
            showToast('success');
        }
        history.push(`/make${adjustmentType}AddProducts/submit${adjustmentType}/programChoice`);
    };

    const addProduct = () => {
        history.push(`/make${adjustmentType}AddProducts`);
    };

    const editProduct = (product, index) => {
        const stateLocation = {
            productToEdit: product,
            indexOfProductToEdit: index
        };
        localStorage.setItem('stateLocation', JSON.stringify(stateLocation));
        history.push({
            pathname: `/make${adjustmentType}AddProducts/editProduct${adjustmentType}`,
            state: stateLocation
        });
    };

    const dataToDisplay = [
        {"key": "productNameWithReason", "textToDisplay": ""}, 
        {"key": "displayLotMessage", "textToDisplay": "Lot Code"}, 
        {"key": "quantity", "textToDisplay": "Quantity"}
    ];
    const headerToDisplay = "productNameWithReason";

    return (
        <div style={{marginBottom: "40px"}}>
            <div className="page-header-responsive">
                <div id="header-wrap" style={{marginBottom: "16px"}}>
                    <h2 id="product-add-header">{adjustmentType}s for {program.programName}</h2>
                        <div className="button-inline-container">
                            <AddButton
                                className="primary"
                                onClick={() => addProduct()}
                            >Add Product</AddButton>
                        </div>
                </div>
            </div>
            <Toast 
                autoDelete
                autoDeleteTime={4000}
                adjustmentType={adjustmentType}
                setToastList={setToastList}
            />
            <BlockList
                data={adjustment}
                dataToDisplay={dataToDisplay}
                headerToDisplay={headerToDisplay}
                onClickAction={editProduct}
            />
            <InlineField>
                <div className="navbar">
                    <div id='navbar-wrap'>
                        <button type="button" onClick={() => confirmAlertCustom({
                                title: `Are you sure you want to delete this ${adjustmentType}?`,
                                confirmLabel: 'Delete',
                                confirmButtonClass: 'danger',
                                onConfirm: onDelete
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
