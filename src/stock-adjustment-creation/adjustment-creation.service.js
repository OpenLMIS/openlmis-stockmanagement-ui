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
   * @name stock-card-summaries.stockCardSummariesService
   *
   * @description
   * Responsible for fetching stock card summaries.
   */
  angular
    .module('stock-adjustment-creation')
    .service('stockAdjustmentCreationService', service);

  service.$inject = ['$resource', 'stockmanagementUrlFactory', 'openlmisDateFilter'];

  function service($resource, stockmanagementUrlFactory, openlmisDateFilter) {
    var resource = $resource(stockmanagementUrlFactory('/api/stockEvents'), {}, {});

    this.search = search;

    this.submitAdjustments = submitAdjustments;

    function search(keyword, items) {
      var result = [];

      if (!_.isEmpty(keyword)) {
        keyword = keyword.trim();
        result = _.filter(items, function (item) {
          var searchableFields = [
            item.orderable.productCode, item.orderable.fullProductName,
            item.stockOnHand ? item.stockOnHand.toString() : "",
            item.reason.name, item.reasonFreeText ? item.reasonFreeText.toString() : "",
            item.quantity ? item.quantity.toString() : "",
            openlmisDateFilter(item.occurredDate)
          ];
          return _.any(searchableFields, function (field) {
            return field.toLowerCase().contains(keyword.toLowerCase());
          });
        })
      } else {
        result = items;
      }

      return result;
    }

    function submitAdjustments(programId, facilityId, lineItems) {
      var event = {programId: programId, facilityId: facilityId};
      event.lineItems = _.map(lineItems, function (item) {
        return {
          orderableId: item.orderable.id,
          quantity: item.quantity,
          occurredDate: item.occurredDate.toISOString(),
          reasonId: item.reason.id,
          reasonFreeText: item.reason.isFreeTextAllowed ? item.reasonFreeText : null
        };
      });
      return resource.save(event).$promise;
    }
  }
})();
