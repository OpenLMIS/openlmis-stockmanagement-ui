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

 describe('approvedOrderableGroupsFactory', function () {

     var approvedOrderableGroupsFactory, orderableGroupService, SEARCH_OPTIONS,
         program, facility, orderableGroups, ProgramDataBuilder, FacilityDataBuilder,
         OrderableGroupDataBuilder;

     beforeEach(function () {
         module('stock-adjustment-creation');
         module('referencedata-program');
         module('referencedata-facility');

         inject(function($injector) {
             approvedOrderableGroupsFactory = $injector.get('approvedOrderableGroupsFactory');
             orderableGroupService = $injector.get('orderableGroupService');
             ProgramDataBuilder = $injector.get('ProgramDataBuilder');
             FacilityDataBuilder = $injector.get('FacilityDataBuilder');
             OrderableGroupDataBuilder = $injector.get('OrderableGroupDataBuilder');
             SEARCH_OPTIONS = $injector.get('SEARCH_OPTIONS');
         });
         program = new ProgramDataBuilder().build();
         facility = new FacilityDataBuilder().build();
         orderableGroups = [
             new OrderableGroupDataBuilder().build()
         ];

         spyOn(orderableGroupService, 'findAvailableProductsAndCreateOrderableGroups')
         .andReturn(orderableGroups);
     });

     it("should get approved orderable groups", function () {
         var stateParams = {someParam: 'value'};
         var items = approvedOrderableGroupsFactory(stateParams, program, facility);

         expect(items).toEqual(orderableGroups);
         expect(orderableGroupService.findAvailableProductsAndCreateOrderableGroups)
         .toHaveBeenCalledWith(program.id, facility.id, SEARCH_OPTIONS.INCLUDE_APPROVED_ORDERABLES);
     });
 });
