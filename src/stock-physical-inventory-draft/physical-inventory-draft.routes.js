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

    angular
        .module('stock-physical-inventory-draft')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.stockmanagement.physicalInventory.draft', {
            url: '/:id?keyword&page&size',
            views: {
                '@openlmis': {
                    controller: 'PhysicalInventoryDraftController',
                    templateUrl: 'stock-physical-inventory-draft/physical-inventory-draft.html',
                    controllerAs: 'vm'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT],
            params: {
                program: undefined,
                facility: undefined,
                draft: undefined
            },
            resolve: {
                draft: function($stateParams, physicalInventoryFactory) {
                    if (_.isUndefined($stateParams.draft)) {
                        return physicalInventoryFactory.getPhysicalInventory($stateParams.id);
                    }
                    return $stateParams.draft;
                },
                program: function($stateParams, programService, draft) {
                    if (_.isUndefined($stateParams.program)) {
                        return programService.get(draft.programId);
                    }
                    return $stateParams.program;
                },
                facility: function($stateParams, facilityFactory) {
                    if (_.isUndefined($stateParams.facility)) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                displayLineItemsGroup: function(paginationService, physicalInventoryService, $stateParams, $filter,
                    draft, orderableGroupService) {
                    $stateParams.size = '@@STOCKMANAGEMENT_PAGE_SIZE';

                    var validator = function(items) {
                        return _.chain(items).flatten()
                            .every(function(item) {
                                return !!item.quantityInvalid === false;
                            })
                            .value();
                    };

                    return paginationService.registerList(validator, $stateParams, function() {
                        var searchResult = physicalInventoryService.search($stateParams.keyword, draft.lineItems);
                        var lineItems = $filter('orderBy')(searchResult, 'orderable.productCode');

                        var groups = _.chain(lineItems).filter(function(item) {
                            var hasQuantity = !(_.isNull(item.quantity) || _.isUndefined(item.quantity));
                            var hasSoh = !_.isNull(item.stockOnHand);
                            return item.isAdded || hasQuantity || hasSoh;
                        })
                            .each(function(lineItem) {
                                if (lineItem.quantity === -1) {
                                    lineItem.quantity = null;
                                }
                                if (!lineItem.stockCardId && !(lineItem.lot && lineItem.lot.id)) {
                                    lineItem.isNewSlot = true;
                                }
                                lineItem.isAdded = true;
                            })
                            .groupBy(function(lineItem) {
                                return lineItem.orderable.id;
                            })
                            .values()
                            .value();
                        groups.forEach(function(group) {
                            group.forEach(function(lineItem) {
                                orderableGroupService.determineLotMessage(lineItem, group);
                            });
                        });
                        return groups;
                    });
                },
                reasons: function(facility, program, stockReasonsFactory) {
                    return stockReasonsFactory.getReasons(
                        program.id ? program.id : program,
                        facility.type ? facility.type.id : facility
                    );
                }
            }
        });
    }
})();
