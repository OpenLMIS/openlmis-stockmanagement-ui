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
        'productNameFilter', '$http', 'LotRepositoryImpl'
    ];

    function service($filter, $resource, stockmanagementUrlFactory, openlmisDateFilter,
                     messageService, productNameFilter, $http, LotRepositoryImpl) {
        var resource = $resource(stockmanagementUrlFactory('/api/stockEvents'));
        var lotRepositoryImpl = new LotRepositoryImpl();

        this.search = search;

        this.submitAdjustments = submitAdjustments;
        this.saveDraft = saveDraft;
        this.deleteDraft = deleteDraft;

        this.getAssignmentById = function(srcDstAssignments, srcDstId) {
            var assignment = null;
            _.forEach(srcDstAssignments, function(item) {
                if (item.node && item.node.id === srcDstId) {
                    assignment = item;
                }
            });
            return assignment;
        };

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
            var ids = _
                .chain(lineItems)
                .map(function(draftLineItem) {
                    return draftLineItem.lotId;
                })
                .uniq()
                .filter(function(id) {
                    return !(_.isEmpty(id));
                })
                .value();

            return lotRepositoryImpl.query({
                id: ids
            }).then(function(data) {
                var mapOfIdAndLot = {};
                _.forEach(data.content, function(lot) {
                    mapOfIdAndLot[lot.id] = lot;
                });
                return mapOfIdAndLot;
            });
        };

        this.getStochOnHand = function(stockCardSummaries, orderableId, lotId) {
            var stockOnHand = 0;
            _.forEach(stockCardSummaries, function(product) {
                _.forEach(product.canFulfillForMe, function(line) {
                    if (_.isEmpty(lotId)) {
                        if (_.isEmpty(line.lot) && line.orderable && line.orderable.id === orderableId) {
                            stockOnHand = line.stockOnHand;
                        }
                    } else if (line.lot && line.lot.id === lotId && line.orderable &&
                        line.orderable.id === orderableId) {
                        stockOnHand = line.stockOnHand;
                    }
                });
            });

            return stockOnHand;
        };

        this.getDraftById = function(draftId, adjustmentType, programId, facilityId, userId) {
            return $http.get(stockmanagementUrlFactory('/api/drafts'), {
                params: {
                    program: programId,
                    facility: facilityId,
                    isDraft: true,
                    userId: userId,
                    draftType: adjustmentType.state
                }
            }).then(function(res) {
                return _.find(res.data, function(d) {
                    return d.id === draftId;
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
                    reasonFreeText: item.reason ? item.reason.name : null,
                    documentNumber: item.documentationNo
                };

                var nodeId = null;
                // var name = null;
                if (item.assignment) {
                    nodeId = item.assignment.node && item.assignment.node.id;
                    // name = item.assignment.name;
                }

                if (adjustmentType.state === 'receive') {
                    newLine.sourceId = nodeId;
                    newLine.sourceFreeText = item.srcDstFreeText;
                } else if (adjustmentType.state === 'issue') {
                    newLine.destinationId = nodeId;
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

        function submitAdjustments(programId, facilityId, lineItems, adjustmentType, signature) {
            var event = {
                programId: programId,
                facilityId: facilityId,
                signature: signature
            };
            event.lineItems = _.map(lineItems, function(item) {
                return angular.merge({
                    orderableId: item.orderable.id,
                    lotId: item.lot ? item.lot.id : null,
                    lotCode: (item.lot && !item.lot.id) ? item.lot.lotCode : null,
                    expirationDate: (item.lot && item.lot.expirationDate) ? item.lot.expirationDate : null,
                    quantity: item.quantity,
                    extraData: {
                        vvmStatus: item.vvmStatus
                    },
                    occurredDate: item.occurredDate,
                    reasonId: item.reason ? item.reason.id : null,
                    reasonFreeText: item.reasonFreeText,
                    documentationNo: item.documentationNo ? item.documentationNo : '',
                    programId: item.programId
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
