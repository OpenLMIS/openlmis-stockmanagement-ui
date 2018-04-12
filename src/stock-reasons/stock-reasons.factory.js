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
     * @name stock-reasons.stockReasonsFactory
     *
     * @description
     * Prepares the list of reasons based on the retrieved reason assignments.
     * All methods are filtering out hidden reasons.
     */
    angular
        .module('stock-reasons')
        .factory('stockReasonsFactory', stockReasonsFactory);

    stockReasonsFactory.$inject = ['$filter', 'validReasonService'];

    function stockReasonsFactory($filter, validReasonService) {
        var factory = {
            getReasons: getReasons,
            getIssueReasons: getIssueReasons,
            getReceiveReasons: getReceiveReasons,
            getAdjustmentReasons: getAdjustmentReasons
        };
        return factory;

        /**
         * @ngdoc method
         * @methodOf stock-reasons.stockReasonsFactory
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
                    return reason.reasonCategory === 'TRANSFER';
                });
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-reasons.stockReasonsFactory
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
                    return reason.reasonCategory === 'TRANSFER';
                });
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-reasons.stockReasonsFactory
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
                    return reason.reasonCategory === 'ADJUSTMENT';
                });
            });
        }

        /**
         * @ngdoc method
         * @methodOf stock-reasons.stockReasonsFactory
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
        function getReasons(program, facilityType, reasonType) {
            return validReasonService.query(program, facilityType, reasonType)
            .then(function(reasonAssignments) {
                return reasonAssignments
                .filter(function(reasonAssignment) {
                    return !reasonAssignment.hidden;
                })
                .reduce(function(result, reasonAssignemnt) {
                    if (result.indexOf(reasonAssignemnt.reason) < 0) {
                        result.push(reasonAssignemnt.reason);
                    }
                    return result;
                }, []);
            });
        }
    }
})();
