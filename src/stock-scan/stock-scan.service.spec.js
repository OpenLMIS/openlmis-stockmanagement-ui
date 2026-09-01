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
        var stockScanService, scanResolutionService, resolutionError, confirmation, mode,
            confirmService, $q, $rootScope;

        module('stock-scan');

        inject(function($injector) {
            stockScanService = $injector.get('stockScanService');
            scanResolutionService = $injector.get('scanResolutionService');
            resolutionError = $injector.get('SCAN_RESOLUTION_ERROR');
            confirmation = $injector.get('SCAN_CONFIRMATION');
            mode = $injector.get('GS1_SCAN_MODE');
            confirmService = $injector.get('confirmService');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
        });

        this.service = stockScanService;
        this.ERROR = resolutionError;
        this.CONFIRMATION = confirmation;
        this.MODE = mode;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.confirmSpy = spyOn(confirmService, 'confirm').andReturn($q.resolve());
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

    describe('what it asks the user to acknowledge', function() {

        beforeEach(function() {
            this.lot = {
                id: 'lot-id',
                lotCode: 'ABC123',
                expirationDate: new Date(2028, 2, 31)
            };
            this.ask = function(reason, mode, lot) {
                var answered = {};

                this.strategyFor(mode).confirm({
                    reason: reason,
                    lot: lot || this.lot,
                    scan: {
                        lotCode: 'ABC123',
                        expirationDate: new Date(2027, 0, 30)
                    }
                })
                    .then(function() {
                        answered.accepted = true;
                    }, function() {
                        answered.declined = true;
                    });
                this.$rootScope.$apply();

                return answered;
            };
        });

        it('should add a batch while receiving without asking', function() {
            var answered = this.ask(this.CONFIRMATION.NEW_LOT, this.MODE.RECEIVE, {
                lotCode: 'NEWLOT1'
            });

            expect(this.confirmSpy).not.toHaveBeenCalled();
            expect(answered.accepted).toBe(true);
        });

        it('should ask before adding a batch during a count', function() {
            this.ask(this.CONFIRMATION.NEW_LOT, this.MODE.PHYSICAL_INVENTORY, {
                lotCode: 'NEWLOT1'
            });

            expect(this.confirmSpy).toHaveBeenCalled();
        });

        it('should ask about an expiry that disagrees with the record', function() {
            this.ask(this.CONFIRMATION.EXPIRY_MISMATCH, this.MODE.RECEIVE);

            expect(this.confirmSpy).toHaveBeenCalled();
        });

        it('should ask about a batch only once', function() {
            this.ask(this.CONFIRMATION.EXPIRY_MISMATCH, this.MODE.RECEIVE);
            this.ask(this.CONFIRMATION.EXPIRY_MISMATCH, this.MODE.RECEIVE);

            expect(this.confirmSpy.callCount).toEqual(1);
        });

        it('should ask again about a different batch', function() {
            this.ask(this.CONFIRMATION.EXPIRY_MISMATCH, this.MODE.RECEIVE);
            this.ask(this.CONFIRMATION.EXPIRY_MISMATCH, this.MODE.RECEIVE, {
                id: 'another-lot-id',
                lotCode: 'OTHER',
                expirationDate: new Date(2029, 0, 1)
            });

            expect(this.confirmSpy.callCount).toEqual(2);
        });

        it('should pass a decline back so the scan is discarded', function() {
            this.confirmSpy.andReturn(this.$q.reject());

            expect(this.ask(this.CONFIRMATION.EXPIRY_MISMATCH, this.MODE.RECEIVE).declined).toBe(true);
        });

        it('should not remember a batch the user declined', function() {
            this.confirmSpy.andReturn(this.$q.reject());
            this.ask(this.CONFIRMATION.EXPIRY_MISMATCH, this.MODE.RECEIVE);
            this.ask(this.CONFIRMATION.EXPIRY_MISMATCH, this.MODE.RECEIVE);

            expect(this.confirmSpy.callCount).toEqual(2);
        });

        it('should word a discarded scan', function() {
            expect(this.strategyFor().messages[this.ERROR.NOT_CONFIRMED])
                .toEqual('stockScan.scanDiscarded');
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
