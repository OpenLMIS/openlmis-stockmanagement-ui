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
        .module('stock-reasons')
        .factory('ReasonDataBuilder', ReasonDataBuilder);

    ReasonDataBuilder.$inject = ['Reason', 'REASON_TYPES', 'REASON_CATEGORIES'];

    function ReasonDataBuilder(Reason, REASON_TYPES, REASON_CATEGORIES) {

        ReasonDataBuilder.prototype.build = build;
        ReasonDataBuilder.prototype.buildDebitReason = buildDebitReason;
        ReasonDataBuilder.prototype.buildCreditReason = buildCreditReason;
        ReasonDataBuilder.prototype.buildPhysicalInventoryReason = buildPhysicalInventoryReason;
        ReasonDataBuilder.prototype.buildTransferReason = buildTransferReason;
        ReasonDataBuilder.prototype.buildAdjustmentReason = buildAdjustmentReason;

        return ReasonDataBuilder;

        function ReasonDataBuilder() {
            ReasonDataBuilder.instanceNumber = (ReasonDataBuilder.instanceNumber || 0) + 1;

            this.id = 'reason-id' + ReasonDataBuilder.instanceNumber;
            this.name = 'Damage';
        }

        function build() {
            return new Reason(
                this.id,
                this.name
            );
        }

        function buildDebitReason() {
            return new Reason(
                this.id,
                "Transfer Out",
                REASON_TYPES.DEBIT

             );
        }

        function buildCreditReason() {
            return new Reason(
                this.id,
                "Transfer In",
                REASON_TYPES.CREDIT
            );
        }

        function buildPhysicalInventoryReason() {
            return new Reason(
                this.id,
                "Transfer In",
                REASON_TYPES.BALANCE_ADJUSTMENT,
                REASON_CATEGORIES.PHYSICAL_INVENTORY
            );
        }

        function buildTransferReason() {
            return new Reason(
                this.id,
                "Transfer In",
                REASON_TYPES.CREDIT,
                REASON_CATEGORIES.TRANSFER
            );
        }

        function buildAdjustmentReason() {
            return new Reason(
                this.id,
                "Transfer In",
                REASON_TYPES.CREDIT,
                REASON_CATEGORIES.ADJUSTMENT
            );
        }

    }

})();
