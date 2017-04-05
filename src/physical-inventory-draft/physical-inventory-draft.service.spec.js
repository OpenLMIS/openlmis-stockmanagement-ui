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

  var lineItem1, lineItem2, service, httpBackend, rootScope, stockmanagementUrlFactory;

  beforeEach(function () {
    module('physical-inventory-draft');
    lineItem1 = {
      "orderable": {
        "id": "c9e65f02-f84f-4ba2-85f7-e2cb6f0989af",
        "productCode": "C1",
        "fullProductName": "Streptococcus Pneumoniae Vaccine II"
      },
      "stockOnHand": null,
      "quantity": 3
    };
    lineItem2 = {
      "orderable": {
        "id": "2400e410-b8dd-4954-b1c0-80d8a8e785fc",
        "productCode": "C2",
        "fullProductName": "Acetylsalicylic Acid"
      },
      "stockOnHand": null,
      "quantity": 4
    };

    inject(function (_physicalInventoryDraftService_, _$httpBackend_, _$rootScope_, _stockmanagementUrlFactory_) {
      service = _physicalInventoryDraftService_;
      httpBackend = _$httpBackend_;
      rootScope = _$rootScope_;
      stockmanagementUrlFactory = _stockmanagementUrlFactory_;
    });
  });

  it('should get all line items when keyword is empty', function () {
    expect(service.search('', [lineItem1, lineItem2])).toEqual([lineItem1, lineItem2]);
  });

  it("should search from the full list when keyword is not empty", function () {
    var lineItems = [lineItem1, lineItem2];

    expect(angular.equals(service.search('c2', lineItems), [lineItem2])).toBeTruthy();
  });

  it("should save physical inventory draft", function () {
    var draft = {lineItems: [lineItem1, lineItem2]};

    httpBackend.when('POST', stockmanagementUrlFactory('/api/physicalInventories/draft'))
      .respond(201, draft);

    var result = [];
    service.saveDraft(draft).then(function (response) {
      result = response;
    });

    httpBackend.flush();
    rootScope.$apply();

    expect(result.lineItems.length).toBe(2);
    expect(result.lineItems[0].quantity).toBe(3);
    expect(result.lineItems[1].quantity).toBe(4);
  });
});
