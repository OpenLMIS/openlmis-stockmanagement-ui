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

  var service, httpBackend, rootScope, stockmanagementUrlFactory, messageService;

  beforeEach(function () {
    module('stock-card-summaries');

    inject(function (_stockCardSummariesService_, _$httpBackend_, _$rootScope_,
                     _stockmanagementUrlFactory_, _messageService_) {
      service = _stockCardSummariesService_;
      messageService = _messageService_;
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
    var summaries = {
      "totalPages": 1,
      "content": [summary1, summary2]
    };
    var programId = 'pId';
    var facilityId = 'fId';
    var pageSize = 100;

    var urlParams = '?facility=' + facilityId + '&program=' + programId + '&size=' + pageSize;
    httpBackend.when('GET', stockmanagementUrlFactory('/api/stockCardSummaries' + urlParams)).respond(200, summaries);

    var result = [];
    service.getStockCardSummaries(programId, facilityId).then(function (data) {
      result = data;
    });

    httpBackend.flush();

    expect(result.length).toBe(2);
    expect(angular.equals(result, [summary1, summary2])).toBeTruthy();
  });

  describe('search', function () {
    var item1, item2, item3, items;

    beforeEach(function () {
      item1 = {
        "stockOnHand": 233,
        "orderable": {
          "productCode": "C1",
          "fullProductName": "Acetylsalicylic Acid",
          "dispensable": {
            "dispensingUnit": ""
          }
        },
        "lot": {"lotCode": "LC0006", "expirationDate": "2016-06-30T08:06:08.454Z"},
        "lastUpdate": "2017-04-25T08:06:08.454Z"
      };

      item2 = {
        "stockOnHand": 23,
        "orderable": {
          "productCode": "C2",
          "fullProductName": "Streptococcus Pneumoniae Vaccine",
          "dispensable": {
            "dispensingUnit": ""
          }
        },
        "lot": {"lotCode": "LC0003", "expirationDate": "2016-06-30T08:06:08.454Z"},
        "lastUpdate": "2018-04-25T08:06:08.454Z"
      };

      item3 = {
        "stockOnHand": 30,
        "orderable": {
          "productCode": "C3",
          "fullProductName": "Levora",
          "dispensable": {
            "dispensingUnit": ""
          }
        },
        "lot": null,
        "lastUpdate": "2019-04-25T08:06:08.454Z"
      };

      items = [item1, item2, item3];
    });

    it('should search by productCode', function () {
      expect(service.search('C3', items)).toEqual([item3]);
    });

    it('should search by fullProductName', function () {
      expect(service.search('Vaccine', items)).toEqual([item2]);
    });

    it('should search by stockOnHand', function () {
      expect(service.search('23', items)).toEqual([item1, item2]);
    });

    it('should search by lotCode', function () {
      spyOn(messageService, 'get');
      messageService.get.andReturn('No lot defined');

      expect(service.search('LC', items)).toEqual([item1, item2]);
      expect(service.search('No lot defined', items)).toEqual([item3]);
    });

    it('should search by lot expirationDate', function () {
      expect(service.search('30/06/2016', items)).toEqual([item1, item2]);
    });

    it('should search by lastUpdate', function () {
      expect(service.search('25/04', items)).toEqual(items);
    });

    it('should renturn all items when keyword is empty', function () {
      expect(service.search('', items)).toEqual(items);
    });
  });
});
