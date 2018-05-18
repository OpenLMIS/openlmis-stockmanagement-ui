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
     * @name stock-program-util.loginService
     *
     * @description
     * Triggers the facility service to store a minimal list of facilities
     * until the user logs out.
     */
    angular
        .module('stock-program-util')
        .config(provider);

    provider.$inject = ['$provide'];
    function provider($provide) {
        $provide.decorator('loginService', decorator);
    }

    decorator.$inject = ['$delegate', 'currentUserHomeFacilityService'];

    function decorator($delegate, currentUserHomeFacilityService) {

        var originalLogin = $delegate.login,
            originalLogout = $delegate.logout;

        $delegate.login = login;
        $delegate.logout = logout;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf stock-program-util.loginService
         * @name login
         *
         * @description
         * Runs facilityFactory.getAllMinimalFacilities, which has been modified to store
         * the received list in the browsers cache.
         */
        function login() {
            return originalLogin.apply($delegate, arguments)
            .then(function(response) {
                return currentUserHomeFacilityService.getHomeFacility()
                .then(function() {
                    return response;
                });
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-program-util.loginService
         * @name logout
         *
         * @description
         * Removes the facility cache.
         */
        function logout() {
            return originalLogout.apply($delegate, arguments)
            .then(currentUserHomeFacilityService.clearCache);
        }
    }
})();
