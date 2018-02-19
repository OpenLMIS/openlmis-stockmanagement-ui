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
        .module('stock-valid-reason')
        .factory('ValidReasonAssignmentDataBuilder', ValidReasonAssignmentDataBuilder);

    ValidReasonAssignmentDataBuilder.$inject = ['ReasonDataBuilder', 'ObjectReferenceDataBuilder'];

    function ValidReasonAssignmentDataBuilder(ReasonDataBuilder, ObjectReferenceDataBuilder) {

        ValidReasonAssignmentDataBuilder.buildWithDebitReason = buildWithDebitReason;

        ValidReasonAssignmentDataBuilder.prototype.build = build;
        ValidReasonAssignmentDataBuilder.prototype.withReason = withReason;

        return ValidReasonAssignmentDataBuilder;

        function ValidReasonAssignmentDataBuilder() {
            ValidReasonAssignmentDataBuilder.instanceNumber =
                (ValidReasonAssignmentDataBuilder.instanceNumber || 0) + 1;

            var instanceNumber = ValidReasonAssignmentDataBuilder.instanceNumber;

            this.id = 'valid-reasong-assignment-id-' + instanceNumber;
            this.program = new ObjectReferenceDataBuilder()
                .withId('program-id-' + instanceNumber)
                .build();
            this.facilityType = new ObjectReferenceDataBuilder()
                .withId('facility-type-id-' + instanceNumber)
                .build();

            this.hidden = false;
            this.reason = new ReasonDataBuilder().build();
        }

        function buildWithDebitReason() {
            return new ValidReasonAssignmentDataBuilder()
                .withReason(new ReasonDataBuilder().buildDebitReason())
                .build();
        }

        function withReason(reason) {
            this.reason = reason;
            return this;
        }

        function build() {
            return {
                id: this.id,
                program: this.program,
                facilityType: this.facilityType,
                hidden: this.hidden,
                reason: this.reason
            };
        }

    }

})();
