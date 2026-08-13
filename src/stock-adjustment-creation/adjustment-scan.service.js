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
     * @ngdoc service
     * @name stock-adjustment-creation.adjustmentScanService
     *
     * @description
     * Decides whether the shared adjustment screen scans, in which mode, and hands scans to the
     * resolution service. Kept out of the screen controller so the mapping is testable on its own.
     */
    angular
        .module('stock-adjustment-creation')
        .service('adjustmentScanService', service);

    service.$inject = [
        'featureFlagService', 'GS1_SCANNING_FEATURE_FLAG', 'ADJUSTMENT_TYPE', 'GS1_SCAN_MODE',
        'scanResolutionService'
    ];

    function service(featureFlagService, GS1_SCANNING_FEATURE_FLAG, ADJUSTMENT_TYPE, GS1_SCAN_MODE,
                     scanResolutionService) {
        // Allowed types (adjustments types)
        var MODES = {};

        MODES[ADJUSTMENT_TYPE.ISSUE.state] = GS1_SCAN_MODE.ISSUE;
        MODES[ADJUSTMENT_TYPE.RECEIVE.state] = GS1_SCAN_MODE.RECEIVE;

        this.modeFor = modeFor;
        this.isEnabled = isEnabled;
        this.resolve = resolve;

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.adjustmentScanService
         * @name modeFor
         *
         * @param  {Object} adjustmentType the screen's adjustment type
         * @return {String}                the scan mode, or undefined if the type does not scan
         */
        function modeFor(adjustmentType) {
            return adjustmentType ? MODES[adjustmentType.state] : undefined;
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.adjustmentScanService
         * @name isEnabled
         *
         * @param  {Object}  adjustmentType the screen's adjustment type
         * @return {Boolean}                whether the screen should offer scanning
         */
        function isEnabled(adjustmentType) {
            return Boolean(featureFlagService.get(GS1_SCANNING_FEATURE_FLAG))
                && Boolean(modeFor(adjustmentType));
        }

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.adjustmentScanService
         * @name resolve
         *
         * @description
         * Applies a scan to the screen. See scanResolutionService for the strategy contract.
         *
         * @return {Promise} resolves once the line was added or tallied
         */
        function resolve(scan, tradeItem, mode, strategy) {
            return scanResolutionService.resolve(scan, tradeItem, mode, strategy);
        }
    }

})();
