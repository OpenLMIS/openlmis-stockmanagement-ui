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

describe('REASON_CATEGORIES', function() {

    var REASON_CATEGORIES;

    beforeEach(function() {
        module('stock-constants');

        inject(function($injector) {
            REASON_CATEGORIES = $injector.get('REASON_CATEGORIES');
        });
    });

    describe('getLabel', function() {

        it('should return label for TRANSFER category', function() {
            expect(REASON_CATEGORIES.getLabel(REASON_CATEGORIES.TRANSFER)).toBe('stockConstants.transfer');
        });

        it('should return label for ADJUSTMENT category', function() {
            expect(REASON_CATEGORIES.getLabel(REASON_CATEGORIES.ADJUSTMENT)).toBe('stockConstants.adjustment');
        });

        it('should return label for PHYSICAL_INVENTORY category', function() {
            expect(REASON_CATEGORIES.getLabel(REASON_CATEGORIES.PHYSICAL_INVENTORY)).toBe('stockConstants.physicalInventory');
        });

        it('should throw an exception for unknown category', function() {
            expect(function() {
                  REASON_CATEGORIES.getLabel('unknown')
            }).toThrow('"unknown" is not a valid category');
        });
    });

    describe('getCategories', function() {

        it('should return all reason categories', function() {
            expect(REASON_CATEGORIES.getCategories()).toEqual([
                REASON_CATEGORIES.TRANSFER,
                REASON_CATEGORIES.ADJUSTMENT,
                REASON_CATEGORIES.PHYSICAL_INVENTORY
            ]);
        });
    });
});
