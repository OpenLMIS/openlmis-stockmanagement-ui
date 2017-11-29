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

(function () {

    'use strict';

    /**
     * @ngdoc service
     * @name stock-physical-inventory.physicalInventoryService
     *
     * @description
     * Responsible for retrieving physical inventory information from server.
     */
    angular
        .module('stock-physical-inventory')
        .service('physicalInventoryService', service);

    service.$inject = ['$resource', 'stockmanagementUrlFactory', '$filter', 'messageService', 'openlmisDateFilter', 'productNameFilter'];

    function service($resource, stockmanagementUrlFactory, $filter, messageService, openlmisDateFilter, productNameFilter) {
        var resource = $resource(stockmanagementUrlFactory('/api/physicalInventories'), {}, {
            get: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/physicalInventories/:id')
            },
            update: {
                method: 'PUT',
                url: stockmanagementUrlFactory('/api/physicalInventories/:id')
            },
            delete: {
                method: 'DELETE',
                url: stockmanagementUrlFactory('/api/physicalInventories/:id')
            },
            submitPhysicalInventory: {
                method: 'POST',
                url: stockmanagementUrlFactory('/api/stockEvents')
            }
        });

        this.getDraft = getDraft;
        this.createDraft = createDraft;
        this.getPhysicalInventory = getPhysicalInventory;
        this.search = search;
        this.saveDraft = saveDraft;
        this.deleteDraft = deleteDraft;
        this.submitPhysicalInventory = submit;

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name getDraft
         *
         * @description
         * Retrieves physical inventory draft by facility and program from server.
         *
         * @param  {String}  program  Program UUID
         * @param  {String}  facility Facility UUID
         * @return {Promise}          physical inventory promise
         */
        function getDraft(program, facility) {
            return resource.query({program: program, facility: facility, isDraft: true}).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name getPhysicalInventory
         *
         * @description
         * Retrieves physical inventory by id from server.
         *
         * @param  {String}  id  physical inventory UUID
         * @return {Promise}     physical inventory promise
         */
        function getPhysicalInventory(id) {
            return resource.get({id: id}).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name createDraft
         *
         * @description
         * Creates physical inventory draft by facility and program from server.
         *
         * @param  {String}  program  Program UUID
         * @param  {String}  facility Facility UUID
         * @return {Promise}          physical inventory promise
         */
        function createDraft(program, facility) {
            return resource.save({programId: program, facilityId: facility}).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
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
                        item.lot ? item.lot.lotCode : (hasLot? messageService.get('orderableGroupService.noLotDefined') : ""),
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
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name saveDraft
         *
         * @description
         * Saves physical inventory draft.
         *
         * @param  {Object} draft Draft that will be saved
         * @return {Promise}      Saved draft
         */
        function saveDraft(draft) {
            return resource.update({id: draft.id}, draft).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name deleteDraft
         *
         * @description
         * Deletes physical inventory draft.
         *
         * @param  {String}   id  Draft that will be removed
         * @return {Promise}      Promise with response
         */
        function deleteDraft(id) {
            return resource.delete({id: id}).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name submit
         *
         * @description
         * Submits physical inventory draft.
         *
         * @param  {Object} physicalInventory Draft that will be saved
         * @return {Promise}                  Submitted Physical Inventory
         */
        function submit(physicalInventory) {
            var event = _.clone(physicalInventory);
            delete event.id;
            event.resourceId = physicalInventory.id;
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
