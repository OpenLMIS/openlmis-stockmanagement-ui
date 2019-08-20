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
     * @name stock-adjustment-creation.stockAdjustmentCreationService
     *
     * @description
     * Responsible for search and submit stock adjustments.
     */
    angular
        .module('stock-adjustment-creation')
        .service('stockAdjustmentCreationService', service);

    service.$inject = [
        '$filter', '$resource', 'stockmanagementUrlFactory', 'openlmisDateFilter', 'messageService',
        'productNameFilter', '$http'
    ];

    function service($filter, $resource, stockmanagementUrlFactory, openlmisDateFilter,
                     messageService, productNameFilter, $http) {
        var resource = $resource(stockmanagementUrlFactory('/api/stockEvents'));

        this.search = search;

        this.submitAdjustments = submitAdjustments;
        this.saveDraft = saveDraft;
        this.deleteDraft = deleteDraft;

        this.getMapOfIdAndOrderable = function(orderableGroups) {
            var mapOfIdAndOrderable = {};
            _.forEach(orderableGroups, function(og) {
                og.forEach(function(orderableWrapper) {
                    var orderable = orderableWrapper.orderable;
                    var id = orderableWrapper.orderable.id;
                    mapOfIdAndOrderable[id] = orderable;
                });
            });
            return mapOfIdAndOrderable;
        };

        this.getMapOfIdAndLot = function(lineItems) {
            var url = stockmanagementUrlFactory('/api/lots');
            var firstId = true;
            lineItems.forEach(function(draftLineItem) {
                var id = draftLineItem.lotId;
                if (firstId) {
                    url += '?id=' + id;
                    firstId = false;
                } else {
                    url += '&id=' + id;
                }
            });

            return $http.get(url).then(function(res) {
                var mapOfIdAndLot = {};
                _.forEach(res.data.content, function(lot) {
                    mapOfIdAndLot[lot.id] = lot;
                });
                return mapOfIdAndLot;
            });
        };

        this.getStochOnHand = function(stockCardSummaries, orderableId, lotId) {
            _.forEach(stockCardSummaries, function(product) {
                _.forEach(product.canFulfillForMe, function(line) {
                    if (line.lot.id === lotId && line.orderable.id === orderableId) {
                        return line.stockOnHand;
                    }
                });
            });
        };

        function saveDraft(draft, lineItems, adjustmentType) {

            draft.lineItems = _.map(lineItems, function(item) {
                var newLine = {
                    orderableId: item.orderable.id,
                    lotId: item.lot ? item.lot.id : null,
                    quantity: item.quantity,
                    extraData: {
                        vvmStatus: item.vvmStatus
                    },
                    occurredDate: item.occurredDate,
                    reasonId: item.reason ? item.reason.id : null,
                    reasonFreeText: item.reasonFreeText
                };

                if (adjustmentType.state === 'receive') {
                    newLine.sourceId = _.get(item, 'assignment.node.id');
                    newLine.sourceFreeText = item.srcDstFreeText;
                } else if (adjustmentType.state === 'issue') {
                    newLine.destinationId = _.get(item, 'assignment.node.id');
                    newLine.destinationFreeText = item.srcDstFreeText;
                }

                return newLine;
            });

            var url = stockmanagementUrlFactory('/api/drafts') + '/' + draft.id;
            return $http.put(url, draft);
        }

        function deleteDraft(draftId) {
            var url = stockmanagementUrlFactory('/api/drafts') + '/' + draftId;
            return $http.delete(url);
        }

        function search(keyword, items, hasLot) {
            var result = [];

            if (_.isEmpty(keyword)) {
                result = items;
            } else {
                keyword = keyword.trim();
                result = _.filter(items, function(item) {
                    var hasStockOnHand = !(_.isNull(item.stockOnHand) || _.isUndefined(item.stockOnHand));
                    var hasQuantity = !(_.isNull(item.quantity) || _.isUndefined(item.quantity));
                    var searchableFields = [
                        item.orderable.productCode,
                        productNameFilter(item.orderable),
                        hasStockOnHand ? item.stockOnHand.toString() : '',
                        item.reason ? item.reason.name : '',
                        safeGet(item.reasonFreeText),
                        hasQuantity ? item.quantity.toString() : '',
                        getLot(item, hasLot),
                        item.lot ? openlmisDateFilter(item.lot.expirationDate) : '',
                        item.assignment ? item.assignment.name : '',
                        safeGet(item.srcDstFreeText),
                        openlmisDateFilter(item.occurredDate)
                    ];
                    return _.any(searchableFields, function(field) {
                        return field.toLowerCase().contains(keyword.toLowerCase());
                    });
                });
            }

            return result;
        }

        function submitAdjustments(programId, facilityId, lineItems, adjustmentType) {
            var event = {
                programId: programId,
                facilityId: facilityId
            };
            event.lineItems = _.map(lineItems, function(item) {
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

        function safeGet(value) {
            return value || '';
        }

        function getLot(item, hasLot) {
            return item.lot ?
                item.lot.lotCode :
                (hasLot ? messageService.get('orderableGroupService.noLotDefined') : '');
        }
    }
})();
