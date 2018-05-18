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

        Reason.prototype.save = save;
        Reason.prototype.addAssignment = addAssignment;
        Reason.prototype.removeAssignment = removeAssignment;
        Reason.prototype.isPhysicalReason = isPhysicalReason;

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
            this.id = json ? json.id : undefined;
            this.name = json ? json.name : undefined;
            this.reasonType = json ? json.reasonType : undefined;
            this.reasonCategory = json ? json.reasonCategory : undefined;
            this.isFreeTextAllowed = json ? json.isFreeTextAllowed : false;
            this.tags = json ? json.tags : [];
            this.assignments = json ? json.assignments : [];
            this.repository = repository;
            this.addedAssignments = [];
            this.removedAssignments = [];
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

        /**
         * @ngdoc method
         * @methodOf stock-reason.Reason
         * @name addAssignment
         *
         * @description
         * Adds the given assignment to the list of reason assignment. Also stores information if
         * the assignment has been previously removed and not saved. If an already existing
         * assignment is added this method will return a rejected promise.
         * 
         * @param  {Object}  assignment the assignment to add
         * @return {Promise}            the promise resolved when assignment was successfully added
         */
        function addAssignment(assignment) {
            var error = validateReasonAssignmentDoesNotExist(this, assignment);
            if (error) {
                return $q.reject(error);
            }

            assignment.reason = {
                id: this.id
            };

            var existingAssignment = getAssignmentByProgramAndFacilityType(this.removedAssignments, assignment);
            if (!existingAssignment || (existingAssignment && existingAssignment.hidden !== assignment.hidden)) {
                this.addedAssignments.push(assignment);
            }
            if (existingAssignment) {
                this.removedAssignments.splice(this.removedAssignments.indexOf(existingAssignment), 1);
            }

            this.assignments.push(assignment);

            return $q.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf stock-reason.Reason
         * @name removeAssignment
         * 
         * @description
         * Removes the given assignment from the list of reason assignments. Also stores information
         * if the assignment has been previously added and not saved.
         * 
         * @param {Object} assignment the assignment to be removed
         */
        function removeAssignment(assignment) {
            var error = validateReasonAssignmentExists(this, assignment);
            if (error) {
                return $q.reject(error);
            }

            var existingAssignment = getAssignmentByProgramAndFacilityType(this.addedAssignments, assignment);
            if (!existingAssignment) {
                this.removedAssignments.push(assignment);
            } else {
                this.addedAssignments.splice(this.addedAssignments.indexOf(existingAssignment), 1);
            }

            this.assignments.splice(this.assignments.indexOf(assignment), 1);

            return $q.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf stock-reason.Reason
         * @name save
         * 
         * @description
         * Saves this reason in the repository.
         * 
         * @return {Promise} the promise resolving to saved Reason, rejected if save was unsuccessful
         */
        function save() {
            if (this.id) {
                return this.repository.update(this);
            } else {
                return this.repository.create(this);
            }
        }

        function validateReasonAssignmentDoesNotExist(reason, assignment) {
            if (isAssignmentDuplicated(reason, assignment)) {
                return 'adminReasonAdd.validReasonDuplicated';
            }
        }

        function validateReasonAssignmentExists(reason, assignment) {
            if (reason.assignments.indexOf(assignment) === -1) {
                return 'The given assignment is not on the list';
            }
        }

        function isAssignmentDuplicated(reason, newAssignment) {
            return reason.assignments.filter(function(assignment) {
                return assignment.program.id === newAssignment.program.id &&
                    assignment.facilityType.id === newAssignment.facilityType.id;
            }).length;
        }

        function getAssignmentByProgramAndFacilityType(assignments, newAssignment) {
            return assignments.filter(function(assignment) {
                return assignment.program.id === newAssignment.program.id
                    && assignment.facilityType.id === newAssignment.facilityType.id;
            })[0];
        }

    }

})();
