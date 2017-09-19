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
     * @name stock-physical-inventory-draft.physicalInventoryDraftFactory
     *
     * @description
     * Allows the user to perform some logic on draft and call draft service.
     */
    angular
        .module('stock-physical-inventory-draft')
        .factory('physicalInventoryDraftFactory', factory);

    factory.$inject = ['physicalInventoryDraftService'];

    function factory(physicalInventoryDraftService) {

        return {
            saveDraft: saveDraft
        };

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.physicalInventoryDraftFactory
         * @name saveDraft
         *
         * @description
         * Performs logic on physical inventory draft and calls save method from draft service.
         *
         * @param  {draft}   draft Physical Inventory Draft to be saved
         * @return {Promise}       Saved draft
         */
        function saveDraft(draft) {
            var physicalInventory = angular.copy(draft);

            physicalInventory.lineItems = [];
            angular.forEach(draft.lineItems, function(item) {
                physicalInventory.lineItems.push({
                    orderableId: item.orderable.id,
                    lotId: item.lot ? item.lot.id : null,
                    quantity: (_.isNull(item.quantity) || _.isUndefined(item.quantity)) && item.isAdded ? -1 : item.quantity,
                    extraData: {
                        vvmStatus: item.vvmStatus
                    },
                    stockAdjustments: item.stockAdjustments
                });
            });

            return physicalInventoryDraftService.saveDraft(physicalInventory);
        }
    }
})();
