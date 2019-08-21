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
     * @name stock-event.stockEventFactory
     *
     * @description
     * Allows the user to create new stock event based on passed data.
     */
    angular
        .module('stock-event')
        .factory('stockEventFactory', factory);

    factory.$inject = [ '$filter', 'StockEventAdjustment', 'StockEventLineItem', 'StockEvent' ];

    function factory($filter, StockEventAdjustment, StockEventLineItem, StockEvent) {

        return {
            createFromPhysicalInventory: createFromPhysicalInventory
        };

        /**
         * @ngdoc method
         * @methodOf stock-event.stockEventFactory
         * @name createFromPhysicalInventory
         *
         * @description
         * Creates a stock event based on data from physical Inventory
         *
         * @param  {Object}  physicalInventory   the physical Inventory
         * @return {StockEvent}                  the new instance of stock event
         */
        function createFromPhysicalInventory(physicalInventory) {
            var physicalInventoryCopy = angular.copy(physicalInventory);
            physicalInventoryCopy.lineItems = physicalInventory.lineItems
                .filter(function(item) {
                    return item.isAdded;
                })
                .map(function(item) {
                    var stockAdjustments = [];

                    if (item.stockAdjustments) {
                        stockAdjustments = _.map(item.stockAdjustments, function(adjustment) {
                            return new StockEventAdjustment(adjustment.reason.id, adjustment.quantity);
                        });
                    }

                    return new StockEventLineItem(
                        item.orderable.id, item.lot ? item.lot.id : null,
                        item.quantity, physicalInventory.occurredDate,
                        {
                            vvmStatus: item.vvmStatus
                        }, stockAdjustments, item.lot ? item.lot.lotCode : null,
                        item.lot ? item.lot.expirationDate : null, item.stockCardId,
                        item.programId
                    );
                });

            return new StockEvent(physicalInventoryCopy);
        }
    }
})();
