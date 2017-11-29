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

    ReasonDataBuilder.$inject = ['Reason'];

    function ReasonDataBuilder(Reason) {

        ReasonDataBuilder.prototype.build = build;

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

    }

})();
