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
