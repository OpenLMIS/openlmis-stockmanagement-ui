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

describe('adjustmentScanService', function() {

    beforeEach(function() {
        var adjustmentScanService, adjustmentType, mode, featureFlagService, scanResolutionService,
            flagName;

        module('stock-adjustment-creation');

        inject(function($injector) {
            adjustmentScanService = $injector.get('adjustmentScanService');
            adjustmentType = $injector.get('ADJUSTMENT_TYPE');
            mode = $injector.get('GS1_SCAN_MODE');
            featureFlagService = $injector.get('featureFlagService');
            scanResolutionService = $injector.get('scanResolutionService');
            flagName = $injector.get('GS1_SCANNING_FEATURE_FLAG');
        });

        this.service = adjustmentScanService;
        this.TYPE = adjustmentType;
        this.MODE = mode;
        this.flagName = flagName;
        this.resolveSpy = spyOn(scanResolutionService, 'resolve');
        this.flagSpy = spyOn(featureFlagService, 'get');
    });

    describe('modeFor', function() {

        it('should map issue to the issue mode', function() {
            expect(this.service.modeFor(this.TYPE.ISSUE)).toEqual(this.MODE.ISSUE);
        });

        it('should map receive to the receive mode', function() {
            expect(this.service.modeFor(this.TYPE.RECEIVE)).toEqual(this.MODE.RECEIVE);
        });

        it('should not map kit unpack', function() {
            expect(this.service.modeFor(this.TYPE.KIT_UNPACK)).toBeUndefined();
        });

        it('should not map plain adjustments yet', function() {
            expect(this.service.modeFor(this.TYPE.ADJUSTMENT)).toBeUndefined();
        });

        it('should tolerate a missing adjustment type', function() {
            expect(this.service.modeFor(undefined)).toBeUndefined();
        });
    });

    describe('isEnabled', function() {

        it('should be enabled for a scanning workflow when the flag is on', function() {
            this.flagSpy.andReturn(true);

            expect(this.service.isEnabled(this.TYPE.ISSUE)).toBe(true);
        });

        it('should be disabled when the flag is off', function() {
            this.flagSpy.andReturn(false);

            expect(this.service.isEnabled(this.TYPE.ISSUE)).toBe(false);
        });

        it('should be disabled when the flag is not registered', function() {
            this.flagSpy.andReturn(undefined);

            expect(this.service.isEnabled(this.TYPE.ISSUE)).toBe(false);
        });

        it('should be disabled for a workflow that does not scan', function() {
            this.flagSpy.andReturn(true);

            expect(this.service.isEnabled(this.TYPE.KIT_UNPACK)).toBe(false);
        });

        it('should read the barcode scanning flag', function() {
            this.flagSpy.andReturn(true);

            this.service.isEnabled(this.TYPE.ISSUE);

            expect(this.flagSpy).toHaveBeenCalledWith(this.flagName);
        });
    });

    describe('resolve', function() {

        it('should delegate to the resolution service', function() {
            var scan = {
                    gtin: '05890123456786'
                },
                tradeItem = {
                    id: 'trade-item-id'
                },
                strategy = {
                    lineItems: []
                };

            this.service.resolve(scan, tradeItem, this.MODE.ISSUE, strategy);

            expect(this.resolveSpy)
                .toHaveBeenCalledWith(scan, tradeItem, this.MODE.ISSUE, strategy);
        });
    });

});
