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

describe('physicalInventoryService', function() {

    beforeEach(function() {
        module('stock-physical-inventory');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$httpBackend = $injector.get('$httpBackend');
            this.$rootScope = $injector.get('$rootScope');
            this.stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
            this.physicalInventoryService = $injector.get('physicalInventoryService');
            this.messageService = $injector.get('messageService');

            this.PhysicalInventoryDataBuilder = $injector.get('PhysicalInventoryDataBuilder');
            this.PhysicalInventoryLineItemDataBuilder = $injector.get('PhysicalInventoryLineItemDataBuilder');
            this.PhysicalInventoryLineItemAdjustmentDataBuilder = $injector
                .get('PhysicalInventoryLineItemAdjustmentDataBuilder');

            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.LotDataBuilder = $injector.get('LotDataBuilder');
            this.physicalInventoryDraftCacheService = $injector.get('physicalInventoryDraftCacheService');
            this.offlineService = $injector.get('offlineService');
        });

        var orderable1 = new this.OrderableDataBuilder().withFullProductName('Streptococcus Pneumoniae Vaccine II')
                .build(),
            orderable2 = new this.OrderableDataBuilder().build(),
            lot = new this.LotDataBuilder().build(),
            stockAdjustments = [new this.PhysicalInventoryLineItemAdjustmentDataBuilder().build()];

        this.physicalInventoryLineItems = [
            new this.PhysicalInventoryLineItemDataBuilder().withOrderable(orderable1)
                .withStockAdjustments(stockAdjustments)
                .buildAsAdded(),
            new this.PhysicalInventoryLineItemDataBuilder().withOrderable(orderable2)
                .withStockOnHand(null)
                .withQuantity(4)
                .buildAsAdded(),
            new this.PhysicalInventoryLineItemDataBuilder().withOrderable(orderable2)
                .withLot(lot)
                .withStockOnHand(null)
                .withQuantity(null)
                .buildAsAdded()
        ];

        this.draft = new this.PhysicalInventoryDataBuilder().withLineItems(this.physicalInventoryLineItems)
            .build();

        spyOn(this.physicalInventoryDraftCacheService, 'searchDraft').andReturn(this.$q.resolve([this.draft]));
        spyOn(this.physicalInventoryDraftCacheService, 'getDraft').andReturn(this.$q.resolve(this.draft));
        spyOn(this.offlineService, 'isOffline').andReturn(false);
    });

    describe('getDraft', function() {

        it('should get draft', function() {
            var result;

            this.$httpBackend.when('GET', this.stockmanagementUrlFactory('/api/physicalInventories?program='
                + this.draft.programId +
                '&facility=' + this.draft.facilityId + '&isDraft=true')).respond(200, [this.draft]);

            this.physicalInventoryService.getDraft(this.draft.programId, this.draft.facilityId)
                .then(function(response) {
                    result = response;
                });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(result[0].programId).toBe(this.draft.programId);
        });

        it('should get draft by program and facility while offline', function() {
            var result;

            this.offlineService.isOffline.andReturn(true);

            this.physicalInventoryService.getDraft(this.draft.programId, this.draft.facilityId).then(function(draft) {
                result = draft;
            });
            this.$rootScope.$apply();

            expect(result[0]).toBe(this.draft);
        });
    });

    describe('getPhysicalInventory', function() {

        it('should get physical inventory by id  while offline', function() {
            var result;

            this.offlineService.isOffline.andReturn(true);

            this.physicalInventoryService.getPhysicalInventory(this.draft.id).then(function(response) {
                result = response;
            });
            this.$rootScope.$apply();

            expect(result.id).toBe(this.draft.id);
        });

        it('should get physical inventory from local storage if it was modified', function() {
            var result;

            this.draft.$modified = true;
            this.physicalInventoryDraftCacheService.getDraft.andReturn(this.$q.resolve(this.draft));

            this.physicalInventoryService.getPhysicalInventory(this.draft.id).then(function(response) {
                result = response;
            });
            this.$rootScope.$apply();

            expect(result.id).toBe(this.draft.id);
        });

        it('should get physical inventory by id', function() {
            var result;

            this.physicalInventoryService.getPhysicalInventory(this.draft).then(function(response) {
                result = response;
            });

            this.$rootScope.$apply();

            expect(result.id).toBe(this.draft.id);
        });
    });

    it('should create new draft', function() {
        var result;

        this.$httpBackend.when('POST', this.stockmanagementUrlFactory('/api/physicalInventories'))
            .respond(function(method, url, data) {
                //return whatever was passed to http backend.
                return [201, data];
            });

        this.physicalInventoryService.createDraft(this.draft.programId, this.draft.facilityId).then(function(response) {
            result = response;
        });

        this.$httpBackend.flush();
        this.$rootScope.$apply();

        expect(result.programId).toBe(this.draft.programId);
        expect(result.facilityId).toBe(this.draft.facilityId);
    });

    describe('search', function() {
        it('should get all line items when keyword and active is empty', function() {
            expect(this.physicalInventoryService.search('', this.physicalInventoryLineItems, null))
                .toEqual(this.physicalInventoryLineItems);
        });

        it('should search by productCode', function() {
            expect(this.physicalInventoryService.search('c2', this.physicalInventoryLineItems, null))
                .toEqual([this.physicalInventoryLineItems[1], this.physicalInventoryLineItems[2]]);
        });

        it('should search by productFullName', function() {
            expect(this.physicalInventoryService.search('Streptococcus', this.physicalInventoryLineItems, null))
                .toEqual([this.physicalInventoryLineItems[0]]);
        });

        it('should search by stockOnHand', function() {
            expect(this.physicalInventoryService.search('233', this.physicalInventoryLineItems, null))
                .toEqual([this.physicalInventoryLineItems[0]]);
        });

        it('should search by quantity', function() {
            expect(this.physicalInventoryService.search('4', this.physicalInventoryLineItems, null))
                .toEqual([this.physicalInventoryLineItems[1]]);
        });

        it('should search by lotCode', function() {
            expect(this.physicalInventoryService.search('L1', this.physicalInventoryLineItems, null))
                .toEqual([this.physicalInventoryLineItems[2]]);
        });

        it('should get all line items without lot info', function() {
            spyOn(this.messageService, 'get');
            this.messageService.get.andReturn('No lot defined');

            expect(this.physicalInventoryService.search('No lot defined', this.physicalInventoryLineItems, null))
                .toEqual([this.physicalInventoryLineItems[0], this.physicalInventoryLineItems[1]]);
        });

        it('should search by expirationDate', function() {
            expect(this.physicalInventoryService.search('02/05/2017', this.physicalInventoryLineItems, null))
                .toEqual([this.physicalInventoryLineItems[2]]);
        });
    });

    it('should save physical inventory draft', function() {
        this.$httpBackend.when('PUT', this.stockmanagementUrlFactory('/api/physicalInventories/' + this.draft.id))
            .respond(function(method, url, data) {
                //return whatever was passed to http backend.
                return [200, data];
            });

        var result = [];
        this.physicalInventoryService.saveDraft(this.draft).then(function(response) {
            result = response;
        });

        this.$httpBackend.flush();
        this.$rootScope.$apply();

        expect(result.lineItems.length).toBe(3);
        expect(result.lineItems[0].quantity).toBe(3);
        expect(result.lineItems[1].quantity).toBe(4);
        expect(result.lineItems[2].quantity).toBe(null);
    });

    //eslint-disable-next-line jasmine/missing-expect
    it('should delete physical inventory draft', function() {
        this.$httpBackend
            .expectDELETE(this.stockmanagementUrlFactory('/api/physicalInventories/' + this.draft.id))
            .respond(200);

        this.physicalInventoryService.deleteDraft(this.draft.id);
        this.$httpBackend.flush();
    });

    afterEach(function() {
        this.$httpBackend.verifyNoOutstandingExpectation();
        this.$httpBackend.verifyNoOutstandingRequest();
    });
});
