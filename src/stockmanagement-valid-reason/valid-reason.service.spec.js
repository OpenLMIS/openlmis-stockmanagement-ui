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

describe('validReasonService', function () {

  var rootScope, httpBackend, service, stockmanagementUrlFactory;

  beforeEach(function () {
    module('admin-reason-list');

    inject(
      function (_stockmanagementUrlFactory_, _validReasonService_, _$httpBackend_, _$rootScope_) {
        httpBackend = _$httpBackend_;
        rootScope = _$rootScope_;
        stockmanagementUrlFactory = _stockmanagementUrlFactory_;
        service = _validReasonService_;
      });
  });

  it('should create new valid reason', function () {
    var validReason = {
      "programId": "programId",
      "facilityTypeId": "ftId",
      "reason": {"id": "reasonId"}
    };

    httpBackend.when('POST', stockmanagementUrlFactory('/api/validReasons'))
      .respond(201, validReason);

    var result = {};
    service.createValidReason(validReason).then(function (response) {
      result = response;
    });

    httpBackend.flush();
    rootScope.$apply();

    expect(result.programId).toEqual(validReason.programId);
    expect(result.facilityTypeId).toEqual(validReason.facilityTypeId);
    expect(result.reason.id).toEqual(validReason.reason.id);
  });

  it('should remove a valid reason', function () {

    httpBackend.when('DELETE', stockmanagementUrlFactory('/api/validReasons/1'))
      .respond(200);

    var result = {};
    service.removeValidReason(1).then(function () {
      result = "OK";
    });

    httpBackend.flush();
    rootScope.$apply();

    expect(result).toEqual("OK");
  });

  afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
  });

});

