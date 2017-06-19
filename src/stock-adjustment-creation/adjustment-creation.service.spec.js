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

describe('stockAdjustmentCreationService', function () {

  var service, httpBackend, rootScope, stockmanagementUrlFactory, messageService,
    lineItem1, lineItem2, lineItem3;

  beforeEach(function () {
    module('stock-adjustment-creation');

    inject(function (_stockAdjustmentCreationService_, _$httpBackend_, _$rootScope_,
                     _stockmanagementUrlFactory_, _messageService_) {
      service = _stockAdjustmentCreationService_;
      httpBackend = _$httpBackend_;
      rootScope = _$rootScope_;
      stockmanagementUrlFactory = _stockmanagementUrlFactory_;
      messageService = _messageService_;

      lineItem1 = {
        "orderable": {
          "id": "c9e65f02-f84f-4ba2-85f7-e2cb6f0989af",
          "productCode": "C1",
          "fullProductName": "Streptococcus Pneumoniae Vaccine II",
          "dispensable": {
            "dispensingUnit": ""
          }
        },
        "stockOnHand": 100,
        "quantity": 233,
        "reason": {"id": 'r1', "name": "clinic return"},
        "reasonFreeText": "free",
        "occurredDate": "2016-04-01T03:23:34.000Z",
        "assignment": {"name": "WH-001"},
        "srcDstFreeText": "good source"
      };
      lineItem2 = {
        "orderable": {
          "id": "2400e410-b8dd-4954-b1c0-80d8a8e785fc",
          "productCode": "C2",
          "fullProductName": "Acetylsalicylic Acid",
          "dispensable": {
            "dispensingUnit": "each"
          }
        },
        "stockOnHand": null,
        "quantity": 4,
        "reason": {"id": 'r1', "name": "clinic return"},
        "reasonFreeText": "donate",
        "occurredDate": "2017-04-01T04:23:34.000Z"
      };
      lineItem3 = {
        "orderable": {
          "id": "2400e410-b8dd-4954-b1c0-80d8a8e785fc",
          "productCode": "C2",
          "fullProductName": "Acetylsalicylic Acid",
          "dispensable": {
            "dispensingUnit": "each"
          }
        },
        "stockOnHand": 1000,
        "quantity": null,
        "reason": {"id": 'r2', "name": "damage"},
        "occurredDate": "2017-04-01T05:23:34.000Z",
        "assignment": {"name": "WH-xyz"},
        "srcDstFreeText": "bad destination"
      };

    });
  });

  describe('search', function () {
    var addedItems;

    beforeEach(function () {
      addedItems = [lineItem1, lineItem2, lineItem3];
    });

    it("should search by productCode", function () {
      expect(angular.equals(service.search('c2', addedItems), [lineItem2, lineItem3])).toBeTruthy();
    });

    it("should search by fullProductName", function () {
      spyOn(messageService, 'get').andCallFake(function (message) {
        if (message === 'stockProductName.productWithDispensingUnit') {
          return 'Acetylsalicylic Acid - each';
        } else {
          return message;
        }
      });
      expect(angular.equals(service.search('Vaccine', addedItems), [lineItem1])).toBeTruthy();
    });

    it("should search by stockOnHand", function () {
      expect(angular.equals(service.search('10', addedItems), [lineItem1, lineItem3])).toBeTruthy();
    });

    it("should search by reason name", function () {
      expect(angular.equals(service.search('damage', addedItems), [lineItem3])).toBeTruthy();
    });

    it("should search by reason free text", function () {
      expect(angular.equals(service.search('donate', addedItems), [lineItem2])).toBeTruthy();
    });

    it("should search by quantity", function () {
      expect(angular.equals(service.search('233', addedItems), [lineItem1])).toBeTruthy();
    });

    it("should search by occurredDate", function () {
      expect(angular.equals(service.search('01/04/2017', addedItems), [lineItem2, lineItem3])).toBeTruthy();
    });

    it("should search by assignment name", function () {
      expect(service.search('wh', addedItems)).toEqual([lineItem1, lineItem3]);
    });

    it("should search by assignment free text", function () {
      expect(service.search('destination', addedItems)).toEqual([lineItem3]);
    });

    it("should return all items when keyword is empty", function () {
      expect(angular.equals(service.search('', addedItems), [lineItem1, lineItem2, lineItem3])).toBeTruthy();
    });

  });

  describe("submit adjustments", function () {
    it("should submit adjustments", function () {
      var programId = "p01";
      var facilityId = "f01";
      var orderableId = "o01";
      var reasonId = "r01";
      var date = new Date();
      var sourceId = 'wh-001';
      var srcDstFreeText = 'donate';
      var lineItems = [{
        orderable: {id: orderableId},
        quantity: 100,
        occurredDate: date,
        vvmStatus: 'STAGE_1',
        reason: {id: reasonId, isFreeTextAllowed: false},
        assignment: {node: {id: sourceId}},
        srcDstFreeText: srcDstFreeText
      }];

      var postData = undefined;
      httpBackend.when('POST', stockmanagementUrlFactory('/api/stockEvents'))
        .respond(function (method, url, data) {
          postData = data;
          return [201, 'e01'];
        });

      service.submitAdjustments(programId, facilityId, lineItems, {state: 'receive'});
      httpBackend.flush();

      var event = {
        programId: programId,
        facilityId: facilityId,
        lineItems: [{
          orderableId: orderableId,
          lotId: null,
          quantity: 100,
          extraData: {
            vvmStatus: 'STAGE_1'
          },
          occurredDate: date.toISOString(),
          reasonId: reasonId,
          sourceId: sourceId,
          sourceFreeText: srcDstFreeText
        }]
      };

      expect(angular.equals(JSON.stringify(event), postData)).toBeTruthy();
    });
  });
})
;
