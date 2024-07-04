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
        'offlineService', 'alertService'];

    function service($resource, stockmanagementUrlFactory, localStorageFactory, $q,
                     offlineService, alertService) {

        var offlineSources = localStorageFactory('validSources'),
            offlineDestinations = localStorageFactory('validDestinations');
        this.getSourceAssignments = getSourceAssignments;
        this.getDestinationAssignments = getDestinationAssignments;
        this.clearSourcesCache = clearSourcesCache;
        this.clearDestinationsCache = clearDestinationsCache;

        function getSourceAssignments(programIds, facilityId) {
            var resource = $resource(stockmanagementUrlFactory('/api/validSources'));

            if (offlineService.isOffline()) {
                var sources = offlineSources.search({
                    programId: programIds,
                    facilityId: facilityId
                });

                return checkArrayAndGetData(sources);
            }
            return resource.get({
                programId: programIds,
                facilityId: facilityId,
                page: 0,
                size: 2147483647
            }).$promise.then(function(validSourcesPage) {
                cacheSources(validSourcesPage.content, facilityId);
                return $q.resolve(validSourcesPage.content);
            });
        }

        function getDestinationAssignments(programIds, facilityId) {
            var resource = $resource(stockmanagementUrlFactory('/api/validDestinations'));

            if (offlineService.isOffline()) {
                var destinations = offlineDestinations.search({
                    programId: programIds,
                    facilityId: facilityId
                });

                return checkArrayAndGetData(destinations);
            }
            return resource.get({
                programId: programIds,
                facilityId: facilityId,
                page: 0,
                size: 2147483647
            }).$promise.then(function(validDestinationsPage) {
                cacheDestinations(validDestinationsPage.content, facilityId);
                return $q.resolve(validDestinationsPage.content);
            });
        }

        function checkArrayAndGetData(array) {
            if (array.length === 0) {
                alertService.error('stockAdjustmentCreation.notCachedData');
                return $q.reject();
            }
            return $q.resolve(array);
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
