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
     * @name stock-program-util.currentUserHomeFacilityService
     *
     * @description
     * Responsible for fetching and caching home facility of the currently logged user.
     */
    angular
        .module('stock-program-util')
        .service('currentUserHomeFacilityService', currentUserHomeFacilityService);

    currentUserHomeFacilityService.$inject = [
        '$q', 'facilityService', 'localStorageService', 'currentUserService'
    ];

    function currentUserHomeFacilityService($q, facilityService, localStorageService,
                                            currentUserService) {

        var HOME_FACILITY = 'homeFacility';

        this.getHomeFacility = getHomeFacility;
        this.clearCache = clearCache;

        /**
         * @ngdoc method
         * @methodOf stock-program-util.currentUserHomeFacilityService
         * @name getHomeFacility
         *
         * @description
         * Gets home facility of the currently logged in user and stores it in the local storage.
         *
         * @return {Promise}    promise that resolves with the current user home facility
         */
        function getHomeFacility() {
            return currentUserService.getUserInfo()
                .then(function(user) {
                    if (!user.homeFacilityId) {
                        return undefined;
                    }

                    var homeFacilityJson = localStorageService.get(HOME_FACILITY);
                    if (homeFacilityJson) {
                        return angular.fromJson(homeFacilityJson);
                    }

                    return currentUserService.getUserInfo()
                        .then(function(user) {
                            return facilityService.get(user.homeFacilityId)
                                .then(function(homeFacility) {
                                    localStorageService.add(HOME_FACILITY, angular.toJson(homeFacility));
                                    return homeFacility;
                                });
                        });
                });
        }

        /**
         * @ngdoc method
         * @methodOf stock-program-util.currentUserHomeFacilityService
         * @name clearCache
         *
         * @description
         * Deletes home facility stored in the browser cache.
         */
        function clearCache() {
            localStorageService.remove(HOME_FACILITY);
        }
    }

})();
