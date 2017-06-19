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
   * @name stock-adjustment-creation.stockAdjustmentCreationService
   *
   * @description
   * Responsible for search and submit stock adjustments.
   */
  angular
    .module('stock-adjustment-creation')
    .service('stockAdjustmentCreationService', service);

  service.$inject = ['$resource', 'stockmanagementUrlFactory', 'openlmisDateFilter',
    'messageService', 'productNameFilter'];

  function service($resource, stockmanagementUrlFactory, openlmisDateFilter,
                   messageService, productNameFilter) {
    var resource = $resource(stockmanagementUrlFactory('/api/stockEvents'));

    this.search = search;

    this.submitAdjustments = submitAdjustments;

    function search(keyword, items, hasLot) {
      var result = [];

      if (!_.isEmpty(keyword)) {
        keyword = keyword.trim();
        result = _.filter(items, function (item) {
          var hasStockOnHand = !(_.isNull(item.stockOnHand) || _.isUndefined(item.stockOnHand));
          var hasQuantity = !(_.isNull(item.quantity) || _.isUndefined(item.quantity));
          var searchableFields = [
            item.orderable.productCode, productNameFilter(item.orderable),
            hasStockOnHand ? item.stockOnHand.toString() : '',
            item.reason ? item.reason.name : '', item.reasonFreeText || '',
            hasQuantity ? item.quantity.toString() : '',
            item.lot ? item.lot.lotCode : (hasLot ? messageService.get('orderableLotUtilService.noLotDefined') : ""),
            item.lot ? openlmisDateFilter(item.lot.expirationDate) : '',
            item.assignment ? item.assignment.name : '', item.srcDstFreeText || '',
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

    function submitAdjustments(programId, facilityId, lineItems, adjustmentType) {
      var event = {programId: programId, facilityId: facilityId};
      event.lineItems = _.map(lineItems, function (item) {
        return angular.merge({
          orderableId: item.orderable.id,
          lotId: item.lot ? item.lot.id : null,
          quantity: item.quantity,
          extraData: {
            vvmStatus: item.vvmStatus
          },
          occurredDate: item.occurredDate,
          reasonId: item.reason ? item.reason.id : null,
          reasonFreeText: item.reasonFreeText
        }, buildSourceDestinationInfo(item, adjustmentType));
      });
      return resource.save(event).$promise;
    }

    function buildSourceDestinationInfo(item, adjustmentType) {
      var res = {};
      if (adjustmentType.state === 'receive') {
        res.sourceId = item.assignment.node.id;
        res.sourceFreeText = item.srcDstFreeText;
      } else if (adjustmentType.state === 'issue') {
        res.destinationId = item.assignment.node.id;
        res.destinationFreeText = item.srcDstFreeText;
      }
      return res;
    }
  }
})();
