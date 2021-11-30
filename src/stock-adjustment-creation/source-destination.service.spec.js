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

describe('sourceDestinationService', function() {
    var PageDataBuilder;

    beforeEach(function() {
        this.offlineService = jasmine.createSpyObj('offlineService', ['isOffline', 'checkConnection']);
        this.storage = jasmine.createSpyObj('offlineStorage', ['put', 'search', 'getAll']);

        var storage = this.storage,
            offlineService = this.offlineService;

        module('stock-adjustment-creation', function($provide) {
            $provide.service('offlineService', function() {
                return offlineService;
            });

            $provide.factory('localStorageFactory', function() {
                return jasmine.createSpy('localStorageFactory').andReturn(storage);
            });
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$httpBackend = $injector.get('$httpBackend');
            this.$rootScope = $injector.get('$rootScope');
            this.stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
            this.sourceDestinationService = $injector.get('sourceDestinationService');
            this.offlineService = $injector.get('offlineService');
            this.alertService = $injector.get('alertService');
            PageDataBuilder = $injector.get('PageDataBuilder');
        });
        spyOn(this.alertService, 'error');

        this.homeFacilityId = 'home-facility-id';

        this.validSources = [
            {
                facilityTypeId: 'fac-type-id-1',
                id: 'source-id-1',
                name: 'source one',
                programId: 'program-id-1',
                facilityId: this.homeFacilityId
            }
        ];

        this.validDestinations = [
            {
                facilityTypeId: 'fac-type-id-1',
                id: 'dest-id-1',
                name: 'destination one',
                programId: 'program-id-1',
                facilityId: this.homeFacilityId
            }
        ];
    });

    describe('getSourceAssignments', function() {

        it('should get source assignments', function() {
            var validSourcesPage;
            validSourcesPage = new PageDataBuilder().withContent(this.validSources)
                .build();
            this.offlineService.isOffline.andReturn(false);

            var url = '/api/validSources'
                + '?programId=' + this.validSources[0].programId
                + '&facilityId=' + this.homeFacilityId
                + '&page=0'
                + '&size=2147483647';

            this.$httpBackend
                .whenGET(this.stockmanagementUrlFactory(url))
                .respond(200, validSourcesPage);

            var result;
            this.sourceDestinationService.getSourceAssignments(this.validSources[0].programId, this.homeFacilityId)
                .then(function(response) {
                    result = response;
                });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(result[0]).toEqual(this.validSources[0]);
        });

        it('should search source assignments while offline', function() {
            this.offlineService.isOffline.andReturn(true);

            var result;

            this.storage.search.andReturn(this.$q.resolve(this.validSources));
            this.sourceDestinationService.getSourceAssignments(this.validSources[0].programId, this.homeFacilityId)
                .then(function(response) {
                    result = response;
                });
            this.$rootScope.$apply();

            expect(this.offlineService.isOffline).toHaveBeenCalled();

            expect(this.storage.search).toHaveBeenCalledWith({
                programId: this.validSources[0].programId,
                facilityId: this.homeFacilityId
            });

            expect(result[0]).toBe(this.validSources[0]);
            expect(this.alertService.error).not.toHaveBeenCalled();
        });

        it('should reject if offline and source assignments not found in local storage', function() {
            this.offlineService.isOffline.andReturn(true);

            this.storage.search.andReturn([]);
            this.sourceDestinationService.getSourceAssignments(this.validSources[0].programId, this.homeFacilityId);
            this.$rootScope.$apply();

            expect(this.offlineService.isOffline).toHaveBeenCalled();
            expect(this.alertService.error).toHaveBeenCalled();
        });
    });

    describe('getDestinationAssignments', function() {

        it('should get destination assignments', function() {
            var validDestinationsPage;
            validDestinationsPage = new PageDataBuilder().withContent(this.validDestinations)
                .build();

            this.offlineService.isOffline.andReturn(false);

            var url = '/api/validDestinations'
                + '?programId=' + this.validDestinations[0].programId
                + '&facilityId=' + this.homeFacilityId
                + '&page=0'
                + '&size=2147483647';

            this.$httpBackend
                .whenGET(this.stockmanagementUrlFactory(url))
                .respond(200, validDestinationsPage);

            var result;
            this.sourceDestinationService
                .getDestinationAssignments(this.validDestinations[0].programId, this.homeFacilityId)
                .then(function(response) {
                    result = response;
                });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(result[0]).toEqual(this.validDestinations[0]);
        });

        it('should search destination assignments while offline', function() {
            this.offlineService.isOffline.andReturn(true);

            var result;

            this.storage.search.andReturn(this.$q.resolve(this.validDestinations));
            this.sourceDestinationService.getDestinationAssignments(this.validDestinations[0].programId,
                this.homeFacilityId)
                .then(function(response) {
                    result = response;
                });
            this.$rootScope.$apply();

            expect(this.offlineService.isOffline).toHaveBeenCalled();

            expect(this.storage.search).toHaveBeenCalledWith({
                programId: this.validSources[0].programId,
                facilityId: this.homeFacilityId
            });

            expect(result[0]).toBe(this.validDestinations[0]);
            expect(this.alertService.error).not.toHaveBeenCalled();
        });

        it('should reject if offline and destination assignments not found in local storage', function() {
            this.offlineService.isOffline.andReturn(true);

            this.storage.search.andReturn([]);
            this.sourceDestinationService.getDestinationAssignments(this.validDestinations[0].programId,
                this.homeFacilityId);
            this.$rootScope.$apply();

            expect(this.offlineService.isOffline).toHaveBeenCalled();
            expect(this.alertService.error).toHaveBeenCalled();
        });
    });

    afterEach(function() {
        this.$httpBackend.verifyNoOutstandingExpectation();
        this.$httpBackend.verifyNoOutstandingRequest();
    });
});
