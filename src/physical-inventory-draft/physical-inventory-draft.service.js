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
   * @name physical-inventory-draft.physicalInventoryDraftService
   *
   * @description
   * Responsible for searching by keyword.
   */
  angular
    .module('physical-inventory-draft')
    .service('physicalInventoryDraftService', service);

  service.$inject = ['$resource', 'stockmanagementUrlFactory'];

  function service($resource, stockmanagementUrlFactory) {

    var resource = $resource(stockmanagementUrlFactory('/api/physicalInventories/draft'), {}, {
      submitPhysicalInventory: {
        method: 'POST',
        url: stockmanagementUrlFactory('/api/stockEvents')
      }
    });

    this.search = search;

    this.saveDraft = saveDraft;

    this.submitPhysicalInventory = submit;

    /**
     * @ngdoc method
     * @methodOf physical-inventory-draft.physicalInventoryDraftService
     * @name search
     *
     * @description
     * Searching from given line items by keyword.
     *
     * @param {String} keyword  keyword
     * @param {Array} lineItems all line items
     * @return {Array} result   search result
     */
    function search(keyword, lineItems) {
      var result = lineItems;
      if (!_.isEmpty(keyword)) {
        keyword = keyword.trim();
        result = _.filter(lineItems, function (item) {
          var searchableFields = [
            item.orderable.productCode, item.orderable.fullProductName,
            item.orderable.dispensable ? item.orderable.dispensable.dispensingUnit : "",
            item.stockOnHand ? item.stockOnHand.toString() : "",
            item.quantity && item.quantity != -1 ? item.quantity.toString() : ""
          ];
          return _.any(searchableFields, function (field) {
            return field.toLowerCase().contains(keyword.toLowerCase());
          });
        });
      }

      return result;
    }

    function saveDraft(draft) {
      var copyDraft = {};
      copyDraft.programId = draft.programId;
      copyDraft.facilityId = draft.facilityId;
      copyDraft.lineItems = _.map(draft.lineItems, function (lineItem) {
        var quantity = null;
        if (!lineItem.quantity && lineItem.isAdded) {
          quantity = -1;
        } else {
          quantity = lineItem.quantity;
        }
        return {
          orderable: {id: lineItem.orderable.id},
          quantity: quantity
        };
      });
      return resource.save(copyDraft).$promise;
    }

    function submit(physicalInventory) {
      physicalInventory.lineItems.forEach(function (item) {
        item.orderableId = item.orderable.id;
        item.orderable = null;
      });
      return resource.submitPhysicalInventory(physicalInventory).$promise;
    }
  }
})();
