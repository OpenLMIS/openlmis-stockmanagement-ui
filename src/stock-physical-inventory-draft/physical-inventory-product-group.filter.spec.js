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
        physicalInventoryLineItem, programId,
        oralContraceptiveCategoryDisplayName,
        implantableContraceptiveCategoryDisplayName;

    beforeEach(function() {
        module('stock-physical-inventory-draft');

        inject(function($injector) {
            $filter = $injector.get('$filter');

            groupByProgramProductCategoryFilter = $filter('groupByProgramProductCategory');
            programId = 'pid123';
            oralContraceptiveCategoryDisplayName = 'Oral contraceptive';
            implantableContraceptiveCategoryDisplayName = 'Implantable contraceptive';

            physicalInventoryLineItem =
                [
                    [
                        generatePhysicalInventoryLineItem(0, {}, 'C100', oralContraceptiveCategoryDisplayName),
                        generatePhysicalInventoryLineItem(80, null, 'C100', oralContraceptiveCategoryDisplayName)
                    ],
                    [  generatePhysicalInventoryLineItem(0, null, 'C234'
                        , implantableContraceptiveCategoryDisplayName) ],
                    [  generatePhysicalInventoryLineItem(0, null, 'C239'
                        , implantableContraceptiveCategoryDisplayName) ]
                ];

            function generatePhysicalInventoryLineItem(stockOnHand, lot, productCode, categoryName) {
                return {
                    stockOnHand: 0,
                    lot: {},
                    orderable: {
                        productCode: productCode,
                        programs: [
                            {
                                programId: programId,
                                orderableCategoryDisplayName: categoryName
                            }
                        ]
                    }
                };
            }

        });

    });

    it('should return empty object for empty array lineItems', function() {
        expect(groupByProgramProductCategoryFilter([], programId)).toEqual({});
    });

    it('should group line item for non-empty lineItem', function() {
        var groupedLineItem = groupByProgramProductCategoryFilter(physicalInventoryLineItem, programId);

        expect(Object.keys(groupedLineItem).length).toEqual(2);
    });

    it('should be grouped by orderableCategoryDisplayName', function() {
        var groupedLineItem = groupByProgramProductCategoryFilter(physicalInventoryLineItem, programId);
        var groupLineItemKeys = Object.keys(groupedLineItem);

        expect(groupLineItemKeys.indexOf(oralContraceptiveCategoryDisplayName)).toBeGreaterThan(-1);
        expect(groupLineItemKeys.indexOf(implantableContraceptiveCategoryDisplayName)).toBeGreaterThan(-1);
    });
});
