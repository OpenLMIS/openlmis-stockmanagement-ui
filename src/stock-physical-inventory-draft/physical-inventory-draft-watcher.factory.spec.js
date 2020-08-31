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

describe('PhysicalInventoryDraftWatcher', function() {

    var draftStorage;

    beforeEach(function() {
        module('stock-physical-inventory-draft', function($provide) {
            draftStorage = jasmine.createSpyObj('draftStorage', ['put']);
            var offlineFlag = jasmine.createSpyObj('offlineDrafts', ['getAll', 'clearAll', 'put']);
            offlineFlag.getAll.andReturn([false]);
            var localStorageFactorySpy = jasmine.createSpy('localStorageFactory').andCallFake(function(name) {
                if (name === 'offlineFlag') {
                    return offlineFlag;
                }
                return draftStorage;
            });
            $provide.service('localStorageFactory', function() {
                return localStorageFactorySpy;
            });
        });

        inject(function($injector) {
            this.PhysicalInventoryDraftWatcher = $injector.get('PhysicalInventoryDraftWatcher');
            this.$rootScope = $injector.get('$rootScope');
            this.$timeout = $injector.get('$timeout');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.PhysicalInventoryDataBuilder = $injector.get('PhysicalInventoryDataBuilder');
            this.PhysicalInventoryLineItemDataBuilder = $injector.get('PhysicalInventoryLineItemDataBuilder');
            this.physicalInventoryDraftCacheService = $injector.get('physicalInventoryDraftCacheService');
            this.PhysicalInventoryLineItemAdjustmentDataBuilder =
                $injector.get('PhysicalInventoryLineItemAdjustmentDataBuilder');
        });

        spyOn(this.physicalInventoryDraftCacheService, 'cacheDraft').andCallThrough();
        this.scope = this.$rootScope.$new();
        this.draft = new this.PhysicalInventoryDataBuilder()
            .withLineItems([
                new this.PhysicalInventoryLineItemDataBuilder()
                    .withQuantity(50)
                    .withOrderable(new this.OrderableDataBuilder()
                        .withProductCode('C100')
                        .build())
                    .build(),
                new this.PhysicalInventoryLineItemDataBuilder()
                    .withStockAdjustments([
                        new this.PhysicalInventoryLineItemAdjustmentDataBuilder()
                            .withQuantity(20)
                            .build()
                    ])
                    .withOrderable(new this.OrderableDataBuilder()
                        .withProductCode('C200')
                        .build())
                    .build()
            ]);

        new this.PhysicalInventoryDraftWatcher(this.scope, this.draft);
        this.scope.$digest();
    });

    describe('line items watcher', function() {

        it('should save draft after changes in quantity', function() {
            this.draft.lineItems[0].quantity = 100;
            this.scope.$digest();
            this.$timeout.flush();

            expect(this.physicalInventoryDraftCacheService.cacheDraft).toHaveBeenCalledWith(this.draft);
        });

        it('should save draft after adding new stock adjustments', function() {
            this.draft.lineItems[0].stockAdjustments = [
                new this.PhysicalInventoryLineItemAdjustmentDataBuilder()
                    .withQuantity(10)
                    .build()
            ];
            this.scope.$digest();
            this.$timeout.flush();

            expect(this.physicalInventoryDraftCacheService.cacheDraft).toHaveBeenCalledWith(this.draft);
        });

        it('should save draft after changes in stock adjustments', function() {
            this.draft.lineItems[1].stockAdjustments = [
                new this.PhysicalInventoryLineItemAdjustmentDataBuilder()
                    .withQuantity(100)
                    .build()
            ];
            this.scope.$digest();
            this.$timeout.flush();

            expect(this.draft.lineItems[1].stockAdjustments.length).toEqual(1);
            expect(this.physicalInventoryDraftCacheService.cacheDraft).toHaveBeenCalledWith(this.draft);
        });

        it('should save draft after adding new line items', function() {
            this.draft.lineItems.push(new this.PhysicalInventoryLineItemDataBuilder()
                .withQuantity(80)
                .withOrderable(new this.OrderableDataBuilder()
                    .withProductCode('C300')
                    .build())
                .build());
            this.scope.$digest();
            this.$timeout.flush();

            expect(this.draft.lineItems.length).toEqual(3);
            expect(this.physicalInventoryDraftCacheService.cacheDraft).toHaveBeenCalledWith(this.draft);
        });

        it('should not save draft if quantity has not changed', function() {
            this.draft.lineItems[0].quantity = 50;
            this.scope.$digest();
            this.$timeout.flush();

            expect(this.physicalInventoryDraftCacheService.cacheDraft).not.toHaveBeenCalled();
        });
    });

});
