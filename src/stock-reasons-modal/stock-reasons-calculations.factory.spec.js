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

describe('stockReasonsCalculations', function() {

    var stockReasonsCalculations, adjustments, lineItem;

    beforeEach(function() {
        module('stock-reasons-modal');

        inject(function($injector) {
            stockReasonsCalculations = $injector.get('stockReasonsCalculations');
        });

        adjustments = [{
            quantity: 10,
            reason: {
                reasonType: 'CREDIT'
            }
        }, {
            quantity: 4,
            reason: {
                reasonType: 'DEBIT'
            }
        }];

        lineItem = {
            quantity: 10,
            stockOnHand: 3
        };
    });

    describe('calculateUnaccounted ', function() {

        it('should calculate unaccounted', function() {
            expect(stockReasonsCalculations.calculateUnaccounted(lineItem, adjustments)).toEqual(1);
            expect(stockReasonsCalculations.calculateUnaccounted(lineItem, [])).toEqual(7);
        });

        it('should throw exception for invalid reason type', function() {
            adjustments[1].reason.reasonType = 'invalid reason type';

            expect(function() {
                stockReasonsCalculations.calculateUnaccounted(lineItem, adjustments);
            }).toThrow('invalid reason type');
        });

        it('should throw exception if adjustments are not given', function() {
            expect(function() {
                stockReasonsCalculations.calculateUnaccounted(lineItem, undefined);
            }).toThrow('adjustments must be defined');
        });

        it('should throw exception if lineItem is undefined', function() {
            expect(function() {
                stockReasonsCalculations.calculateUnaccounted(undefined, lineItem);
            }).toThrow();
        });

    });

    describe('calculateTotal', function() {

        it('should calculate total value', function() {
            expect(stockReasonsCalculations.calculateTotal(adjustments)).toEqual(6);
        });

        it('should throw exception for invalid reason type', function() {
            adjustments[1].reason.reasonType = 'invalid reason type';

            expect(function() {
                stockReasonsCalculations.calculateTotal(adjustments);
            }).toThrow('invalid reason type');
        });

        it('should throw exception if adjustments are not given', function() {
            expect(function() {
                stockReasonsCalculations.calculateTotal(undefined);
            }).toThrow('adjustments must be defined');
        });

        it('should return 0 for empty list', function() {
            expect(stockReasonsCalculations.calculateTotal([])).toBe(0);
        });
    });

    describe('calculateDifference', function() {

        it('should calculate difference between quantity and stockOnHand', function() {
            expect(stockReasonsCalculations.calculateDifference(lineItem)).toEqual(7);
        });

        it('should throw exception if lineItem is undefined', function() {
            expect(function() {
                stockReasonsCalculations.calculateDifference(undefined);
            }).toThrow();
        });

        it('should treat undefined as 0', function() {
            lineItem.quantity = undefined;
            lineItem.stockOnHand = 12;

            expect(stockReasonsCalculations.calculateDifference(lineItem)).toEqual(-12);

            lineItem.quantity = 14;
            lineItem.stockOnHand = undefined;

            expect(stockReasonsCalculations.calculateDifference(lineItem)).toEqual(14);

            lineItem.quantity = undefined;
            lineItem.stockOnHand = undefined;

            expect(stockReasonsCalculations.calculateDifference(lineItem)).toEqual(0);
        });

    });

});
