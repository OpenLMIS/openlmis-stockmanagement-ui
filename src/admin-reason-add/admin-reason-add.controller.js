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
     * @ngdoc controller
     * @name admin-reason-add.controller:AdminReasonAddController
     *
     * @description
     * Exposes method for creating/updating reason to the modal view.
     */
    angular
        .module('admin-reason-add')
        .controller('AdminReasonAddController', controller);

    controller.$inject = [
        '$q', 'REASON_TYPES', 'REASON_CATEGORIES', 'reasons', 'programs', 'facilityTypes', 'reasonService', '$state',
        'loadingModalService', 'notificationService', 'messageService', 'validReasonService', '$stateParams',
        'availableTags', 'alertService', 'reasonTypes', 'reasonCategories'
    ];

    function controller($q, REASON_TYPES, REASON_CATEGORIES, reasons, programs, facilityTypes, reasonService, $state,
                        loadingModalService, notificationService, messageService, validReasonService, $stateParams,
                        availableTags, alertService, reasonTypes, reasonCategories) {
        var vm = this;

        vm.$onInit = onInit;
        vm.createReason = createReason;
        vm.addAssignment = addAssignment;
        vm.removeAssignment = removeAssignment;
        vm.validateReasonName = validateReasonName;
        vm.validateReasonAssignment = validateReasonAssignment;
        vm.getCategoryLabel = REASON_CATEGORIES.getLabel;
        vm.getTypeLabel = REASON_TYPES.getLabel;

        /**
         * @ngdoc method
         * @methodOf admin-reason-add.controller:AdminReasonAddController
         * @name $onInit
         *
         * @description
         * Initialization method of the AdminReasonAddController.
         */
        function onInit() {
            vm.reasonTypes = reasonTypes;
            vm.reasonCategories = reasonCategories;
            vm.assignments = [];
            vm.programs = programs;
            vm.facilityTypes = facilityTypes;
            vm.showReason = true;
            vm.availableTags = availableTags;
            vm.reason = {
                isFreeTextAllowed: false,
                reasonType: vm.reasonTypes[0],
                tags: []
            };
        }

        /**
         * @ngdoc method
         * @methodOf admin-reason-add.controller:AdminReasonAddController
         * @name addAssignment
         *
         * @description
         * Adds valid reason assignment.
         *
         * @return {Promise} the promise resolving to the added assignment.
         */
        function addAssignment() {
            var error = vm.validateReasonAssignment();

            if (error) {
                alertService.error(error);
                return $q.reject();
            }

            vm.assignments.push({
                program: vm.selectedProgram,
                facilityType: vm.selectedFacilityType,
                hidden: !vm.showReason
            });

            vm.selectedProgram = undefined;
            vm.selectedFacilityType = undefined;
            vm.showReason = true;

            return $q.resolve();
        }

        /**
         * @ngdoc method
         * @methodOf admin-reason-add.controller:AdminReasonAddController
         * @name remove
         *
         * @description
         * Remove an assignment.
         *
         * @param {Object} assignment   given assignment.
         */
        function removeAssignment(assignment) {
            var index = vm.assignments.indexOf(assignment);
            vm.assignments.splice(index, 1);
        }

        /**
         * @ngdoc method
         * @methodOf admin-reason-add.controller:AdminReasonAddController
         * @name createReason
         *
         * @description
         * Creates the reason.
         *
         * @return {Promise} the promise resolving to the created reason
         */
        function createReason() {
            loadingModalService.open();
            return reasonService.createReason(vm.reason).then(function(reason) {
                var requests = [];

                angular.forEach(vm.assignments, function(assignment) {
                    assignment.reason = {
                        id: reason.id
                    };
                    requests.push(validReasonService.create(assignment));
                });

                return $q.all(requests).then(function() {
                    return reason;
                });
            }).then(function() {
                $state.go('openlmis.administration.reasons', $stateParams, {
                    reload: true
                });
                notificationService.success('adminReasonAdd.reasonCreatedSuccessfully');
            }).catch(loadingModalService.close);
        }

        /**
         * @ngdoc method
         * @methodOf admin-reason-add.controller:AdminReasonAddController
         * @name validateReasonName
         *
         * @description
         * Validates the entered reason name.
         *
         * @return {String} the error message key, undefined if reason is valid
         */
        function validateReasonName() {
            if (isReasonNameDuplicated()) {
                return 'adminReasonAdd.reasonNameDuplicated';
            }
        }

        function validateReasonAssignment() {
            if (isAssignmentDuplicated()) {
                return 'adminReasonAdd.validReasonDuplicated';
            }
        }

        function isAssignmentDuplicated() {
            return vm.assignments.filter(function(assignment) {
                return assignment.program.id === vm.selectedProgram.id &&
                    assignment.facilityType.id === vm.selectedFacilityType.id;
            }).length;
        }

        function isReasonNameDuplicated() {
            if (!vm.reason || !vm.reason.name) {
                return false;
            }

            return reasons.filter(function(reason) {
                return reason.name.toUpperCase() === vm.reason.name.toUpperCase();
            }).length;
        }
    }
})();