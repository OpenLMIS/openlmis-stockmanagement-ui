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
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */


import React, { useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { setToastList } from '../reducers/toasts';


const Toast = props => {
    const { position, autoDelete, autoDeleteTime } = props;
    const dispatch = useDispatch();
    var toastList = useSelector(state => state.toasts.toasts);
    
    useEffect(() => {
        let listToRemove = toastList;
        const interval = setInterval(() => {
            if (autoDelete && listToRemove.length) {
                if(listToRemove.length !== 0) {
                    listToRemove = deleteToast(listToRemove[0].id, listToRemove);
                    toastList = listToRemove;
                    dispatch(setToastList(toastList));
                }
            }
        }, autoDeleteTime);
        
        return () => {
            clearInterval(interval);
        }

    }, [toastList, autoDelete, autoDeleteTime]);

    const deleteToast = (id, listToRemove) => {
        const listItemIndexToRemove = listToRemove.findIndex(element => element.id === id);
        return listToRemove.filter((element, index) => index !== listItemIndexToRemove);
    }

    return (
        <>
            <div style={{justifyContent: "center", display: "flex"}}>
                {
                    toastList.map((toast, i) =>     
                        <div 
                            key={i}
                            className={`notification toast ${position}`}
                            style={{ 
                                backgroundColor: toast.backgroundColor,
                                width: "328px" 
                            }}
                        >
                            <div>
                                <p className="notification-message">
                                    {toast.description}
                                </p>
                            </div>
                        </div>
                    )
                }
            </div>
        </>
    );
}

export default Toast;
