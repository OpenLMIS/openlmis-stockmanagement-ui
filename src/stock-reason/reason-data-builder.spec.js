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
        .module('stock-reason')
        .factory('ReasonDataBuilder', ReasonDataBuilder);

    ReasonDataBuilder.$inject = ['Reason', 'REASON_TYPES', 'REASON_CATEGORIES'];

    function ReasonDataBuilder(Reason, REASON_TYPES, REASON_CATEGORIES) {

        ReasonDataBuilder.prototype.build = build;
        ReasonDataBuilder.prototype.buildJson = buildJson;
        ReasonDataBuilder.prototype.buildResponse = buildResponse;
        ReasonDataBuilder.prototype.withId = withId;
        ReasonDataBuilder.prototype.withAssignments = withAssignments;
        ReasonDataBuilder.prototype.buildDebitReason = buildDebitReason;
        ReasonDataBuilder.prototype.buildCreditReason = buildCreditReason;
        ReasonDataBuilder.prototype.buildPhysicalInventoryReason = buildPhysicalInventoryReason;
        ReasonDataBuilder.prototype.buildTransferReason = buildTransferReason;
        ReasonDataBuilder.prototype.buildAdjustmentReason = buildAdjustmentReason;
        ReasonDataBuilder.prototype.withoutId = withoutId;
        ReasonDataBuilder.prototype.withAddedAssignments = withAddedAssignments;
        ReasonDataBuilder.prototype.withRemovedAssignments = withRemovedAssignments;

        return ReasonDataBuilder;

        function ReasonDataBuilder() {
            ReasonDataBuilder.instanceNumber = (ReasonDataBuilder.instanceNumber || 0) + 1;

            this.id = 'reason-id' + ReasonDataBuilder.instanceNumber;
            this.name = 'Name' + ReasonDataBuilder.instanceNumber;
            this.reasonType = REASON_TYPES.CREDIT;
            this.reasonCategory = REASON_CATEGORIES.PHYSICAL_INVENTORY;
            this.tags = [];
            this.assignments = [];
            this.addedAssignments = [];
            this.removedAssignments = [];
        }

        function build() {
            return new Reason(this.buildJson());
        }

        function buildJson() {
            var json = this.buildResponse();

            json.assignments = this.assignments;
            json.addedAssignments = this.addedAssignments;
            json.removedAssignments = this.removedAssignments;

            return json;
        }

        function buildResponse() {
            return {
                id: this.id,
                name: this.name,
                reasonType: this.reasonType,
                reasonCategory: this.reasonCategory,
                tags: this.tags
            };
        }

        function withId(id) {
            this.id = id;
            return this;
        }

        function withAssignments(assignments) {
            this.assignments = assignments;
            return this;
        }

        function withAddedAssignments(assignments) {
            this.addedAssignments = assignments;
            return this;
        }

        function withRemovedAssignments(assignments) {
            this.removedAssignments = assignments;
            return this;
        }

        function buildDebitReason() {
            this.name = 'Transfer Out';
            this.reasonType = REASON_TYPES.DEBIT;
            return this.build();
        }

        function buildCreditReason() {
            this.name = 'Transfer In';
            this.reasonType = REASON_TYPES.CREDIT;
            return this.build();
        }

        function buildPhysicalInventoryReason() {
            this.reasonType = REASON_TYPES.BALANCE_ADJUSTMENT;
            this.reasonCategory = REASON_CATEGORIES.PHYSICAL_INVENTORY;
            return this.build();
        }

        function buildTransferReason() {
            this.reasonType = REASON_TYPES.CREDIT;
            this.reasonCategory = REASON_CATEGORIES.TRANSFER;
            return this.build();
        }

        function buildAdjustmentReason() {
            this.reasonType = REASON_TYPES.CREDIT;
            this.reasonCategory = REASON_CATEGORIES.ADJUSTMENT;
            return this.build();
        }

        function withoutId() {
            this.id = undefined;
            return this;
        }

    }

})();
