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

    angular
        .module('stock-scan')
        .run(registerGs1ScanningFlag);

    registerGs1ScanningFlag.$inject = ['featureFlagService', 'GS1_SCANNING_FEATURE_FLAG'];

    /**
     * @ngdoc function
     * @name stock-scan.run:registerGs1ScanningFlag
     *
     * @description
     * Registers the barcode scanning flag, off unless a deployment turns it on. Registration is
     * required - an unregistered flag reads as undefined rather than false.
     *
     * The placeholder is substituted by CI/CD, in the same way as the other feature flags. A local
     * `grunt build` does not substitute it, so the value stays literal and the flag falls back to the
     * default below.
     */
    function registerGs1ScanningFlag(featureFlagService, GS1_SCANNING_FEATURE_FLAG) {
        featureFlagService.set(GS1_SCANNING_FEATURE_FLAG, '${GS1_SCANNING}', false);
    }

})();
