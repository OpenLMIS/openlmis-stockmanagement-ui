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
describe('Group by program product category filter', function() {

    var groupByProgramProductCategoryFilter, $filter,
        programId, oralContraceptiveCategoryDisplayName, implantableContraceptiveCategoryDisplayName,
        lineItem, lineItem1, lineItem2, programOrderable1, programOrderable2, pagedLineItem,
        PhysicalInventoryLineItemDataBuilder, ProgramOrderableDataBuilder, OrderableDataBuilder;

    beforeEach(function() {
        module('stock-physical-inventory-draft', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            $filter = $injector.get('$filter');

            groupByProgramProductCategoryFilter = $filter('groupByProgramProductCategory');
            PhysicalInventoryLineItemDataBuilder = $injector.get('PhysicalInventoryLineItemDataBuilder');
            ProgramOrderableDataBuilder = $injector.get('ProgramOrderableDataBuilder');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');

            programId = 'pid123';
            oralContraceptiveCategoryDisplayName = 'Oral contraceptive';
            implantableContraceptiveCategoryDisplayName = 'Implantable contraceptive';

            programOrderable1 =  new ProgramOrderableDataBuilder()
                .withProgramId(programId)
                .withOrderableCategoryDisplayName(oralContraceptiveCategoryDisplayName)
                .buildJson();

            programOrderable2  = new ProgramOrderableDataBuilder()
                .withProgramId(programId)
                .withOrderableCategoryDisplayName(implantableContraceptiveCategoryDisplayName)
                .buildJson();

            lineItem = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(1)
                .withOrderable(new OrderableDataBuilder()
                    .withProductCode('C100')
                    .withFullProductName('b')
                    .withPrograms([programOrderable1])
                    .buildJson())
                .buildAsAdded();

            lineItem1 = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(34)
                .withOrderable(new OrderableDataBuilder()
                    .withProductCode('C200')
                    .withFullProductName('b')
                    .withPrograms([programOrderable2])
                    .buildJson())
                .buildAsAdded();

            lineItem2 = new PhysicalInventoryLineItemDataBuilder()
                .withQuantity(34)
                .withOrderable(new OrderableDataBuilder()
                    .withProductCode('C300')
                    .withFullProductName('b')
                    .withPrograms([programOrderable2])
                    .buildJson())
                .buildAsAdded();

            pagedLineItem = [[lineItem], [lineItem1], [lineItem2]];
        });

    });

    it('should return empty object for empty array lineItems', function() {
        expect(groupByProgramProductCategoryFilter([], programId)).toEqual({});
    });

    it('should group line item for non-empty lineItem', function() {
        var groupedLineItem = groupByProgramProductCategoryFilter(pagedLineItem, programId);

        expect(Object.keys(groupedLineItem).length).toEqual(2);
    });

    it('should be grouped by orderableCategoryDisplayName', function() {
        var groupedLineItem = groupByProgramProductCategoryFilter(pagedLineItem, programId);
        var groupLineItemKeys = Object.keys(groupedLineItem);

        expect(groupLineItemKeys.indexOf(oralContraceptiveCategoryDisplayName)).toBeGreaterThan(-1);
        expect(groupLineItemKeys.indexOf(implantableContraceptiveCategoryDisplayName)).toBeGreaterThan(-1);
    });
});
