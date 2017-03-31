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

describe('reasonService', function () {

  var q, rootScope, httpBackend, service, stockmanagementUrlFactory;

  beforeEach(function () {
    module('admin-reason-list');

    inject(function (_stockmanagementUrlFactory_, _reasonService_, _$httpBackend_, _$rootScope_, _$q_) {
      httpBackend = _$httpBackend_;
      rootScope = _$rootScope_;
      q = _$q_;
      stockmanagementUrlFactory = _stockmanagementUrlFactory_;
      service = _reasonService_;
    });
  });

  it('should get all reasons', function () {
    var reason = {
      id: "1",
      isFreeTextAllowed: false,
      name: "Good Reason",
      reasonCategory: "AD_HOC",
      reasonType: "CREDIT"
    };
    httpBackend.when('GET', stockmanagementUrlFactory('/api/stockCardLineItemReasons'))
      .respond(200, [reason]);

    var result = [];
    service.getAll().then(function (data) {
      result = data;
    });

    httpBackend.flush();
    rootScope.$apply();

    expect(result.length).toBe(1);
    expect(angular.equals(result[0], reason)).toBeTruthy();
  });
});

