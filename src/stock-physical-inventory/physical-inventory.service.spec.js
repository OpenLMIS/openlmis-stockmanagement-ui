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

describe('physicalInventoryService', function() {

    var $rootScope, $httpBackend, physicalInventoryService, stockmanagementUrlFactory;

    beforeEach(function() {
        module('stock-physical-inventory');

        inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
            physicalInventoryService = $injector.get('physicalInventoryService');
        });
    });

    it('should get draft', function () {
        var result,
            facilityId = '2';
            draft = {programId: '1'};

        $httpBackend.when('GET', stockmanagementUrlFactory('/api/physicalInventories?program=' + draft.programId +
            '&facility=' + facilityId + '&isDraft=true')).respond(200, [draft]);

        physicalInventoryService.getDraft(draft.programId, facilityId).then(function(response) {
            result = response;
        });

        $httpBackend.flush();
        $rootScope.$apply();

        expect(result[0].programId).toBe(draft.programId);
    });

    it('should get physical inventory', function () {
        var result,
            physicalInventory = {id: '1'};

        $httpBackend.when('GET', stockmanagementUrlFactory('/api/physicalInventories/' + physicalInventory.id))
            .respond(200, physicalInventory);

        physicalInventoryService.getPhysicalInventory(physicalInventory.id).then(function(response) {
            result = response;
        });

        $httpBackend.flush();
        $rootScope.$apply();

        expect(result.id).toBe(physicalInventory.id);
    });

    it('should create new draft', function () {
        var result,
            draft = {
                facilityId: '2',
                programId: '1'
                };

        $httpBackend.when('POST', stockmanagementUrlFactory('/api/physicalInventories'))
          .respond(function (method, url, data) {
            return [201, data];//return whatever was passed to http backend.
          });

        physicalInventoryService.createDraft(draft.programId, draft.facilityId).then(function(response) {
            result = response;
        });

        $httpBackend.flush();
        $rootScope.$apply();

        expect(result.programId).toBe(draft.programId);
        expect(result.facilityId).toBe(draft.facilityId);
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
