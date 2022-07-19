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

import facilitiesReducer from "./reducers/facilities";
import productOptionsReducer from "./reducers/product-options"
import reasonsReducer from "./reducers/reasons"
import adjustmentReducer from "./reducers/adjustment"
import programReducer from "./reducers/program"
import toastsReducer from "./reducers/toasts"
import sourceDestinationsReducer from "./reducers/source-destination"

const reducerIssue = {
    facilitiesIssue: facilitiesReducer,
    productOptionsIssue: productOptionsReducer,
    reasonsIssue: reasonsReducer,
    adjustmentIssue: adjustmentReducer,
    programIssue: programReducer,
    toastsIssue: toastsReducer,
    sourceDestinationsIssue: sourceDestinationsReducer
};

export default reducerIssue;
