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

describe('REASON_TYPES', function() {

    var REASON_TYPES;

    beforeEach(function() {
        module('stock-constants');

        inject(function($injector) {
            REASON_TYPES = $injector.get('REASON_TYPES');
        });
    });

    describe('getLabel', function() {

        it('should return label for CREDIT type', function() {
            expect(REASON_TYPES.getLabel(REASON_TYPES.CREDIT)).toBe('stockConstants.credit');
        });

        it('should return label for DEBIT type', function() {
            expect(REASON_TYPES.getLabel(REASON_TYPES.DEBIT)).toBe('stockConstants.debit');
        });

        it('should return label for BALANCE_ADJUSTMENT type', function() {
            expect(REASON_TYPES.getLabel(REASON_TYPES.BALANCE_ADJUSTMENT)).toBe('stockConstants.balanceAdjustment');
        });

        it('should throw an exception for unknown type', function() {
            expect(function() {
                REASON_TYPES.getLabel('unknown');
            }).toThrow('"unknown" is not a valid type');
        });
    });

    describe('getTypes', function() {

        it('should return all reason types', function() {
            expect(REASON_TYPES.getTypes()).toEqual([
                REASON_TYPES.CREDIT,
                REASON_TYPES.DEBIT,
                REASON_TYPES.BALANCE_ADJUSTMENT
            ]);
        });
    });
});
