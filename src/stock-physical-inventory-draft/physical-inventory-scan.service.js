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
     * @name stock-physical-inventory-draft.physicalInventoryScanService
     *
     * @description
     * Decides whether the physical inventory screen scans and hands scans to the resolution service.
     * The mode never varies here, unlike on the shared adjustment screen, so this only exists to keep
     * the flag and the mode out of the controller.
     */
    angular
        .module('stock-physical-inventory-draft')
        .service('physicalInventoryScanService', service);

    service.$inject = [
        'featureFlagService', 'GS1_SCANNING_FEATURE_FLAG', 'GS1_SCAN_MODE', 'stockScanService'
    ];

    function service(featureFlagService, GS1_SCANNING_FEATURE_FLAG, GS1_SCAN_MODE,
                     stockScanService) {

        this.mode = mode;
        this.isEnabled = isEnabled;
        this.resolve = resolve;

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.physicalInventoryScanService
         * @name mode
         *
         * @return {String} the scan mode of this screen
         */
        function mode() {
            return GS1_SCAN_MODE.PHYSICAL_INVENTORY;
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.physicalInventoryScanService
         * @name isEnabled
         *
         * @return {Boolean} whether the screen should offer scanning
         */
        function isEnabled() {
            return Boolean(featureFlagService.get(GS1_SCANNING_FEATURE_FLAG));
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.physicalInventoryScanService
         * @name resolve
         *
         * @description
         * Applies a scan to the count. See stockScanService for what the screen has to pass.
         *
         * @return {Promise} resolves with the line item the scan counted
         */
        function resolve(scan, tradeItem, screen) {
            return stockScanService.resolve(scan, tradeItem, mode(), screen);
        }
    }

})();
