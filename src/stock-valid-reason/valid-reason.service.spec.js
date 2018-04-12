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

describe('validReasonService', function() {

    var validReasonService, $httpBackend, $rootScope, stockmanagementUrlFactory, reasons, result, ValidReasonAssignmentDataBuilder;

    beforeEach(function() {
        module('stock-valid-reason');

        inject(function($injector) {
            validReasonService = $injector.get('validReasonService');
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
            ValidReasonAssignmentDataBuilder = $injector.get('ValidReasonAssignmentDataBuilder');
        });

        reasons = [
            new ValidReasonAssignmentDataBuilder().build(),
            new ValidReasonAssignmentDataBuilder().build()
        ];
    });

    describe('query', function() {

        var facilityTypeId = 'facility-type-id',
            programId = 'program-id';

        it('should resolve promise when request is successfull', function() {
            $httpBackend.when('GET', stockmanagementUrlFactory(
                '/api/validReasons' +
                '?facilityType=' + facilityTypeId +
                '&program=' + programId))
            .respond(200, reasons);

            validReasonService.query(programId, facilityTypeId)
            .then(function(response) {
                result = response;
            });

            $httpBackend.flush();
            $rootScope.$apply();

            expect(result[0].id).toBe(reasons[0].id);
            expect(result[1].id).toBe(reasons[1].id);
        });

        it('should reject promise when request fails', function() {
            $httpBackend.when('GET', stockmanagementUrlFactory(
                '/api/validReasons' +
                '?facilityType=' + facilityTypeId +
                '&program=' + programId))
            .respond(400);

            validReasonService.query(programId, facilityTypeId)
            .catch(function() {
                result = 'rejected';
            });

            $httpBackend.flush();
            $rootScope.$apply();

            expect(result).not.toBeUndefined();
        });
    });

    describe('create', function() {

        it('should resolve promise when request is successfull', function() {
            $httpBackend.when('POST', stockmanagementUrlFactory('/api/validReasons'))
            .respond(200, reasons[0]);

            validReasonService.create(reasons[0])
            .then(function(response) {
                result = response;
            });

            $httpBackend.flush();
            $rootScope.$apply();

            expect(result.id).toBe(reasons[0].id);
        });

        it('should reject promise when request fails', function() {
            $httpBackend.when('POST', stockmanagementUrlFactory('/api/validReasons'))
            .respond(400);

            validReasonService.create(reasons[0])
            .catch(function() {
                result = 'rejected';
            });

            $httpBackend.flush();
            $rootScope.$apply();

            expect(result).not.toBeUndefined();
        });
    });

    describe('remove', function() {

        var reasonId = 'reason-id';

        it('should resolve promise when request is successfull', function() {
            $httpBackend.when('DELETE', stockmanagementUrlFactory('/api/validReasons/' + reasonId))
            .respond(200);

            validReasonService.remove(reasonId)
            .then(function() {
                result = 'resolved';
            });

            $httpBackend.flush();
            $rootScope.$apply();

            expect(result).not.toBeUndefined();
        });

        it('should reject promise when request fails', function() {
            $httpBackend.when('DELETE', stockmanagementUrlFactory('/api/validReasons/' + reasonId))
            .respond(400);

            validReasonService.remove(reasonId)
            .catch(function() {
                result = 'rejected';
            });

            $httpBackend.flush();
            $rootScope.$apply();

            expect(result).not.toBeUndefined();
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
