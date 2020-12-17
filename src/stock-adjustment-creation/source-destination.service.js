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
   * @name stock-adjustment-creation.sourceDestinationService
   *
   * @description
   * Responsible for fetching valid sources or destinations.
   */
    angular
        .module('stock-adjustment-creation')
        .service('sourceDestinationService', service);

    service.$inject = ['$resource', 'stockmanagementUrlFactory', 'localStorageFactory', '$q',
        'offlineService'];

    function service($resource, stockmanagementUrlFactory, localStorageFactory, $q,
                     offlineService) {

        var offlineSources = localStorageFactory('validSources'),
            offlineDestinations = localStorageFactory('validDestinations');
        this.getSourceAssignments = getSourceAssignments;
        this.getDestinationAssignments = getDestinationAssignments;
        this.clearSourcesCache = clearSourcesCache;
        this.clearDestinationsCache = clearDestinationsCache;

        function getSourceAssignments(programId, facilityId) {
            var resource = $resource(stockmanagementUrlFactory('/api/validSources')),
                cachedSources = offlineSources.search({
                    programId: programId,
                    facilityId: facilityId
                });

            if (offlineService.isOffline()) {
                return cachedSources;
            }
            return resource.query({
                programId: programId,
                facilityId: facilityId
            }).$promise.then(function(validSources) {
                cacheSources(validSources, facilityId);
                return $q.resolve(validSources);
            });
        }

        function getDestinationAssignments(programId, facilityId) {
            var resource = $resource(stockmanagementUrlFactory('/api/validDestinations')),
                cachedDestinations = offlineDestinations.search({
                    programId: programId,
                    facilityId: facilityId
                });

            if (offlineService.isOffline()) {
                return cachedDestinations;
            }
            return resource.query({
                programId: programId,
                facilityId: facilityId
            }).$promise.then(function(validDestinations) {
                cacheDestinations(validDestinations, facilityId);
                return $q.resolve(validDestinations);
            });
        }

        function cacheSources(sources, facilityId) {
            sources.forEach(function(source) {
                source.facilityId = facilityId;
                offlineSources.put(source);
            });
        }

        function cacheDestinations(destinations, facilityId) {
            destinations.forEach(function(destination) {
                destination.facilityId = facilityId;
                offlineDestinations.put(destination);
            });
        }

        function clearSourcesCache() {
            offlineSources.clearAll();
        }

        function clearDestinationsCache() {
            offlineDestinations.clearAll();
        }
    }
})();
