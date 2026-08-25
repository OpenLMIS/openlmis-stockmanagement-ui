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

(function() {

    'use strict';

    /**
     * @ngdoc object
     * @name stock-transaction-history.CANCEL_REASON_TAG
     *
     * @description
     * Tag marking the adjustment reasons that may be used to cancel a line item. Reasons carrying
     * it are deliberately kept out of the regular issue/receive/adjust reason lists and are only
     * offered in the reverse view. A line whose own reason carries it is itself a cancellation.
     */
    angular
        .module('stock-transaction-history')
        .constant('CANCEL_REASON_TAG', 'cancel');

    /**
     * @ngdoc object
     * @name stock-transaction-history.CANCEL_SCOPE_REASON_TAGS
     *
     * @description
     * The second tag a cancel reason carries, saying what it may cancel - so a row is offered the
     * reasons written for the kind of line it undoes.
     */
    angular
        .module('stock-transaction-history')
        .constant('CANCEL_SCOPE_REASON_TAGS', {
            MOVEMENT: 'cancelMovement',
            ADJUSTMENT: 'cancelAdjustment'
        });

})();
