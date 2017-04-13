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

describe('stockCardSummariesService', function () {

  var service, httpBackend, rootScope, stockmanagementUrlFactory;

  beforeEach(function () {
    module('stock-card-summaries');

    inject(function (_stockCardSummariesService_, _$httpBackend_, _$rootScope_,
                     _stockmanagementUrlFactory_) {
      service = _stockCardSummariesService_;
      httpBackend = _$httpBackend_;
      rootScope = _$rootScope_;
      stockmanagementUrlFactory = _stockmanagementUrlFactory_;
    });
  });

  it('should get stock card summaries', function () {
    var summary = {
      "content": [
        {
          "stockOnHand": 123,
          "facility": {
            "id": "e6799d64-d10d-4011-b8c2-0e4d4a3f65ce",
            "code": "HC01",
            "name": "Comfort Health Clinic"
          },
          "program": {
            "id": "10845cb9-d365-4aaa-badd-b4fa39c6a26a",
            "code": "PRG002",
            "name": "Essential Meds"
          },
          "orderable": {
            "id": "c9e65f02-f84f-4ba2-85f7-e2cb6f0989af",
            "productCode": "C4",
            "fullProductName": "Streptococcus Pneumoniae Vaccine II"
          },
          "lastUpdate": null
        }
      ]
    };

    httpBackend.when('GET', stockmanagementUrlFactory('/api/stockCardSummaries'))
      .respond(200, summary);

    var result = [];
    service.getStockCardSummaries().then(function (data) {
      result = data.content;
    });

    httpBackend.flush();
    rootScope.$apply();

    expect(result.length).toBe(1);
    expect(angular.equals(result, summary.content)).toBeTruthy();
  });
});
