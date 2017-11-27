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

    var $rootScope, $httpBackend, physicalInventoryService, stockmanagementUrlFactory, messageService;

    beforeEach(function() {
        module('stock-physical-inventory');

        lineItem1 = {
            "isAdded": true,
            "orderable": {
                "id": "c9e65f02-f84f-4ba2-85f7-e2cb6f0989af",
                "productCode": "C1",
                "fullProductName": "Streptococcus Pneumoniae Vaccine II",
                "dispensable": {
                    "dispensingUnit": ""
                }
            },
            "stockOnHand": 233,
            "quantity": 3
        };
        lineItem2 = {
            "isAdded": true,
            "orderable": {
                "id": "2400e410-b8dd-4954-b1c0-80d8a8e785fc",
                "productCode": "C2",
                "fullProductName": "Acetylsalicylic Acid",
                "dispensable": {
                    "dispensingUnit": ""
                }
            },
            "stockOnHand": null,
            "quantity": 4
        };
        lineItem3 = {
            "isAdded": true,
            "orderable": {
                "id": "2400e410-b8dd-4954-b1c0-80d8a8e785fc",
                "productCode": "C2",
                "fullProductName": "Acetylsalicylic Acid",
                "dispensable": {
                    "dispensingUnit": ""
                }
            },
            "lot": {
                "lotCode": "L1",
                "expirationDate": "2017-05-02T05:59:51.993Z"
            },
            "stockOnHand": null,
            "quantity": null
        };

        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
            physicalInventoryService = $injector.get('physicalInventoryService');
            messageService = $injector.get('messageService');
        });
    });

    it('should get draft', function () {
        var result,
            facilityId = '2';
            draft = {programId: '1'};

        $httpBackend.when('GET', stockmanagementUrlFactory('/api/physicalInventories?program=' + draft.programId +
            '&facility=' + facilityId + '&isDraft=true')).respond(200, [draft]);

        physicalInventoryService.getDraft(draft.programId, facilityId).then(function(response) {
            result = response;
        });

        $httpBackend.flush();
        $rootScope.$apply();

        expect(result[0].programId).toBe(draft.programId);
    });

    it('should get physical inventory', function () {
        var result,
            physicalInventory = {id: '1'};

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
            draft = {
                facilityId: '2',
                programId: '1'
                };

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
        var lineItems;

        beforeEach(function () {
            lineItems = [lineItem1, lineItem2, lineItem3];
        });

        it('should get all line items when keyword is empty', function () {
            expect(physicalInventoryService.search('', lineItems)).toEqual(lineItems);
        });

        it("should search by productCode", function () {
            expect(physicalInventoryService.search('c2', lineItems)).toEqual([lineItem2, lineItem3]);
        });

        it("should search by productFullName", function () {
            expect(physicalInventoryService.search('Streptococcus', lineItems)).toEqual([lineItem1]);
        });

        it("should search by stockOnHand", function () {
            expect(physicalInventoryService.search('233', lineItems)).toEqual([lineItem1]);
        });

        it("should search by quantity", function () {
            expect(physicalInventoryService.search('4', lineItems)).toEqual([lineItem2]);
        });

        it("should search by lotCode", function () {
            expect(physicalInventoryService.search('L1', lineItems)).toEqual([lineItem3]);
        });

        it("should get all line items without lot info", function () {
            spyOn(messageService, 'get');
            messageService.get.andReturn('No lot defined');
            expect(physicalInventoryService.search('No lot defined', lineItems)).toEqual([lineItem1, lineItem2]);
        });

        it("should search by expirationDate", function () {
            expect(physicalInventoryService.search('02/05/2017', lineItems)).toEqual([lineItem3]);
        });
    });

    it("should save physical inventory draft", function () {
        var draft = {id: 123, lineItems: [lineItem1, lineItem2, lineItem3]};

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
        var draftId = '123';

        $httpBackend
        .expectDELETE(stockmanagementUrlFactory('/api/physicalInventories/' + draftId))
        .respond(200);

        physicalInventoryService.deleteDraft(draftId);
        $httpBackend.flush();
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
