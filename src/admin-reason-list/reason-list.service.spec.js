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

  var rootScope, httpBackend, service, stockmanagementUrlFactory;

  beforeEach(function () {
    module('admin-reason-list');

    inject(
      function (_stockmanagementUrlFactory_, _reasonService_, _$httpBackend_, _$rootScope_) {
        httpBackend = _$httpBackend_;
        rootScope = _$rootScope_;
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

  it('should get all reason categories', function () {
    var reasonCategories = ["AD_HOC", "ADJUSTMENT"];
    httpBackend.when('GET', stockmanagementUrlFactory('/api/reasonCategories'))
      .respond(200, reasonCategories);

    var result = [];
    service.getReasonCategories().then(function (data) {
      result = data;
    });

    httpBackend.flush();
    rootScope.$apply();

    expect(angular.equals(result, reasonCategories)).toBeTruthy();
  });

  it('should get all reason types', function () {
    var reasonTypes = ["CREDIT", "DEBIT"];
    httpBackend.when('GET', stockmanagementUrlFactory('/api/reasonTypes'))
      .respond(200, reasonTypes);

    var result = [];
    service.getReasonTypes().then(function (data) {
      result = data;
    });

    httpBackend.flush();
    rootScope.$apply();

    expect(angular.equals(result, reasonTypes)).toBeTruthy();
  });

  it('should create new reason', function () {
    var reason = {
      "name": "Test Reason",
      "reasonCategory": "AD_HOC",
      "reasonType": "CREDIT",
      "isFreeTextAllowed": false
    };

    httpBackend.when('POST', stockmanagementUrlFactory('/api/stockCardLineItemReasons'))
      .respond(201, reason);

    var result = [];
    service.createReason(reason).then(function (response) {
      result = response;
    });

    httpBackend.flush();
    rootScope.$apply();

    expect(result.name).toEqual(reason.name);
    expect(result.reasonCategory).toEqual(reason.reasonCategory);
    expect(result.reasonType).toEqual(reason.reasonType);
    expect(result.isFreeTextAllowed).toEqual(reason.isFreeTextAllowed);
  });
});

