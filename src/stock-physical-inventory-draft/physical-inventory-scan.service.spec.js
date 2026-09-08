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

describe('physicalInventoryScanService', function() {

    beforeEach(function() {
        var physicalInventoryScanService, mode, featureFlagService, stockScanService, flagName;

        module('stock-physical-inventory-draft');

        inject(function($injector) {
            physicalInventoryScanService = $injector.get('physicalInventoryScanService');
            mode = $injector.get('GS1_SCAN_MODE');
            featureFlagService = $injector.get('featureFlagService');
            stockScanService = $injector.get('stockScanService');
            flagName = $injector.get('GS1_SCANNING_FEATURE_FLAG');
        });

        this.service = physicalInventoryScanService;
        this.MODE = mode;
        this.flagName = flagName;
        this.resolveSpy = spyOn(stockScanService, 'resolve');
        this.flagSpy = spyOn(featureFlagService, 'get');
    });

    describe('mode', function() {

        it('should count in the physical inventory mode', function() {
            expect(this.service.mode()).toEqual(this.MODE.PHYSICAL_INVENTORY);
        });
    });

    describe('isEnabled', function() {

        it('should be enabled when the flag is on', function() {
            this.flagSpy.andReturn(true);

            expect(this.service.isEnabled()).toBe(true);
        });

        it('should be disabled when the flag is off', function() {
            this.flagSpy.andReturn(false);

            expect(this.service.isEnabled()).toBe(false);
        });

        it('should be disabled when the flag is not registered', function() {
            this.flagSpy.andReturn(undefined);

            expect(this.service.isEnabled()).toBe(false);
        });

        it('should read the barcode scanning flag', function() {
            this.flagSpy.andReturn(true);

            this.service.isEnabled();

            expect(this.flagSpy).toHaveBeenCalledWith(this.flagName);
        });
    });

    describe('resolve', function() {

        it('should delegate to the stock scan service in the physical inventory mode', function() {
            var scan = {
                    gtin: '05890123456786'
                },
                tradeItem = {
                    id: 'trade-item-id'
                },
                screen = {
                    lineItems: []
                };

            this.service.resolve(scan, tradeItem, screen);

            expect(this.resolveSpy)
                .toHaveBeenCalledWith(scan, tradeItem, this.MODE.PHYSICAL_INVENTORY, screen);
        });
    });

});
