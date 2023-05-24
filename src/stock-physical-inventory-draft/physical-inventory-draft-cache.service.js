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
     * @name stock-physical-inventory-draft.physicalInventoryDraftCacheService
     *
     * @description
     * Stores physical inventory drafts locally, deals with returning correct list of drafts for the current user.
     */
    angular
        .module('stock-physical-inventory-draft')
        .service('physicalInventoryDraftCacheService', physicalInventoryDraftCacheService);

    physicalInventoryDraftCacheService.$inject = [
        'localStorageFactory', '$q', 'OrderableResource'
    ];

    function physicalInventoryDraftCacheService(localStorageFactory, $q, OrderableResource) {

        var offlinePhysicalInventoryDrafts = localStorageFactory('physicalInventoryDrafts');
        var physicalInventoryDraftItemsWithNewLots = localStorageFactory('physicalInventoryDraftItemsWithNewLots');

        this.cacheDraft = cacheDraft;
        this.cacheItemsWithNewLots = cacheItemsWithNewLots;
        this.getDraft = getDraft;
        this.removeById = removeById;
        this.searchDraft = searchDraft;

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.physicalInventoryDraftCacheService
         * @name cacheDraft
         *
         * @description
         * Caches given physical inventory draft in the local storage.
         *
         * @param {Object} draft  the draft to be cached
         */
        function cacheDraft(draft) {
            var draftToSave = JSON.parse(JSON.stringify(draft));
            draftToSave.lineItems.forEach(function(lineItem) {
                lineItem.orderable = getVersionedObjectReference(lineItem.orderable);
            });
            offlinePhysicalInventoryDrafts.put(draftToSave);
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.physicalInventoryDraftCacheService
         * @name cacheItemsWithNewLot
         *
         * @description
         * Caches line items with new Lots from given physical inventory 
         * draft in the local storage.
         *
         * @param {Object} draft  the draft containing items with new Lots
         */
        function cacheItemsWithNewLots(draft) {
            var parsedDraft = JSON.parse(JSON.stringify(draft));
            var itemsWithNewLots = [];
            console.log(parsedDraft);
            parsedDraft.lineItems.forEach(function(lineItem) {
                if (lineItem.lot && (lineItem.lot.lotCode && !lineItem.lot.id)) {
                    itemsWithNewLots.push(lineItem);
                }
            });
            parsedDraft.lineItems = itemsWithNewLots;
            physicalInventoryDraftItemsWithNewLots.put(parsedDraft);
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.physicalInventoryDraftCacheService
         * @name getDraft
         *
         * @description
         * Retrieves given physical inventory draft from the local storage.
         *
         * @param  {String}  draftId
         *
         */ 
        function getDraft(draftId) {
            var cachedDraft,
                identities;
            cachedDraft = offlinePhysicalInventoryDrafts.search({
                id: draftId
            });

            if (cachedDraft.length === 0) {
                return $q.resolve(undefined);
            }

            identities = getResourcesFromLineItems(cachedDraft[0]);
            return getByVersionIdentities(identities, new OrderableResource())
                .then(function(result) {
                    var orderablesMap = result.reduce(function(orderablesMap, orderable) {
                        orderablesMap[orderable.id + '/' + orderable.meta.versionNumber] = orderable;
                        return orderablesMap;
                    }, {});
                    cachedDraft[0].lineItems.map(function(lineItem) {
                        lineItem.orderable = orderablesMap[lineItem.orderable.id + '/'
                        + lineItem.orderable.versionNumber];
                    });
                    return cachedDraft[0];
                });
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.physicalInventoryDraftCacheService
         * @name searchDraft
         *
         * @description
         * Retrieves given physical inventory drafts from the local storage
         * by programId and facilityId.
         *
         * @param  {String}  programId program UUID
         * @param  {String}  facilityId facility UUID
         * @return {Promise}        Array of drafts
         */
        function searchDraft(programId, facilityId) {
            return $q.resolve(
                offlinePhysicalInventoryDrafts.search({
                    programId: programId,
                    facilityId: facilityId
                })
            );
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory-draft.physicalInventoryDraftCacheService
         * @name removeById
         *
         * @description
         * Remove a physical inventory draft with the given ID.
         *
         * @param {String} draftId  the ID of the draft to delete
         */
        function removeById(draftId) {
            offlinePhysicalInventoryDrafts.removeBy('id', draftId);
        }

        function getVersionedObjectReference(resource) {
            if (resource.meta) {
                return {
                    id: resource.id,
                    versionNumber: resource.meta.versionNumber
                };
            }
            return resource;
        }

        function getResourcesFromLineItems(draft) {
            var identities = [];
            draft.lineItems.forEach(function(item) {
                identities.push(item.orderable);
            });
            return identities;
        }

        function getByVersionIdentities(identities, resource) {
            return resource.getByVersionIdentities(identities);
        }
    }
})();
