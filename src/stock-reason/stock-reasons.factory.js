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
     * @name stock-reason.stockReasonsFactory
     *
     * @description
     * Prepares the list of reasons based on the retrieved reason assignments.
     * All methods are filtering out hidden reasons.
     */
    angular
        .module('stock-reason')
        .factory('stockReasonsFactory', stockReasonsFactory);

    stockReasonsFactory.$inject = ['$filter', 'ValidReasonResource', 'REASON_CATEGORIES', 'localStorageFactory',
        'offlineService', '$q', 'alertService'];

    function stockReasonsFactory($filter, ValidReasonResource, REASON_CATEGORIES, localStorageFactory, offlineService,
                                 $q, alertService) {

        var offlineReasons = localStorageFactory('validReasons');
        var factory = {
            getReasons: getReasons,
            getIssueReasons: getIssueReasons,
            getReceiveReasons: getReceiveReasons,
            getAdjustmentReasons: getAdjustmentReasons,
            getUnpackReasons: getUnpackReasons,
            clearReasonsCache: clearReasonsCache
        };
        return factory;

        /**
         * @ngdoc method
         * @methodOf stock-reason.stockReasonsFactory
         * @name getIssueReasons
         *
         * @description
         * Retrieves a list of reason assignments, extract the list of reason from it and filter issues reasons.
         *
         * @param  {String}  program      the UUID of the program
         * @param  {String}  facilityType the UUID of the facility type
         * @return {Promise}              the promise resolving to the list of reasons
         */
        function getIssueReasons(program, facilityType) {
            return getReasons(program, facilityType, 'DEBIT')
                .then(function(reasons) {
                    return reasons.filter(function(reason) {
                        return reason.reasonCategory === REASON_CATEGORIES.TRANSFER;
                    });
                });
        }

        /**
         * @ngdoc method
         * @methodOf stock-reason.stockReasonsFactory
         * @name getReceiveReasons
         *
         * @description
         * Retrieves a list of reason assignments, extract the list of reason from it and filter receive reasons.
         *
         * @param   {String}    program         the UUID of the program
         * @param   {String}    facilityType    the UUID of the facility type
         * @return  {Promise}                   the promise resolving to the list of reasons
         */
        function getReceiveReasons(program, facilityType) {
            return getReasons(program, facilityType, 'CREDIT')
                .then(function(reasons) {
                    return reasons.filter(function(reason) {
                        return reason.reasonCategory === REASON_CATEGORIES.TRANSFER;
                    });
                });
        }

        /**
         * @ngdoc method
         * @methodOf stock-reason.stockReasonsFactory
         * @name getAdjustmentReasons
         *
         * @description
         * Retrieves a list of reason assignments, extract the list of reason from it and filter adjustment reasons.
         *
         * @param   {String}    program         the UUID of the program
         * @param   {String}    facilityType    the UUID of the facility type
         * @return  {Promise}                   the promise resolving to the list of reasons
         */
        function getAdjustmentReasons(program, facilityType) {
            return getReasons(program, facilityType)
                .then(function(reasons) {
                    return reasons.filter(function(reason) {
                        return reason.reasonCategory === REASON_CATEGORIES.ADJUSTMENT;
                    });
                });
        }

        /**
         * @ngdoc method
         * @methodOf stock-reason.stockReasonsFactory
         * @name getUnpackReasone
         *
         * @description
         * Retrieves a list of unpacking event reason assignments
         *
         * @param   {string}    program         the UUID of the program
         * @param   {string}    facilityType    the UUID of the facility type
         * @return  {Promise}                   the promise resolving to the list of reasons
         */
        function getUnpackReasons(program, facilityType) {
            return getReasons(program, facilityType)
                .then(function(reasons) {
                    return reasons.filter(function(reason) {
                        return reason.reasonCategory === REASON_CATEGORIES.AGGREGATION;
                    });
                });
        }

        /**
         * @ngdoc method
         * @methodOf stock-reason.stockReasonsFactory
         * @name getReasons
         *
         * @description
         * Retrieves a list of reason assignments and extract the list of reason from it.
         *
         * @param  {String}  program      the UUID of the program
         * @param  {String}  facilityType the UUID of the facility type
         * @param  {Object}  reasonType   the reason type, can be an array
         * @return {Promise}              the promise resolving to the list of reasons
         */
        function getReasons(programIds, facilityType, reasonType) {
            return $q.resolve(getReasonsPromise(programIds, facilityType, reasonType)
                .then(function(reasonAssignments) {
                    return reasonAssignments
                        .filter(function(reasonAssignment) {
                            return !reasonAssignment.hidden;
                        })
                        .reduce(function(result, reasonAssignment) {
                            if (result.indexOf(reasonAssignment.reason) < 0) {
                                result.push(reasonAssignment.reason);
                            }
                            if (!offlineService.isOffline()) {
                                cacheReasons(reasonAssignment, programIds, facilityType);
                            }
                            return result;
                        }, []);
                }));
        }

        function getReasonsPromise(programIds, facilityType, reasonType) {
            if (offlineService.isOffline()) {
                var reasons = offlineReasons.search({
                    programId: programIds,
                    reasonType: reasonType,
                    facilityType: facilityType
                });

                if (reasons.length === 0) {
                    alertService.error('stockReason.notCachedData');
                    return $q.reject();
                }
                return $q.resolve(reasons);
            }
            return new ValidReasonResource().query({
                program: programIds,
                facilityType: facilityType,
                reasonType: reasonType
            });
        }

        function cacheReasons(reasonAssignment, programIds, facilityType) {
            var reason = angular.copy(reasonAssignment.reason);
            var reasonToCache = {
                id: reasonAssignment.id,
                programId: programIds,
                facilityType: facilityType,
                reasonType: reason.reasonType,
                reason: reason,
                hidden: reasonAssignment.hidden
            };

            offlineReasons.put(reasonToCache);
        }

        function clearReasonsCache() {
            offlineReasons.clearAll();
        }
    }
})();
