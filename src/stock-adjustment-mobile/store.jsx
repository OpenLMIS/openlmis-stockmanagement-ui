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

import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import facilitiesReducer from "./reducers/facilities";
import productOptionsReducer from "./reducers/product-options"
import reasonsReducer from "./reducers/reasons"
import adjustmentReducer from "./reducers/adjustment"
import programReducer from "./reducers/program"
import toastsReducer from "./reducers/toasts"
import sourceDestinationsReducer from "./reducers/source-destination"
import reducerIssue from '../stock-issue-mobile/store';
import reducerReceive from '../stock-receive-mobile/store';


const saveToLocalStorage = (state) => {
    try {
        localStorage.setItem('state', JSON.stringify(state));
    } catch (e) {
        console.error(e);
    }
};
  
const loadFromLocalStorage = () => {
    try {
        const stateStr = localStorage.getItem('state');
        return stateStr ? JSON.parse(stateStr) : undefined;
    } catch (e) {
        console.error(e);
        return undefined;
    }
};

const persistedStore = loadFromLocalStorage();

const reducerAdjustment = {
    facilitiesAdjustment: facilitiesReducer,
    productOptionsAdjustment: productOptionsReducer,
    reasonsAdjustment: reasonsReducer,
    adjustmentAdjustment: adjustmentReducer,
    programAdjustment: programReducer,
    toastsAdjustment: toastsReducer,
    sourceDestinationsAdjustment: sourceDestinationsReducer
};

const store = configureStore({
    reducer: Object.assign(reducerAdjustment, Object.assign(reducerIssue, reducerReceive)),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }),
    preloadedState: persistedStore
});

store.subscribe(() => saveToLocalStorage(store.getState()));

export default store;
