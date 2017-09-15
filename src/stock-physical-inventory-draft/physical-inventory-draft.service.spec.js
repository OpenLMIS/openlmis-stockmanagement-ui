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

describe('physicalInventoryDraftService', function () {

  var lineItem1, lineItem2, lineItem3,
    service, httpBackend, rootScope, stockmanagementUrlFactory, messageService;

  beforeEach(function () {
    module('stock-physical-inventory-draft');
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

    inject(function (_physicalInventoryDraftService_, _$httpBackend_, _$rootScope_,
                     _stockmanagementUrlFactory_, _messageService_) {
      service = _physicalInventoryDraftService_;
      httpBackend = _$httpBackend_;
      rootScope = _$rootScope_;
      stockmanagementUrlFactory = _stockmanagementUrlFactory_;
      messageService = _messageService_;
    });
  });

  describe('search', function () {
    var lineItems;

    beforeEach(function () {
      lineItems = [lineItem1, lineItem2, lineItem3];
    });

    it('should get all line items when keyword is empty', function () {
      expect(service.search('', lineItems)).toEqual(lineItems);
    });

    it("should search by productCode", function () {
      expect(service.search('c2', lineItems)).toEqual([lineItem2, lineItem3]);
    });

    it("should search by productFullName", function () {
      expect(service.search('Streptococcus', lineItems)).toEqual([lineItem1]);
    });

    it("should search by stockOnHand", function () {
      expect(service.search('233', lineItems)).toEqual([lineItem1]);
    });

    it("should search by quantity", function () {
      expect(service.search('4', lineItems)).toEqual([lineItem2]);
    });

    it("should search by lotCode", function () {
      expect(service.search('L1', lineItems)).toEqual([lineItem3]);
    });

    it("should get all line items without lot info", function () {
      spyOn(messageService, 'get');
      messageService.get.andReturn('No lot defined');
      expect(service.search('No lot defined', lineItems)).toEqual([lineItem1, lineItem2]);
    });

    it("should search by expirationDate", function () {
      expect(service.search('02/05/2017', lineItems)).toEqual([lineItem3]);
    });
  });

  xit("should save physical inventory draft", function () {
    var draft = {lineItems: [lineItem1, lineItem2, lineItem3]};

    httpBackend.when('POST', stockmanagementUrlFactory('/api/physicalInventories/draft'))
      .respond(function (method, url, data) {
        return [201, data];//return whatever was passed to http backend.
      });

    var result = [];
    service.saveDraft(draft).then(function (response) {
      result = response;
    });

    httpBackend.flush();
    rootScope.$apply();

    expect(result.lineItems.length).toBe(3);
    expect(result.lineItems[0].quantity).toBe(3);
    expect(result.lineItems[1].quantity).toBe(4);
    expect(result.lineItems[2].quantity).toBe(null);
  });

  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });
});
