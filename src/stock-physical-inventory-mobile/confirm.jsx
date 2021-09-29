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

import React from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const confirmAlertCustom = ({onConfirm, ...props}) => {
    const title = props?.title || 'Confirm to submit.';
    const message = props?.message === undefined ? 'Are you sure to do this?' : '';
    const cancelLabel = props?.cancelLabel || 'Cancel';
    const confirmLabel = props?.confirmLabel || 'Confirm';
    const confirmButtonClass = props?.confirmButtonClass || 'danger';

    confirmAlert({
        title: title,
        message: message,
        overlayClassName: 'confirmation-dialog-overlay',
        customUI: ({title, message, onClose}) => {
            return (
                <div className="confirmation-dialog">
                    <p className="title">{title}</p>
                    {message && <p className="msg">{message}</p>}
                    <div className="buttons">
                        <button type="button" onClick={onClose}>
                            {cancelLabel}
                        </button>
                        <button type="button"
                                className={confirmButtonClass}
                                onClick={() => {
                                    onClose();
                                    onConfirm();
                                }}>
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            );
        }
    });
}

export default confirmAlertCustom;