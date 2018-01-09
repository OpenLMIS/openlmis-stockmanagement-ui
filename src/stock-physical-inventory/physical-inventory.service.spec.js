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

    var $rootScope, $httpBackend, physicalInventoryService, stockmanagementUrlFactory, messageService,
        PhysicalInventoryDataBuilder, PhysicalInventoryLineItemDataBuilder, PhysicalInventoryLineItemAdjustmentDataBuilder,
        OrderableDataBuilder, LotDataBuilder, physicalInventoryLineItems, draft;

    beforeEach(function() {
        module('stock-physical-inventory');

        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
            physicalInventoryService = $injector.get('physicalInventoryService');
            messageService = $injector.get('messageService');

            PhysicalInventoryDataBuilder = $injector.get('PhysicalInventoryDataBuilder');
            PhysicalInventoryLineItemDataBuilder = $injector.get('PhysicalInventoryLineItemDataBuilder');
            PhysicalInventoryLineItemAdjustmentDataBuilder = $injector.get('PhysicalInventoryLineItemAdjustmentDataBuilder');

            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            LotDataBuilder = $injector.get('LotDataBuilder');
        });

        var orderable1 = new OrderableDataBuilder().withFullProductName('Streptococcus Pneumoniae Vaccine II').build(),
            orderable2 = new OrderableDataBuilder().build(),
            lot = new LotDataBuilder().build(),
            stockAdjustments = [new PhysicalInventoryLineItemAdjustmentDataBuilder().build()];

        physicalInventoryLineItems = [
            new PhysicalInventoryLineItemDataBuilder().withOrderable(orderable1).withStockAdjustments(stockAdjustments).buildAsAdded(),
            new PhysicalInventoryLineItemDataBuilder().withOrderable(orderable2).withStockOnHand(null).withQuantity(4).buildAsAdded(),
            new PhysicalInventoryLineItemDataBuilder().withOrderable(orderable2).withLot(lot).withStockOnHand(null).withQuantity(null).buildAsAdded()
        ];

        draft = new PhysicalInventoryDataBuilder().withLineItems(physicalInventoryLineItems).build();
    });

    it('should get draft', function () {
        var result;

        $httpBackend.when('GET', stockmanagementUrlFactory('/api/physicalInventories?program=' + draft.programId +
            '&facility=' + draft.facilityId + '&isDraft=true')).respond(200, [draft]);

        physicalInventoryService.getDraft(draft.programId, draft.facilityId).then(function(response) {
            result = response;
        });

        $httpBackend.flush();
        $rootScope.$apply();

        expect(result[0].programId).toBe(draft.programId);
    });

    it('should get physical inventory', function () {
        var result;

        $httpBackend.when('GET', stockmanagementUrlFactory('/api/physicalInventories/' + draft.id))
            .respond(200, draft);

        physicalInventoryService.getPhysicalInventory(draft.id).then(function(response) {
            result = response;
        });

        $httpBackend.flush();
        $rootScope.$apply();

        expect(result.id).toBe(draft.id);
    });

    it('should create new draft', function () {
        var result;

        $httpBackend.when('POST', stockmanagementUrlFactory('/api/physicalInventories'))
          .respond(function (method, url, data) {
            return [201, data];//return whatever was passed to http backend.
          });

        physicalInventoryService.createDraft(draft.programId, draft.facilityId).then(function(response) {
            result = response;
        });

        $httpBackend.flush();
        $rootScope.$apply();

        expect(result.programId).toBe(draft.programId);
        expect(result.facilityId).toBe(draft.facilityId);
    });

    describe('search', function () {
        it('should get all line items when keyword is empty', function () {
            expect(physicalInventoryService.search('', physicalInventoryLineItems)).toEqual(physicalInventoryLineItems);
        });

        it("should search by productCode", function () {
            expect(physicalInventoryService.search('c2', physicalInventoryLineItems)).toEqual([physicalInventoryLineItems[1], physicalInventoryLineItems[2]]);
        });

        it("should search by productFullName", function () {
            expect(physicalInventoryService.search('Streptococcus', physicalInventoryLineItems)).toEqual([physicalInventoryLineItems[0]]);
        });

        it("should search by stockOnHand", function () {
            expect(physicalInventoryService.search('233', physicalInventoryLineItems)).toEqual([physicalInventoryLineItems[0]]);
        });

        it("should search by quantity", function () {
            expect(physicalInventoryService.search('4', physicalInventoryLineItems)).toEqual([physicalInventoryLineItems[1]]);
        });

        it("should search by lotCode", function () {
            expect(physicalInventoryService.search('L1', physicalInventoryLineItems)).toEqual([physicalInventoryLineItems[2]]);
        });

        it("should get all line items without lot info", function () {
            spyOn(messageService, 'get');
            messageService.get.andReturn('No lot defined');
            expect(physicalInventoryService.search('No lot defined', physicalInventoryLineItems)).toEqual([physicalInventoryLineItems[0], physicalInventoryLineItems[1]]);
        });

        it("should search by expirationDate", function () {
            expect(physicalInventoryService.search('02/05/2017', physicalInventoryLineItems)).toEqual([physicalInventoryLineItems[2]]);
        });
    });

    it("should save physical inventory draft", function () {
        $httpBackend.when('PUT', stockmanagementUrlFactory('/api/physicalInventories/' + draft.id))
            .respond(function (method, url, data) {
                return [200, data];//return whatever was passed to http backend.
            });

        var result = [];
        physicalInventoryService.saveDraft(draft).then(function (response) {
            result = response;
        });

        $httpBackend.flush();
        $rootScope.$apply();

        expect(result.lineItems.length).toBe(3);
        expect(result.lineItems[0].quantity).toBe(3);
        expect(result.lineItems[1].quantity).toBe(4);
        expect(result.lineItems[2].quantity).toBe(null);
    });

    it("should delete physical inventory draft", function () {
        $httpBackend
            .expectDELETE(stockmanagementUrlFactory('/api/physicalInventories/' + draft.id))
            .respond(200);

        physicalInventoryService.deleteDraft(draft.id);
        $httpBackend.flush();
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
