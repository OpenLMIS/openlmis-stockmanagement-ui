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
     * @name stock-adjustment.DEFAULT_REASONS
     *
     * @description
     * Reason ids, keyed by adjustment type state, that an implementation may configure to be
     * preselected on newly added line items. A screen with a configured reason also requires the
     * reason field to be filled in. The ids are substituted at build time from config.json, so a
     * key left unconfigured keeps its placeholder and that screen keeps behaving as it did before,
     * with no preselection and an optional reason.
     */
    angular
        .module('stock-adjustment')
        .constant('DEFAULT_REASONS', defaultReasons());

    function defaultReasons() {
        return {
            issue: '@@DEFAULT_ISSUE_REASON_ID',
            receive: '@@DEFAULT_RECEIVE_REASON_ID'
        };
    }
})();
