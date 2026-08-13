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

describe('scanResolutionService', function() {

    beforeEach(function() {
        var scanResolutionService, mode, $rootScope;

        module('stock-scan');

        inject(function($injector) {
            scanResolutionService = $injector.get('scanResolutionService');
            mode = $injector.get('GS1_SCAN_MODE');
            $rootScope = $injector.get('$rootScope');
        });

        this.service = scanResolutionService;
        this.MODE = mode;
        this.$rootScope = $rootScope;

        this.tradeItem = {
            id: 'trade-item-id'
        };
        this.orderable = {
            id: 'orderable-id',
            netContent: 20,
            identifiers: {
                tradeItem: 'trade-item-id'
            }
        };
        this.lot = {
            id: 'lot-id',
            lotCode: 'ABC123'
        };

        this.group = [{
            orderable: this.orderable,
            lot: this.lot,
            stockOnHand: 100
        }];

        this.scan = {
            gtin: '05890123456786',
            lotCode: 'ABC123'
        };

        this.strategy = {
            orderableGroups: [this.group],
            lineItems: [],
            addLine: jasmine.createSpy('addLine'),
            tallyLine: jasmine.createSpy('tallyLine')
        };

        this.resolve = function(scan, mode) {
            var outcome = {};

            this.service
                .resolve(scan || this.scan, this.tradeItem, mode || this.MODE.ISSUE, this.strategy)
                .then(function() {
                    outcome.resolved = true;
                }, function(rejection) {
                    outcome.rejection = rejection;
                });
            this.$rootScope.$apply();

            return outcome;
        };
    });

    describe('when the product is not on the screen', function() {

        it('should reject when no group carries the trade item', function() {
            this.strategy.orderableGroups = [];

            var outcome = this.resolve();

            expect(outcome.rejection).toEqual('stockScan.productNotOnScreen');
            expect(this.strategy.addLine).not.toHaveBeenCalled();
        });

        it('should reject when more than one group carries the trade item', function() {
            this.strategy.orderableGroups = [this.group, angular.copy(this.group)];

            var outcome = this.resolve();

            expect(outcome.rejection).toEqual('stockScan.productAmbiguous');
            expect(this.strategy.addLine).not.toHaveBeenCalled();
        });
    });

    describe('when the lot cannot be matched', function() {

        it('should reject for a workflow that does not create lots', function() {
            var outcome = this.resolve({
                gtin: this.scan.gtin,
                lotCode: 'UNKNOWN'
            }, this.MODE.ISSUE);

            expect(outcome.rejection).toEqual('stockScan.lotNotOnScreen');
        });

        it('should reject distinctly for a workflow that will create lots', function() {
            var outcome = this.resolve({
                gtin: this.scan.gtin,
                lotCode: 'UNKNOWN'
            }, this.MODE.RECEIVE);

            expect(outcome.rejection).toEqual('stockScan.lotNotYetCreatable');
        });

        it('should reject when the scan carries no lot code and the product is lot tracked', function() {
            var outcome = this.resolve({
                gtin: this.scan.gtin
            });

            expect(outcome.rejection).toEqual('stockScan.lotRequired');
        });
    });

    describe('when the scan resolves', function() {

        it('should add a line for a product not yet on the screen', function() {
            var outcome = this.resolve();

            expect(outcome.resolved).toBe(true);
            expect(this.strategy.addLine).toHaveBeenCalledWith(this.group, this.lot);
        });

        it('should start a newly added line at one', function() {
            var added = {
                orderable: this.orderable
            };

            this.strategy.addLine.andReturn(added);

            this.resolve();

            expect(added.quantity).toEqual(1);
            expect(this.strategy.tallyLine).toHaveBeenCalledWith(added);
        });

        it('should tolerate a screen that reports no line back', function() {
            this.strategy.addLine.andReturn(undefined);

            var outcome = this.resolve();

            expect(outcome.resolved).toBe(true);
            expect(this.strategy.tallyLine).not.toHaveBeenCalled();
        });

        it('should match the lot code without regard to case', function() {
            this.resolve({
                gtin: this.scan.gtin,
                lotCode: 'abc123'
            });

            expect(this.strategy.addLine).toHaveBeenCalledWith(this.group, this.lot);
        });

        it('should add a line with no lot when the group has a no-lot entry', function() {
            this.group.push({
                orderable: this.orderable,
                lot: null,
                stockOnHand: 5
            });

            this.resolve({
                gtin: this.scan.gtin
            });

            expect(this.strategy.addLine).toHaveBeenCalledWith(this.group, undefined);
        });
    });

    describe('when a line for the scan already exists', function() {

        beforeEach(function() {
            this.lineItem = {
                orderable: this.orderable,
                lot: this.lot,
                quantity: 20
            };
            this.strategy.lineItems = [this.lineItem];
        });

        it('should tally it instead of adding another', function() {
            var outcome = this.resolve();

            expect(outcome.resolved).toBe(true);
            expect(this.strategy.addLine).not.toHaveBeenCalled();
            expect(this.strategy.tallyLine).toHaveBeenCalledWith(this.lineItem);
        });

        it('should raise the quantity by one dose', function() {
            this.resolve();

            expect(this.lineItem.quantity).toEqual(21);
        });

        it('should refresh the derived packs fields', function() {
            this.resolve();

            expect(this.lineItem.quantityInPacks).toEqual(1);
            expect(this.lineItem.quantityRemainderInDoses).toEqual(1);
        });

        it('should treat an empty quantity as zero', function() {
            this.lineItem.quantity = undefined;

            this.resolve();

            expect(this.lineItem.quantity).toEqual(1);
        });

        it('should not tally a line of the same product but a different lot', function() {
            this.lineItem.lot = {
                id: 'another-lot-id',
                lotCode: 'OTHER'
            };

            this.resolve();

            expect(this.strategy.tallyLine).not.toHaveBeenCalled();
            expect(this.strategy.addLine).toHaveBeenCalled();
        });
    });

});
