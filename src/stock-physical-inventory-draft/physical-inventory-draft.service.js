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
   * @name stock-physical-inventory-draft.physicalInventoryDraftService
   *
   * @description
   * Responsible for searching by keyword.
   */
  angular
    .module('stock-physical-inventory-draft')
    .service('physicalInventoryDraftService', service);

  service.$inject = ['$resource', 'stockmanagementUrlFactory', 'messageService',
    'openlmisDateFilter', 'productNameFilter'];

  function service($resource, stockmanagementUrlFactory, messageService, openlmisDateFilter, productNameFilter) {

    var resource = $resource(stockmanagementUrlFactory('/api/physicalInventories/draft'), {}, {
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
      if (!_.isEmpty(keyword)) {
        keyword = keyword.trim();
        result = _.filter(lineItems, function (item) {
          var searchableFields = [
            item.orderable.productCode, productNameFilter(item.orderable),
            item.stockOnHand ? item.stockOnHand.toString() : "",
            item.quantity && item.quantity != -1 ? item.quantity.toString() : "",
            item.lot ? item.lot.lotCode : messageService.get('stockPhysicalInventoryDraft.noLotDefined'),
            item.lot ? openlmisDateFilter(item.lot.expirationDate) : ""
          ];
          return _.any(searchableFields, function (field) {
            return field.toLowerCase().contains(keyword.toLowerCase());
          });
        });
      }

      return result;
    }

    function saveDraft(draft) {
      var lineItemsToSend = _.chain(draft.lineItems)
        .map(function (item) {
          var quantity = null;
          if ((_.isNull(item.quantity) || _.isUndefined(item.quantity)) && item.isAdded) {
            quantity = -1;
          } else {
            quantity = item.quantity;
          }
          var lot = item.lot ? {id: item.lot.id} : null;
          return {orderable: {id: item.orderable.id}, lot: lot, quantity: quantity};
        }).value();

      var savePhysicalInventory = _.clone(draft);
      savePhysicalInventory.lineItems = lineItemsToSend;
      return resource.save(savePhysicalInventory).$promise;
    }

    function deleteDraft(programId, facilityId) {
      return resource.delete({program: programId, facility: facilityId}).$promise;
    }

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
            occurredDate: physicalInventory.occurredDate
          };
        });

      return resource.submitPhysicalInventory(event).$promise;
    }
  }
})();
