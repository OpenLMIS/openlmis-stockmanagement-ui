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

describe('ReverseSummaryModalController', function() {

    let vm, $controller, modalDeferred, quantityUnitCalculateService, lineItems;

    beforeEach(function() {
        module('stock-transaction-history');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            const $q = $injector.get('$q');
            modalDeferred = $q.defer();
        });

        spyOn(modalDeferred, 'resolve').andReturn();
        spyOn(modalDeferred, 'reject').andReturn();

        quantityUnitCalculateService = {
            recalculateSOHQuantity: jasmine.createSpy('recalculateSOHQuantity')
                .andCallFake(function(quantity) {
                    return quantity;
                })
        };

        lineItems = [{
            orderable: {
                productCode: 'C100',
                fullProductName: 'Levora',
                netContent: 10
            },
            quantity: 50,
            stockOnHand: 4500,
            $currentStockOnHand: 4450,
            $newStockOnHand: 4500
        }];
    });

    function initController(confirmation, showInDoses) {
        vm = $controller('ReverseSummaryModalController', {
            modalDeferred: modalDeferred,
            lineItems: lineItems,
            showInDoses: showInDoses === undefined ? false : showInDoses,
            confirmation: confirmation,
            quantityUnitCalculateService: quantityUnitCalculateService
        });
        vm.$onInit();
        return vm;
    }

    it('should expose the line items and the mode on init', function() {
        initController(true);

        expect(vm.lineItems).toBe(lineItems);
        expect(vm.confirmation).toBe(true);
    });

    it('should recalculate quantities with the orderable net content', function() {
        initController(false, false);

        vm.recalculateQuantity(4450, lineItems[0]);

        expect(quantityUnitCalculateService.recalculateSOHQuantity)
            .toHaveBeenCalledWith(4450, 10, false);
    });

    describe('stockOnHandOf', function() {

        it('should show the current balance while confirming', function() {
            initController(true);

            expect(vm.stockOnHandOf(lineItems[0])).toEqual(4450);
        });

        it('should show the persisted balance when reporting the result', function() {
            initController(false);

            expect(vm.stockOnHandOf(lineItems[0])).toEqual(4500);
        });
    });

    describe('in confirmation mode', function() {

        it('should resolve when the user confirms the impact', function() {
            initController(true);

            vm.confirm();

            expect(modalDeferred.resolve).toHaveBeenCalled();
        });

        it('should reject when the user backs out', function() {
            initController(true);

            vm.cancel();

            expect(modalDeferred.reject).toHaveBeenCalled();
        });
    });

    describe('in result mode', function() {

        it('should resolve when the user acknowledges the summary', function() {
            initController(false);

            vm.confirm();

            expect(modalDeferred.resolve).toHaveBeenCalled();
        });
    });
});
