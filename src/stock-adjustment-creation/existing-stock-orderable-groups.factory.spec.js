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

describe('existingStockOrderableGroupsFactory', function() {

    var $q, $rootScope, existingStockOrderableGroupsFactory, orderableGroupService, program, facility, orderableGroups,
        ProgramDataBuilder, FacilityDataBuilder, OrderableGroupDataBuilder, stateParams, user, rightName;

    beforeEach(function() {
        module('stock-adjustment-creation');
        module('referencedata-program');
        module('referencedata-facility');

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            existingStockOrderableGroupsFactory = $injector.get('existingStockOrderableGroupsFactory');
            orderableGroupService = $injector.get('orderableGroupService');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            OrderableGroupDataBuilder = $injector.get('OrderableGroupDataBuilder');
        });
        program = new ProgramDataBuilder().build();
        facility = new FacilityDataBuilder().build();
        orderableGroups = [
            new OrderableGroupDataBuilder().build()
        ];
        stateParams = {
            someParam: 'value'
        };
        user = {};
        user['user_id'] = 'eb394b9e-161f-45d2-a4c5-c91fc516fde3';
        rightName = 'STOCK_ADJUST';
    });

    it('should get existing orderable groups', function() {
        spyOn(orderableGroupService, 'findAvailableProductsAndCreateOrderableGroups')
            .andReturn($q.resolve(orderableGroups));

        var items;
        existingStockOrderableGroupsFactory.getGroupsWithoutStock(stateParams, program, facility, user, rightName)
            .then(function(response) {
                items = response;
            });
        $rootScope.$apply();

        expect(items).toEqual(orderableGroups);
        expect(orderableGroupService.findAvailableProductsAndCreateOrderableGroups)
            .toHaveBeenCalledWith(program.id, facility.id,
                false, 'eb394b9e-161f-45d2-a4c5-c91fc516fde3', 'STOCK_ADJUST');
    });

    it('should not get existing orderable groups with zero SOH', function() {
        orderableGroups = [
            new OrderableGroupDataBuilder().withStockOnHand(0)
                .build()
        ];
        spyOn(orderableGroupService, 'findAvailableProductsAndCreateOrderableGroups')
            .andReturn($q.resolve(orderableGroups));

        var items;
        existingStockOrderableGroupsFactory.getGroupsWithoutStock(stateParams, program, facility, user, rightName)
            .then(function(response) {
                items = response;
            });
        $rootScope.$apply();

        expect(items).toEqual([]);
        expect(orderableGroupService.findAvailableProductsAndCreateOrderableGroups)
            .toHaveBeenCalledWith(program.id, facility.id,
                false, 'eb394b9e-161f-45d2-a4c5-c91fc516fde3', 'STOCK_ADJUST');
    });

    it('should return orderable groups from state params', function() {
        spyOn(orderableGroupService, 'findAvailableProductsAndCreateOrderableGroups');
        var stateParams = {
            orderableGroups: orderableGroups
        };
        var items = existingStockOrderableGroupsFactory
            .getGroupsWithoutStock(stateParams, program, facility, user, rightName);

        expect(items).toEqual(orderableGroups);
        expect(orderableGroupService.findAvailableProductsAndCreateOrderableGroups)
            .not.toHaveBeenCalled();
    });
});