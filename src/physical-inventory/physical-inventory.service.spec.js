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

describe('physicalInventoryService', function () {

  var q, rootScope, httpBackend, service, stockmanagementUrlFactory;

  beforeEach(function () {
    module('physical-inventory');

    inject(function (_stockmanagementUrlFactory_, _physicalInventoryService_, $httpBackend, $rootScope, $q) {
      httpBackend = $httpBackend;
      rootScope = $rootScope;
      q = $q;
      stockmanagementUrlFactory = _stockmanagementUrlFactory_;
      service = _physicalInventoryService_;
    });
  });

  it('should get all drafts', function () {
    var result = [];
    var draft1 = {programId: '1', starter: false};
    var draft2 = {programId: '2', starter: true};

    httpBackend.when('GET', stockmanagementUrlFactory('/api/physicalInventories/draft?program=1&facility=2'))
      .respond(200, draft1);
    httpBackend.when('GET', stockmanagementUrlFactory('/api/physicalInventories/draft?program=2&facility=2'))
      .respond(200, draft2);


    service.getDrafts(['1', '2'], '2').then(function (drafts) {
      result = _.flatten(drafts);
    });

    httpBackend.flush();
    rootScope.$apply();

    expect(result.length).toBe(2);
    expect(result[0].programId).toBe('1');
    expect(result[1].starter).toBeTruthy();
  });

});
