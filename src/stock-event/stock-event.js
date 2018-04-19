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
     * @name stock-event.StockEvent
     *
     * @description
     * Represents a single Stock Event.
     */
    angular
        .module('stock-event')
        .factory('StockEvent', StockEvent);

    function StockEvent() {

        return StockEvent;

        /**
         * @ngdoc method
         * @methodOf stock-event.StockEvent
         * @name StockEvent
         *
         * @description
         * Creates a new instance of the Stock Event class.
         *
         * @param  {String}    resourceId       the resource Id
         * @param  {Array}     lineItems        the stock event line items
         * @param  {String}    programId        the program UUID
         * @param  {String}    facilityId       the facility UUID
         * @param  {String}    signature        the signature
         * @return {StockEvent}                 the Stock Event object
         */
        function StockEvent(resourceId, lineItems, programId, facilityId, signature) {
            this.resourceId = resourceId;
            this.lineItems = lineItems;
            this.programId = programId;
            this.facilityId = facilityId;
            this.signature = signature;
        }
    }
})();
