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
     * @name stock-physical-inventory-draft.physicalInventoryDraftService
     *
     * @description
     * Responsible for searching by keyword.
     */
    angular
        .module('stock-physical-inventory-draft')
        .service('physicalInventoryDraftService', service);

    service.$inject = ['$filter', '$resource', 'stockmanagementUrlFactory', 'messageService', 'openlmisDateFilter', 'productNameFilter'];

    function service($filter, $resource, stockmanagementUrlFactory, messageService, openlmisDateFilter, productNameFilter) {
        var resource = $resource(stockmanagementUrlFactory('/api/physicalInventories'), {}, {
            submitPhysicalInventory: {
                method: 'POST',
                url: stockmanagementUrlFactory('/api/stockEvents')
            }
        });

        this.search = search;
        this.saveDraft = saveDraft;
        this.delete = deleteDraft;
        this.submitPhysicalInventory = submit;

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.physicalInventoryDraftService
         * @name search
         *
         * @description
         * Searching from given line items by keyword.
         *
         * @param {String} keyword   keyword
         * @param {Array}  lineItems all line items
         * @return {Array} result    search result
         */
        function search(keyword, lineItems) {
            var result = lineItems;
            var hasLot = _.any(lineItems, function(item) {
                return item.lot;
            });

            if (!_.isEmpty(keyword)) {
                keyword = keyword.trim();
                result = _.filter(lineItems, function (item) {
                    var hasStockOnHand = !(_.isNull(item.stockOnHand) || _.isUndefined(item.stockOnHand));
                    var hasQuantity = !(_.isNull(item.quantity) || _.isUndefined(item.quantity)) && item.quantity !== -1;
                    var searchableFields = [
                        item.orderable.productCode, productNameFilter(item.orderable),
                        hasStockOnHand ? item.stockOnHand.toString() : "",
                        hasQuantity ? item.quantity.toString() : "",
                        item.lot ? item.lot.lotCode : (hasLot? messageService.get('orderableLotUtilService.noLotDefined') : ""),
                        item.lot ? openlmisDateFilter(item.lot.expirationDate) : ""
                    ];
                    return _.any(searchableFields, function (field) {
                        return field.toLowerCase().contains(keyword.toLowerCase());
                    });
                });
            }

            return result;
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.physicalInventoryDraftService
         * @name saveDraft
         *
         * @description
         * Saves physical inventory draft.
         *
         * @param  {Object} draft Draft that will be saved
         * @return {Promise}      Saved draft
         */
        function saveDraft(draft) {
            return resource.save(draft).$promise;
        }

        function deleteDraft(programId, facilityId) {
            return resource.delete({program: programId, facility: facilityId}).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.physicalInventoryDraftService
         * @name submit
         *
         * @description
         * Submits physical inventory draft.
         *
         * @param  {Object} draft Draft that will be saved
         * @return {Promise}      Submitted Physical Inventory
         */
        function submit(physicalInventory) {
            var event = _.clone(physicalInventory);
            event.lineItems = physicalInventory.lineItems
            .filter(function (item) {
                return item.isAdded;
            })
            .map(function (item) {
                return {
                    orderableId: item.orderable.id,
                    lotId: item.lot ? item.lot.id : null,
                    quantity: item.quantity,
                    occurredDate: $filter('isoDate')(physicalInventory.occurredDate),
                    extraData: {
                        vvmStatus: item.vvmStatus
                    },
                    stockAdjustments: item.stockAdjustments
                };
            });

            return resource.submitPhysicalInventory(event).$promise;
        }
    }
})();
