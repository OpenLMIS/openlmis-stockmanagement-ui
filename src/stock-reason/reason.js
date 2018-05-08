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
     * @name stock-reason.Reason
     *
     * @description
     * Represents a single stock reason.
     */
    angular
        .module('stock-reason')
        .factory('Reason', Reason);

    Reason.$inject = ['REASON_CATEGORIES', '$q'];

    function Reason(REASON_CATEGORIES, $q) {

        Reason.prototype.isPhysicalReason = isPhysicalReason;
        Reason.prototype.save = save;
        Reason.prototype.addAssignment = addAssignment;
        Reason.prototype.removeAssignment = removeAssignment;

        return Reason;

        /**
         * @ngdoc method
         * @methodOf stock-reason.Reason
         * @name Reason
         *
         * @description
         * Creates a new instance of the Reason class.
         *
         * @param  {Object}                json       the JSON representation of the Reason
         * @param  {StockReasonRepository} repository the stock reason repository
         * @return {Reason}                           the Reason object
         */
        function Reason(json, repository) {
            if (json) {
                angular.copy(json, this);
            } else {
                this.isFreeTextAllowed = false;
                this.tags = [];
                this.assignments = [];
            }

            this.repository = repository;
        }

        /**
         * @ngdoc method
         * @methodOf stock-reason.Reason
         * @name isPhysicalReason
         *
         * @description
         * Checks if reason category is Physical Inventory.
         *
         * @return {boolean} true if is physical reason
         */
        function isPhysicalReason() {
            return this.reasonCategory === REASON_CATEGORIES.PHYSICAL_INVENTORY;
        }

        function addAssignment(assignment) {
            var error = validateReasonAssignment(this, assignment);

            if (error) {
                return $q.reject(error);
            }

            assignment.reason = {
                id: this.id
            };

            this.assignments.push(assignment);

            return $q.resolve();
        }

        function removeAssignment(assignment) {
            var index = this.assignments.indexOf(assignment);
            this.assignments.splice(index, 1);
        }

        function save() {
            return this.repository.create(this);
        }

        function validateReasonAssignment(reason, assignment) {
            if (isAssignmentDuplicated(reason, assignment)) {
                return 'adminReasonAdd.validReasonDuplicated';
            }
        }

        function isAssignmentDuplicated(reason, newAssignment) {
            return reason.assignments.filter(function(assignment) {
                return assignment.program.id === newAssignment.program.id &&
                    assignment.facilityType.id === newAssignment.facilityType.id;
            }).length;
        }

    }

})();
