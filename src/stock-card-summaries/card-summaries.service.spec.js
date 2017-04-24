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
    var summary1 = {
      "stockOnHand": 123,
      "facility": {
        "id": "e6799d64-d10d-4011-b8c2-0e4d4a3f65ce",
        "code": "HC01",
        "name": "Comfort Health Clinic"
      },
    };
    var summary2 = {
      "stockOnHand": 456,
      "facility": {
        "id": "e6799d64-d10d-4011-b8c2-0e4d4a3f65ce",
        "code": "HC01",
        "name": "Comfort Health Clinic"
      },
      lot: {}
    };
    httpBackend.when('GET', stockmanagementUrlFactory('/api/stockCardSummaries?searchOption=ExistingStockCardsOnly'))
      .respond(200, [summary1, summary2]);

    var result = [];
    service.getStockCardSummaries().then(function (data) {
      result = data;
    });

    httpBackend.flush();

    expect(result.length).toBe(2);
    expect(angular.equals(result, [summary1, summary2])).toBeTruthy();
  });
});
