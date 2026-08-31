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

describe('stockScanService', function() {

    beforeEach(function() {
        var stockScanService, scanResolutionService, resolutionError, mode;

        module('stock-scan');

        inject(function($injector) {
            stockScanService = $injector.get('stockScanService');
            scanResolutionService = $injector.get('scanResolutionService');
            resolutionError = $injector.get('SCAN_RESOLUTION_ERROR');
            mode = $injector.get('GS1_SCAN_MODE');
        });

        this.service = stockScanService;
        this.ERROR = resolutionError;
        this.MODE = mode;
        this.resolveSpy = spyOn(scanResolutionService, 'resolve');

        this.scan = {
            gtin: '05890123456786',
            lotCode: 'ABC123'
        };
        this.tradeItem = {
            id: 'trade-item-id'
        };
        this.screen = {
            orderableGroups: [],
            lineItems: [],
            addLine: jasmine.createSpy('addLine'),
            onCounted: jasmine.createSpy('onCounted')
        };

        this.strategyFor = function(mode) {
            this.service.resolve(this.scan, this.tradeItem, mode || this.MODE.RECEIVE, this.screen);

            return this.resolveSpy.mostRecentCall.args[2];
        };

        this.lineItem = function(quantity, netContent) {
            return {
                orderable: {
                    netContent: netContent
                },
                quantity: quantity
            };
        };
    });

    describe('what it hands the resolution service', function() {

        it('should pass the screen\'s own rows and callbacks', function() {
            var strategy = this.strategyFor();

            expect(strategy.orderableGroups).toBe(this.screen.orderableGroups);
            expect(strategy.lineItems).toBe(this.screen.lineItems);
            expect(strategy.addLine).toBe(this.screen.addLine);
            expect(strategy.tracksLots).toBe(true);
        });

        it('should pass the screen\'s focus callback when it has one', function() {
            this.screen.focusLine = jasmine.createSpy('focusLine');

            expect(this.strategyFor().focusLine).toBe(this.screen.focusLine);
        });

        it('should word every refusal in the stock screens\' own messages', function() {
            var messages = this.strategyFor().messages;

            expect(messages[this.ERROR.PRODUCT_NOT_AVAILABLE]).toEqual('stockScan.productNotOnScreen');
            expect(messages[this.ERROR.PRODUCT_AMBIGUOUS]).toEqual('stockScan.productAmbiguous');
            expect(messages[this.ERROR.LOT_NOT_AVAILABLE]).toEqual('stockScan.lotNotOnScreen');
            expect(messages[this.ERROR.LOT_REQUIRED]).toEqual('stockScan.lotRequired');
        });
    });

    describe('which workflows may count an unrecorded batch', function() {

        it('should allow it when receiving', function() {
            expect(this.strategyFor(this.MODE.RECEIVE).allowsNewLot).toBe(true);
        });

        it('should allow it when counting stock', function() {
            expect(this.strategyFor(this.MODE.PHYSICAL_INVENTORY).allowsNewLot).toBe(true);
        });

        it('should refuse it when issuing', function() {
            expect(this.strategyFor(this.MODE.ISSUE).allowsNewLot).toBe(false);
        });

        it('should refuse it when adjusting', function() {
            expect(this.strategyFor(this.MODE.ADJUSTMENT).allowsNewLot).toBe(false);
        });

        it('should refuse it for a mode it does not know', function() {
            expect(this.strategyFor('SOMETHING_ELSE').allowsNewLot).toBe(false);
        });
    });

    describe('counting a line', function() {

        it('should raise the quantity by one pack', function() {
            var lineItem = this.lineItem(20, 20);

            this.strategyFor().countLine(lineItem);

            expect(lineItem.quantity).toEqual(40);
        });

        it('should refresh the derived packs fields', function() {
            var lineItem = this.lineItem(20, 20);

            this.strategyFor().countLine(lineItem);

            expect(lineItem.quantityInPacks).toEqual(2);
            expect(lineItem.quantityRemainderInDoses).toEqual(0);
        });

        it('should leave a part pack already counted alone', function() {
            var lineItem = this.lineItem(25, 20);

            this.strategyFor().countLine(lineItem);

            expect(lineItem.quantity).toEqual(45);
            expect(lineItem.quantityInPacks).toEqual(2);
            expect(lineItem.quantityRemainderInDoses).toEqual(5);
        });

        it('should treat an empty quantity as zero', function() {
            var lineItem = this.lineItem(undefined, 20);

            this.strategyFor().countLine(lineItem);

            expect(lineItem.quantity).toEqual(20);
        });

        it('should count one at a time for a product with no pack size', function() {
            var lineItem = this.lineItem(3, undefined);

            this.strategyFor().countLine(lineItem);

            expect(lineItem.quantity).toEqual(4);
        });

        it('should tell the screen the line was counted', function() {
            var lineItem = this.lineItem(20, 20);

            this.strategyFor().countLine(lineItem);

            expect(this.screen.onCounted).toHaveBeenCalledWith(lineItem);
        });
    });

});
