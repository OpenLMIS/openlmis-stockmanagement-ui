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
        orderable1, orderable2, lot, stockAdjustment, physicalInventoryLineItems;

    beforeEach(function() {
        module('stock-physical-inventory');
        module('stock-reasons');

        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
            physicalInventoryService = $injector.get('physicalInventoryService');
            messageService = $injector.get('messageService');

            PhysicalInventoryDataBuilder = $injector.get('PhysicalInventoryDataBuilder');
            PhysicalInventoryLineItemDataBuilder = $injector.get('PhysicalInventoryLineItemDataBuilder');
            PhysicalInventoryLineItemAdjustmentDataBuilder = $injector.get('PhysicalInventoryLineItemAdjustmentDataBuilder');
        });

        orderable1 = {
            "id": "c9e65f02-f84f-4ba2-85f7-e2cb6f0989af",
            "productCode": "C1",
            "fullProductName": "Streptococcus Pneumoniae Vaccine II",
            "dispensable": {
                "dispensingUnit": ""
            }
        };

        orderable2 = {
            "id": "2400e410-b8dd-4954-b1c0-80d8a8e785fc",
            "productCode": "C2",
            "fullProductName": "Acetylsalicylic Acid",
            "dispensable": {
                "dispensingUnit": ""
            }
        };

        lot = {
            "lotCode": "L1",
            "expirationDate": "2017-05-02T05:59:51.993Z"
        };

        stockAdjustment = new PhysicalInventoryLineItemAdjustmentDataBuilder().build();

        physicalInventoryLineItems = [
            new PhysicalInventoryLineItemDataBuilder().withOrderable(orderable1).withStockAdjustments([stockAdjustment]).buildAsAdded(),
            new PhysicalInventoryLineItemDataBuilder().withOrderable(orderable2).withStockOnHand(null).withQuantity(4).buildAsAdded(),
            new PhysicalInventoryLineItemDataBuilder().withOrderable(orderable2).withLot(lot).withStockOnHand(null).withQuantity(null).buildAsAdded()
        ];
    });

    it('should get draft', function () {
        var result,
            draft = new PhysicalInventoryDataBuilder().withLineItems(physicalInventoryLineItems).build();

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
        var result,
            physicalInventory = new PhysicalInventoryDataBuilder().withLineItems(physicalInventoryLineItems).build();

        $httpBackend.when('GET', stockmanagementUrlFactory('/api/physicalInventories/' + physicalInventory.id))
            .respond(200, physicalInventory);

        physicalInventoryService.getPhysicalInventory(physicalInventory.id).then(function(response) {
            result = response;
        });

        $httpBackend.flush();
        $rootScope.$apply();

        expect(result.id).toBe(physicalInventory.id);
    });

    it('should create new draft', function () {
        var result,
            draft = new PhysicalInventoryDataBuilder().withLineItems(physicalInventoryLineItems).build();

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
        var draft = new PhysicalInventoryDataBuilder().withLineItems(physicalInventoryLineItems).build();

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
        var draft = new PhysicalInventoryDataBuilder().withLineItems(physicalInventoryLineItems).build();

        $httpBackend
        .expectDELETE(stockmanagementUrlFactory('/api/physicalInventories/' + draft.id))
        .respond(200);

        physicalInventoryService.deleteDraft(draft.id);
        $httpBackend.flush();
    });

    it("should submit physical inventory", function () {
        var draft = new PhysicalInventoryDataBuilder().withLineItems(physicalInventoryLineItems).build(),
            result,
            i,
            j;

        $httpBackend.when('POST', stockmanagementUrlFactory('/api/stockEvents'))
            .respond(function (method, url, data) {
                return [200, data];//return whatever was passed to http backend.
            });

        physicalInventoryService.submitPhysicalInventory(draft).then(function (response) {
            result = response;
        });

        $httpBackend.flush();
        $rootScope.$apply();

        expect(result.id).toBeUndefined();
        expect(result.resourceId).toEqual(draft.id);

        for (i = 0; i < draft.lineItems.length; i += 1) {
            expect(result.lineItems[i].orderableId).toEqual(draft.lineItems[i].orderable.id);

            if (draft.lineItems[i].lot) {
                expect(result.lineItems[i].lotId).toEqual(draft.lineItems[i].lot.id);
            } else {
                expect(result.lineItems[i].lotId).toEqual(null);
            }

            expect(result.lineItems[i].quantity).toEqual(draft.lineItems[i].quantity);
            expect(result.lineItems[i].occurredDate).toEqual(draft.occurredDate);
            expect(result.lineItems[i].vvmStatus).toEqual(draft.lineItems[i].vvmStatus);

            for (j = 0; j < draft.lineItems[i].stockAdjustments.length; j += 1) {
                expect(result.lineItems[i].stockAdjustments[j].reasonId).toEqual(draft.lineItems[i].stockAdjustments[j].reason.id);
                expect(result.lineItems[i].stockAdjustments[j].quantity).toEqual(draft.lineItems[i].stockAdjustments[j].quantity);
            }
        }
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
